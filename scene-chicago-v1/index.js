import '@babel/polyfill';
import * as TWEEN from '@scripts/js/tween';
import * as THREE from '@scripts/build/three.module.js';
import Stats from '@scripts/jsm/libs/stats.module.js';
import { GUI } from '@scripts/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '@scripts/jsm/controls/OrbitControls.js';

import { addEvents } from '@scripts/onDocumentClick';
import { addControls } from '@scripts/addControls';
import { onWindowResize } from '@scripts/onWindowResize';
import tooltips from '@scripts/tooltips';
import outlineCompose from '@scripts/outlineCompose';
import createButton from '@scripts/createHotspotButton';

import '../styles/jonas.scss';

var container, stats, controls;
var camera, scene, renderer;
var composer, outlinePass;
var mesh;
var features = {
    loader: true,
    navigation: true,
    sfx: true,
};

window.cameraTargets = {
    "hotspot-1": {
        x: -3.6, y: 2, z: 1.3
    },
    "hotspot-2": {
        x: -1.6, y: 2, z: -3.5
    },
    "hotspot-3": {
        x: 0.3, y: 1.6, z: -3.9
    },
    "hotspot-4": {
        x: 1.8, y: 2.8, z: -3.1
    },
    "hotspot-5": {
        x: -1.3, y: 1.1, z: -1
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
        "hotspot-1": null,
        "hotspot-2": null,
        "hotspot-3": null,
        "hotspot-4": null,
        "hotspot-5": null,
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
    camera.position.set(-6, -1, 3);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    var uiLoader = document.getElementById('loader');
    if (uiLoader && features.loader) {
        uiLoader.classList.add('off');
    }

    if (features.navigation) {
        addControls();
    }

    // models
    // var textureLoader = new THREE.TextureLoader();
    // var loader = new ColladaLoader(loadingManager);

    var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale( - 1, 1, 1 );

    var texture = new THREE.TextureLoader().load( 'textures/ThomasBrown_pano.jpg' );
    var material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );

    scene.add( mesh );

    var sprite1 = createButton('hotspot-1');
    sprite1.position.set(200, -38, -99);
    sprite1.lookAt(0 ,0 ,0);
    scene.add( sprite1 );

    var sprite2 = createButton('hotspot-2');
    sprite2.position.set(109, -64, 196);
    sprite2.lookAt(0 ,0 ,0);
    scene.add( sprite2 );

    var sprite3 = createButton('hotspot-3');
    sprite3.position.set(-4, -21, 196);
    sprite3.lookAt(0 ,0 ,0);
    scene.add( sprite3 );

    var sprite4 = createButton('hotspot-4');
    sprite4.position.set(-69, -69, 161);
    sprite4.lookAt(0 ,0 ,0);
    scene.add( sprite4 );

    var sprite5 = createButton('hotspot-5');
    sprite5.position.set(200, 18, 135);
    sprite5.lookAt(0 ,0 ,0);
    scene.add( sprite5 );

    hotspots = [sprite1, sprite2, sprite3, sprite4, sprite5];

    const scaleFactor = 10;
    hotspots.forEach(hotspot => {
        hotspot.scale.set(scaleFactor, scaleFactor, scaleFactor);
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

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // controls 
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.rotateSpeed = -0.3; // mouse invert
    controls.screenSpacePanning = false;
    controls.minDistance = 0.01;
    controls.maxDistance = 4;
    controls.target.set(6, -3, 6);
    controls.zoomSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 1.3;
    controls.minPolarAngle = Math.PI / 5;
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

    // outlinePass.selectedObjects = hotspots;
    if (features.sfx) {
        audioLib.hotspots["hotspot-1"] = new Audio('./audio/Tom Brown 3d Endangering Enviroment.m4a');
        audioLib.hotspots["hotspot-2"] = new Audio('./audio/Tom Brown 3d Beef Trust.m4a');
        audioLib.hotspots["hotspot-3"] = new Audio('./audio/Tom Brown 3d As Far as the eye could see.m4a');
        audioLib.hotspots["hotspot-4"] = new Audio('./audio/Tom Brown 3d A growing concern.m4a');
        audioLib.hotspots["hotspot-5"] = new Audio('./audio/Tom Brown 3d Muckraking.m4a');

        audioLib.ambient = new Audio('./audio/Tom Brown 3d Background.m4a');
        audioLib.ambient.loop = true;
        
        audioLib.ambient.play().then(() => {}).catch(error => {
            window.addEventListener('click', () => {
                audioLib.ambient.play();
            })
        });

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

    if (window.location.hash === '#debug') {
        hotspots.forEach((item, index) => {
            gui.add(item.position, 'x', -200, 200).name(`button ${index} x`).step(1).listen();
            gui.add(item.position, 'y', -200, 200).name(`button ${index} y`).step(1).listen();
            gui.add(item.position, 'z', -200, 200).name(`button ${index} z`).step(1).listen();    
        });
        gui.add(camera.position, 'x', -50, 50).step(0.1).listen();
        gui.add(camera.position, 'y', -50, 50).step(0.1).listen();
        gui.add(camera.position, 'z', -50, 50).step(0.1).listen();
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
