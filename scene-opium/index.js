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

import '../styles/opium.scss';

var container, stats, controls;
var camera, scene, renderer;
var composer, outlinePass;
var model, modelScales, modelBalls, modelMirror, modelTable;
var features = {
    loader: true,
    navigation: true,
    sfx: true,
};

window.cameraTargets = {
    "hotspot-paper1": {
        x: -1.3, y: 1.3, z: -3.8
    },
    "hotspot-paper2": {
        x: -0.8, y: 1.3, z: -3.8
    },
    "hotspot-emperor": {
        x: 0.3, y: 1.7, z: -3.3
    },
    "hotspot-opium1": {
        x: 3, y: 2.2, z: -2.4
    },
    "hotspot-mirror-back": {
        x: 1.8, y: 1, z: -3.6
    }
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
        "hotspot-paper1": null,
        "hotspot-paper2": null,
        "hotspot-emperor": null,
        "hotspot-opium1": null,
        "hotspot-mirror-back": null,
    }
};

init();
animate();

function init() {
    container = document.getElementById('container');

    var gui;
    if (window.location.hash === '#debug') {
        gui = new GUI();
        stats = new Stats();
        container.appendChild(stats.dom);
    }

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-6, 5, -9);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // loading manager
    var loadingManager = new THREE.LoadingManager(function () {
        scene.add(model);
        scene.add(modelScales);
        scene.add(modelBalls);
        scene.add(modelMirror);
        scene.add(modelTable);
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

    loader.load('./models/model2/opium.dae', function (dae) {
        model = dae.scene;
        for (var mat in dae.library.materials) {
            dae.library.materials[mat].build.side = THREE.DoubleSide;
            dae.library.materials[mat].build.shininess = 30;
        }

        model.traverse(function (child) {
            if (child.name.includes('hotspot')) {
                hotspots.push(child);
            }

            if (child.name === 'floor') {
                var texture = textureLoader.load("./models/model2/floor-lm.png");
                child.material.lightMap = texture;
                child.material.lightMapIntensity = 0.3;
            }
        });

        outlinePass.selectedObjects = hotspots;

        // load sounds
        if (features.sfx) {
            audioLib.hotspots["hotspot-paper1"] = new Audio('./audio/FeiHong_3d Lin Zexu.m4a');
            audioLib.hotspots["hotspot-paper2"] = new Audio('./audio/FeiHong_3d Canton.m4a');
            audioLib.hotspots["hotspot-emperor"] = new Audio('./audio/FeiHong_3d Daoguang Emperor.m4a');
            audioLib.hotspots["OpiumBalls"] = new Audio('./audio/FeiHong_3d Opium.m4a');
            audioLib.hotspots["OpiumBalls2"] = new Audio('./audio/FeiHong_3d Opium.m4a');
            audioLib.hotspots["OpiumBox"] = new Audio('./audio/FeiHong_3d Opium.m4a');
            audioLib.hotspots["hotspot-mirror-back"] = new Audio('./audio/FeiHong_3d Opium Destruction.mp3');

            audioLib.ambient = new Audio('./audio/FeiHong_3d Background.m4a');
            audioLib.ambient.loop = true;
            try {
                audioLib.ambient.play();
            } catch (e) {
                // for autoplay https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
            }

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

    loader.load('./models/model2/opium-scales.dae', function (dae) {
        modelScales = dae.scene;
    });

    loader.load('./models/model2/balls-on-ground.dae', function (dae) {
        modelBalls = dae.scene;
    });

    loader.load('./models/model2/mirror.dae', function (dae) {
        modelMirror = dae.scene;
    });

    loader.load('./models/model2/table.dae', function (dae) {
        modelTable = dae.scene;
    });

    // lights
    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.15);
    scene.add(ambientLight);

    var spotLight;
    spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(1, 2.24, -1);
    var targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, 0);
    scene.add(targetObject);
    spotLight.target = targetObject;
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.6;
    spotLight.decay = 0.2;
    spotLight.distance = 50;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 50;
    scene.add(spotLight);

    function makePointLight(pos, name) {
        var pointLight;
        pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(pos.x, pos.y, pos.z);
        // pointLight.angle = Math.PI / 8;
        pointLight.decay = 1;
        pointLight.distance = 2;
        pointLight.penumbra = 0;

        if (gui && name) {
            gui.add(pointLight.position, 'z', -10, 10).name(name + 'z').step(0.1).listen();
            gui.add(pointLight.position, 'x', -10, 10).name(name + 'x').step(0.1).listen();
            gui.add(pointLight.position, 'y', -10, 10).name(name + 'y').step(0.1).listen();
        }
        return pointLight;
    }

    var pointLight1 = makePointLight({ x: 1.2, y: 1, z: -2.8 });
    scene.add(pointLight1);

    var pointLight2 = makePointLight({ x: 1.2, y: 1.2, z: -1.5 });
    scene.add(pointLight2);

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
    controls.maxDistance = 4;
    controls.target.set(0, 1, 0);
    controls.zoomSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 1.95;
    controls.minPolarAngle = Math.PI / 2.5;
    controls.update();

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
        gui.add(ambientLight, 'intensity', 0, 4).name("Ambient light").step(0.01).listen();
        gui.add(spotLight, 'intensity', 0, 4).name("Spot light").step(0.01).listen();
        gui.add(spotLight, 'penumbra', 0, 1).name("Spot feather").step(0.01).listen();

        gui.add(spotLight.position, 'z', -50, 50).name("Spot z").step(0.01).listen();
        gui.add(spotLight.position, 'x', -50, 50).name("Spot x").step(0.01).listen();
        gui.add(spotLight.position, 'y', -50, 50).name("Spot y").step(0.01).listen();

        gui.add(camera.position, 'z', -50, 50).step(0.1).listen();
        gui.add(camera.position, 'x', -50, 50).step(0.1).listen();
        gui.add(camera.position, 'y', -50, 50).step(0.1).listen();
    }
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    render();
    if (window.location.hash === '#debug') {
        stats.update();
    }
    composer.render();
}

function render() {
    controls.update();
    renderer.render(scene, camera);
}
