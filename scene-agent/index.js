import '@babel/polyfill';
import * as TWEEN from '@scripts/js/tween';
import * as THREE from '@scripts/build/three.module.js';
import Stats from '@scripts/jsm/libs/stats.module.js';
import { GUI } from '@scripts/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '@scripts/jsm/controls/OrbitControls.js';
import { ColladaLoader } from '@scripts/jsm/loaders/ColladaLoader.js';
import lights from './js/lights';

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
    "agent-1": {
        x: -3.3, y: 1, z: -4
    },
    "agent-2": {
        x: 2.2, y: 1, z: -4.6
    },
    "agent-3": {
        x: 4.8, y: 1, z: -1.6
    },
    "agent-4": {
        x: 5, y: 1, z: -1
    },
    "agent-5": {
        x: 2.2, y: 1, z: 4.6
    },
    "agent-6": {
        x: 1.1, y: 1, z: 5
    },
    "agent-7": {
        x: -1.8, y: 0.8, z: 4.9
    },
    Paper1: {
        x: 0, y: 4, z: -3.7
    },
    Paper3: {
        x: -4.6, y: 3.3, z: 1.6
    },
    Paper2: {
        x: -0.7, y: 3, z: 3.2
    },
    Paper4: {
        x: 3.7, y: 3.8, z: 1.1
    },

};
window.hotspots = [];
window.selectedTooltip = null;
window.controlsSelectedTooltip = null;
window.audioLib = {
    papers: [],
    lastPlayedPaperIndex: 0,
    ambient: null,
    muteButton: document.getElementById('mute-button'),
    unmuteButton: document.getElementById('unmute-button'),
    mute: false,
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
    camera.position.set(-7, 5, 9);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

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

    loader.load("./models/model1/agent01.dae", function (dae) {
        for (var mat in dae.library.materials) {
            dae.library.materials[mat].build.side = THREE.DoubleSide;
            dae.library.materials[mat].build.alphaTest = 0.05;
            dae.library.materials[mat].build.shininess = 5;
        }

        dae.scene.traverse(function (child) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.name.includes('agent') || child.name.includes('Paper')) {
                hotspots.push(child);
            }

            var lightMapIntensity = 0.3;

            if (child.name.includes('frame') || child.name.includes('agent')) {
                var texture = textureLoader.load("./models/model1/frame-lm.png");
                child.material.lightMap = texture;
                child.material.lightMapIntensity = lightMapIntensity + 0.6;
            }

            if (child.name === 'floor') {
                var texture = textureLoader.load("./models/model1/floor-lm.png");
                child.material.lightMap = texture;
                child.material.lightMapIntensity = lightMapIntensity;
            }
        });

        model = dae.scene;
        model.scale.set(1.4, 1.4, 1.4);
        model.position.set(3.2, -1, 0.8);
        outlinePass.selectedObjects = hotspots;

        // load sounds
        if (features.sfx) {
            audioLib.papers.push(new Audio('./audio/Agent 355 3d Accomplishment 1_1.m4a'));
            audioLib.papers.push(new Audio('./audio/Agent 355 3d Accomplishment 2_1.m4a'));
            audioLib.papers.push(new Audio('./audio/Agent 355 3d Accomplishment 3_1.m4a'));
            audioLib.papers.push(new Audio('./audio/Agent 355 3d Accomplishment 4_1.m4a'));

            audioLib.ambient = new Audio('./audio/Agent 355 3d Background.m4a');
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

    // lights
    lights.setup(scene, gui);

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
    controls.maxDistance = 5.4;
    controls.target.set(0, 1, 0);
    controls.zoomSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 1.95;
    controls.minPolarAngle = Math.PI / 2.5;
    controls.update();

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
