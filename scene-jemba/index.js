import '@babel/polyfill';
import * as TWEEN from '@scripts/js/tween';
import * as THREE from '@scripts/build/three.module.js';
import Stats from '@scripts/jsm/libs/stats.module.js';
import { GUI } from '@scripts/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '@scripts/jsm/controls/OrbitControls.js';
import { ColladaLoader } from '@scripts/jsm/loaders/ColladaLoader.js';

import { addEvents } from '@scripts/onDocumentClick';
import { addControls } from '@scripts/addControls';
import { onWindowResize } from '@scripts/onWindowResize';
import tooltips from '@scripts/tooltips';
import outlineCompose from '@scripts/outlineCompose';

var container, stats, controls;
var camera, scene, renderer;
var composer, outlinePass;
var model;
var features = {
    loader: true,
    navigation: true,
    sfx: true,
};

window.cameraTargets = {
    "hotspot-aborigines": {
        x: 0.8, y: 1.5, z: -1.8
    },
    "hotspot-camps": {
        x: 1.5, y: 1.4, z: -1.3
    },
    "hotspot-officials": {
        x: -0.3, y: 1.3, z: -2
    },
    "hotspot-settlers": {
        x: 0.3, y: 1.2, z: -2
    },
    "hotspot-ship": {
        x: 0.4, y: 1.2, z: 2
    },
};
window.hotspots = [];
window.selectedTooltip = null;
window.controlsSelectedTooltip = null;
window.audioLib = {
    ambient: null,
    muteButton: document.getElementById('mute-button'),
    unmuteButton: document.getElementById('unmute-button'),
    mute: false,
    hotspots: {
        "hotspot-aborigines": null,
        "hotspot-camps": null,
        "hotspot-officials": null,
        "hotspot-settlers": null,
        "hotspot-ship": null,
    }
};

init();
animate();

function init() {
    var gui;
    if (window.location.hash === '#debug') {
        gui = new GUI();
        stats = new Stats();
        container.appendChild(stats.dom);
    }

    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    window.camera = camera;
    camera.position.set(0, 8, -6);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // loading manager
    var loadingManager = new THREE.LoadingManager(function () {
        scene.add(model);
    });

    loadingManager.onProgress = function (url, loaded, total) {
        if (total === loaded) {
            setTimeout(function () {
                var uiLoader = document.getElementById('loader');
                if (uiLoader && features.loader) {
                    uiLoader.classList.add('off');
                }
                if (features.navigation) {
                    addControls();
                }
            }, 1000);
        }
    };

    // models
    var textureLoader = new THREE.TextureLoader();
    var loader = new ColladaLoader(loadingManager);

    loader.load('./models/model6/jemba.dae', function (dae) {
        model = dae.scene;
        for (var mat in dae.library.materials) {
            dae.library.materials[mat].build.alphaTest = 0.05;
            dae.library.materials[mat].build.side = THREE.DoubleSide;
            dae.library.materials[mat].build.shininess = 5;
        }

        model.scale.set(2, 2, 2);

        model.traverse(function (child) {
            if (child.name.includes('hotspot')) {
                hotspots.push(child);
            }

            if (child.name === 'rock') {
                var texture = textureLoader.load("./models/model6/stone-lm.png");
                child.material.lightMap = texture;
                child.material.lightMapIntensity = 0.3;
            }

            if (child.name === 'sand') {
                var texture = textureLoader.load("./models/model6/sand-lm.png");
                child.material.lightMap = texture;
                child.material.lightMapIntensity = 0.2;
            }

            if (child.name === 'water') {
                var texture = textureLoader.load("./models/model6/water-lm.png");
                child.material.lightMap = texture;
                child.material.lightMapIntensity = 0.5;
            }
        });

        outlinePass.selectedObjects = hotspots;

        // load sounds
        if (features.sfx) {
            audioLib.hotspots["hotspot-aborigines"] = new Audio('./audio/Jiemba 3d Imperial Aborigines.m4a');
            audioLib.hotspots["hotspot-ship"] = new Audio('./audio/2020-03-08 15.39.58.m4a');
            audioLib.hotspots["hotspot-camps"] = new Audio('./audio/Jiemba 3d Imperial First Colony.m4a');
            audioLib.hotspots["hotspot-officials"] = new Audio('./audio/Jiemba 3d Imperial Competition.m4a');
            audioLib.hotspots["hotspot-settlers"] = new Audio('./audio/2020-03-08 15.40.15.m4a');

            audioLib.ambient = new Audio('./audio/Jiemba 3d Background_1.m4a');
            audioLib.ambient.play();

            audioLib.muteButton.addEventListener('click', () => {
                audioLib.ambient.pause();
                audioLib.muteButton.style.display = 'none';
                audioLib.unmuteButton.style.display = 'block';
                audioLib.mute = true;
            });

            audioLib.unmuteButton.addEventListener('click', () => {
                audioLib.ambient.play();
                audioLib.unmuteButton.style.display = 'none';
                audioLib.muteButton.style.display = 'block';
                audioLib.mute = false;
            });
        } else {
            audioLib.muteButton.style.display = 'none';
        }
    });

    // lights
    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.45);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, 2.5, -10).normalize();
    scene.add(directionalLight);

    var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(10, 10, 5).normalize();
    scene.add(directionalLight2);

    var directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight3.position.set(-10, -4, 5).normalize();
    scene.add(directionalLight3);

    function makePointLight(pos, name) {
        var pointLight;
        pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(pos.x, pos.y, pos.z);
        // pointLight.angle = Math.PI / 8;
        pointLight.decay = 1;
        pointLight.distance = 4;
        pointLight.penumbra = 0;

        if (gui && name) {
            gui.add(pointLight.position, 'z', -10, 10).name(name + 'z').step(0.1).listen();
            gui.add(pointLight.position, 'x', -10, 10).name(name + 'x').step(0.1).listen();
            gui.add(pointLight.position, 'y', -10, 10).name(name + 'y').step(0.1).listen();
        }
        return pointLight;
    }

    const point1 = makePointLight({ x: 0.1, y: 0.6, z: -2.5 });
    scene.add(point1);

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // controls 
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.03;
    controls.enablePan = false;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.01;
    controls.maxDistance = 6;
    controls.target.set(0, 1, 3);
    controls.zoomSpeed = 0.9;
    // Polar limits top bottom
    controls.maxPolarAngle = Math.PI / 1.95;
    controls.minPolarAngle = Math.PI / 2.5;
    // controls.maxAzimuthAngle = Math.PI / 2; 
    // controls.minAzimuthAngle = Math.PI / -2;
    controls.update();
    
    window.addEventListener('resize', onWindowResize, false);


    window.addEventListener("resize", onWindowResize, false);
    window.camera = camera;
    window.controls = controls;
    window.renderer = renderer;
    window.scene = scene;

    addEvents();
    tooltips();

    // postprocessing
    var processing = outlineCompose();
    composer = processing.composer;
    outlinePass = processing.outlinePass;

    if (window.location.hash === '#debug') {
        //     gui.add(ambientLight, 'intensity', 0, 4).name("Ambient light").step(0.01).listen();
        //     gui.add(spotLight, 'intensity', 0, 4).name("Spot light").step(0.01).listen();
        //     gui.add(spotLight, 'penumbra', 0, 1).name("Spot feather").step(0.01).listen();
        //     gui.add(fireLight, 'intensity', 0, 4).name("Firelight").step(0.01).listen();

        //     // gui.add(fireLight.position, 'z', -50, 50).name('fire z').step(0.1).listen();
        //     // gui.add(fireLight.position, 'x', -50, 50).name('fire x').step(0.1).listen();
        //     // gui.add(fireLight.position, 'y', -50, 50).name('fire y').step(0.1).listen();

        gui.add(camera.position, 'z', -50, 50).step(0.1).listen();
        gui.add(camera.position, 'x', -50, 50).step(0.1).listen();
        gui.add(camera.position, 'y', -50, 50).step(0.1).listen();
    }
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    render();
    composer.render();
    if (window.location.hash === '#debug') {
        stats.update();
    }
}

function render() {
    controls.update();
    renderer.render(scene, camera);
}
