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
var mesh;
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
        // scene.add(model);
        // scene.add(modelScales);
        // scene.add(modelBalls);
        // scene.add(modelMirror);
        // scene.add(modelTable);
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
    // var textureLoader = new THREE.TextureLoader();
    // var loader = new ColladaLoader(loadingManager);

    var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale( - 1, 1, 1 );

    var texture = new THREE.TextureLoader().load( 'textures/Arun_01.jpg' );
    var material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );

    scene.add( mesh );

    var uiLoader = document.getElementById('loader');
    if (uiLoader && features.loader) {
        uiLoader.classList.add('off');
    }

    var spriteMap = new THREE.TextureLoader().load( "button.svg" );
    var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap } );

    var sprite1 = new THREE.Sprite( spriteMaterial );
    sprite1.name = 'hotspot-wall';
    sprite1.position.set(-200, 38, 137);
    scene.add( sprite1 );

    var sprite2 = new THREE.Sprite( spriteMaterial );
    sprite2.name = 'hotspot-defenders';
    sprite2.position.set(-58, 51, 200);
    scene.add( sprite2 );

    var sprite3 = new THREE.Sprite( spriteMaterial );
    sprite3.name = 'hotspot-siege';
    sprite3.position.set(-200, 38, -88);
    scene.add( sprite3 );

    var sprite4 = new THREE.Sprite( spriteMaterial );
    sprite4.name = 'hotspot-army';
    sprite4.position.set(16, -14, -200);
    scene.add( sprite4 );

    var sprite5 = new THREE.Sprite( spriteMaterial );
    sprite5.name = 'hotspot-christ';
    sprite5.position.set(77, 16, 200);
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
    controls.dampingFactor = 0.03;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.rotateSpeed = -1; // mouse invert
    controls.screenSpacePanning = false;
    controls.minDistance = 0.01;
    controls.maxDistance = 4;
    controls.target.set(0, 1, 0);
    controls.zoomSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 1.3;
    controls.minPolarAngle = Math.PI / 2.9;
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

    outlinePass.selectedObjects = hotspots;

    if (window.location.hash === '#debug') {
        gui.add(sprite1.position, 'x', -200, 200).name("button 1 x").step(1).listen();
        gui.add(sprite1.position, 'y', -200, 200).name("button 1 y").step(1).listen();
        gui.add(sprite1.position, 'z', -200, 200).name("button 1 z").step(1).listen();

        gui.add(sprite2.position, 'x', -200, 200).name("button 2 x").step(1).listen();
        gui.add(sprite2.position, 'y', -200, 200).name("button 2 y").step(1).listen();
        gui.add(sprite2.position, 'z', -200, 200).name("button 2 z").step(1).listen();

        gui.add(sprite3.position, 'x', -200, 200).name("button 3 x").step(1).listen();
        gui.add(sprite3.position, 'y', -200, 200).name("button 3 y").step(1).listen();
        gui.add(sprite3.position, 'z', -200, 200).name("button 3 z").step(1).listen();

        gui.add(sprite4.position, 'x', -200, 200).name("button 4 x").step(1).listen();
        gui.add(sprite4.position, 'y', -200, 200).name("button 4 y").step(1).listen();
        gui.add(sprite4.position, 'z', -200, 200).name("button 4 z").step(1).listen();

        gui.add(sprite5.position, 'x', -200, 200).name("button 5 x").step(1).listen();
        gui.add(sprite5.position, 'y', -200, 200).name("button 5 y").step(1).listen();
        gui.add(sprite5.position, 'z', -200, 200).name("button 5 z").step(1).listen();
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
