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

var container, stats, controls;
var camera, scene, renderer;
var model;
var features = {
    loader: true,
    navigation: true,
};

window.cameraTargets = {
    "hotspot-1": {
        x: 2.3, y: 0.5, z: 3.1
    },
    "hotspot-2": {
        x: 2.2, y: -0.3, z: 2.9
    },
    "hotspot-3": {
        x: 2.2, y: -0.3, z: 2.9
    },
    "hotspot-4": {
        x: 2.2, y: -0.3, z: 2.9
    },
    "hotspot-5": {
        x: 2.2, y: -0.3, z: 2.9
    },
    "hotspot-6": {
        x: 2.2, y: -0.3, z: 2.9
    },
    "hotspot-7": {
        x: 0.0, y: -1.6, z: 3
    },
    "hotspot-8": {
        x: -2.2, y: -0.3, z: 2.9
    },
    "hotspot-9": {
        x: -2.2, y: -0.3, z: 2.9
    },
    "hotspot-10": {
        x: -2.2, y: -0.3, z: 2.9
    },
    "hotspot-11": {
        x: -2.2, y: -0.3, z: 2.9
    },
    "hotspot-12": {
        x: -2.2, y: -0.3, z: 2.9
    },
};
window.hotspots = [];
window.selectedTooltip = null;
window.controlsSelectedTooltip = null;

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
    camera.position.set(0, 0, 6);
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

    loader.load('./models/model6/khari.dae', function (dae) {
        for (var mat in dae.library.materials) {
            dae.library.materials[mat].build.alphaTest = 0.05;
            // dae.library.materials[mat].build.side = THREE.DoubleSide;
            dae.library.materials[mat].build.shininess = 5;
        }

        dae.scene.traverse(function (child) {
            if (child.name.includes('hotspot')) {
                hotspots.push(child);
            }

            if (child.name === 'feather') {
                child.material.color = new THREE.Color(0xffffff);
                // child.material.combine = THREE.AddOperation;
                child.material.map = textureLoader.load('./models/model6/mask%20f_%20copy.png');
                child.material.normalMap = textureLoader.load('./models/model6/mask%20f_%20copy_NRM.jpg');
                child.material.normalScale = new THREE.Vector2(0.3, 0.3);
            }

            if (child.name === 'mask') {
                child.material.color = new THREE.Color(0xffeeee);
                child.material.bumpMap = textureLoader.load('./models/model6/Seamless-white-crease-paper-texture_NRM.jpg');
                child.material.bumpScale = 0.015;
            }
        });

        model = dae.scene;
    });

    // lights
    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.3);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);

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
    controls.minDistance = 3;
    controls.maxDistance = 9;
    controls.target.set(0, 1, 0);
    controls.zoomSpeed = 0.5;
    // Polar limits top bottom
    controls.maxPolarAngle = Math.PI / 1.6;
    controls.minPolarAngle = Math.PI / 5;
    controls.maxAzimuthAngle = Math.PI / 3;
    controls.minAzimuthAngle = Math.PI / -3;
    controls.update();

    window.addEventListener("resize", onWindowResize, false);
    window.camera = camera;
    window.controls = controls;
    window.renderer = renderer;
    window.scene = scene;

    addEvents();
    tooltips();

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
    if (window.location.hash === '#debug') {
        stats.update();
    }
}

function render() {
    controls.update();
    renderer.render(scene, camera);
}
