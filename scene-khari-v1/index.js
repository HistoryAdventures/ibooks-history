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

import '../styles/khari.scss';

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
        x: -3.7, y: 0.5, z: -1.4
    },
    "hotspot-2": {
        x: -2.8, y: 0.4, z: -2.8
    },
    "hotspot-3": {
        x: -0.8, y: 0.4, z: -3.9
    },
    "hotspot-4": {
        x: 0.7, y: 0.5, z: -3.9
    },
    "hotspot-5": {
        x: 2.3, y: 0.5, z: -3.2
    },
    "hotspot-6": {
        x: 3.6, y: 0.4, z: -1.7
    },
    "hotspot-7": {
        x: 3.9, y: 0.3, z: -0.1
    },
    "hotspot-8": {
        x: 2.9, y: 0.2, z: 2.7
    },
    "hotspot-9": {
        x: 0.3, y: 0.2, z: 3.9
    },
    "hotspot-10": {
        x: -1.5, y: 0.1, z: 3.6
    },
    "hotspot-11": {
        x: -3.6, y: 0.2, z: 1.5
    },
    "hotspot-12": {
        x: -3.9, y: 0.1, z: 0
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
        "hotspot-1": null,
        "hotspot-2": null,
        "hotspot-3": null,
        "hotspot-4": null,
        "hotspot-5": null,
        "hotspot-6": null,
        "hotspot-7": null,
        "hotspot-8": null,
        "hotspot-9": null,
        "hotspot-10": null,
        "hotspot-11": null,
        "hotspot-12": null,
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
    camera.position.set(6, -1, 3);
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

    var texture = new THREE.TextureLoader().load( 'textures/Khari_pano.jpg' );
    var material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );

    scene.add( mesh );

    var sprite1 = createButton('hotspot-1');
    sprite1.position.set(200, 47.5, 46.5);
    sprite1.lookAt(0 ,0 ,0);
    scene.add( sprite1 );

    var sprite2 = createButton('hotspot-2');
    sprite2.position.set(200, 51, 135);
    sprite2.lookAt(0 ,0 ,0);
    scene.add( sprite2 );

    var sprite3 = createButton('hotspot-3');
    sprite3.position.set(95, 45.5, 200);
    sprite3.lookAt(0 ,0 ,0);
    scene.add( sprite3 );

    var sprite4 = createButton('hotspot-4');
    sprite4.position.set(3, 44, 200);
    sprite4.lookAt(0 ,0 ,0);
    scene.add( sprite4 );

    var sprite5 = createButton('hotspot-5');
    sprite5.position.set(-104, 47, 200);
    sprite5.lookAt(0 ,0 ,0);
    scene.add( sprite5 );

    var sprite6 = createButton('hotspot-6');
    sprite6.position.set(-200, 54, 144);
    sprite6.lookAt(0 ,0 ,0);
    scene.add( sprite6 );

    var sprite7 = createButton('hotspot-7');
    sprite7.position.set(-200, 52.5, 43.5);
    sprite7.lookAt(0 ,0 ,0);
    scene.add( sprite7 );

    var sprite8 = createButton('hotspot-8');
    sprite8.position.set(-192, 54, -120);
    sprite8.lookAt(0 ,0 ,0);
    scene.add( sprite8 );

    var sprite9 = createButton('hotspot-9');
    sprite9.position.set(-50, 47, -200);
    sprite9.lookAt(0 ,0 ,0);
    scene.add( sprite9 );

    var sprite10 = createButton('hotspot-10');
    sprite10.position.set(46, 48.5, -200);
    sprite10.lookAt(0 ,0 ,0);
    scene.add( sprite10 );

    var sprite11 = createButton('hotspot-11');
    sprite11.position.set(200, 51, -142);
    sprite11.lookAt(0 ,0 ,0);
    scene.add( sprite11 );

    var sprite12 = createButton('hotspot-12');
    sprite12.position.set(200, 48, -47);
    sprite12.lookAt(0 ,0 ,0);
    scene.add( sprite12 );

    hotspots = [sprite1, sprite2, sprite3, sprite4, sprite5, sprite6, sprite7, sprite8, sprite9, sprite10, sprite11, sprite12];

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

    // outlinePass.selectedObjects = hotspots;
    if (features.sfx) {
        audioLib.hotspots["hotspot-1"] = new Audio('./audio/Khari 3d Button_1.m4a');
        audioLib.hotspots["hotspot-2"] = new Audio('./audio/Khari 3d Button_2.m4a');
        audioLib.hotspots["hotspot-3"] = new Audio('./audio/Khari 3d Button_3.m4a');
        audioLib.hotspots["hotspot-4"] = new Audio('./audio/Khari 3d Button_4.m4a');
        audioLib.hotspots["hotspot-5"] = new Audio('./audio/Khari 3d Button_5.m4a');
        audioLib.hotspots["hotspot-6"] = new Audio('./audio/Khari 3d Button_6.m4a');
        audioLib.hotspots["hotspot-7"] = new Audio('./audio/Khari 3d Button_7.m4a');
        audioLib.hotspots["hotspot-8"] = new Audio('./audio/Khari 3d Button_8.m4a');
        audioLib.hotspots["hotspot-9"] = new Audio('./audio/Khari 3d Button_9.m4a');
        audioLib.hotspots["hotspot-10"] = new Audio('./audio/Khari 3d Button_10.m4a');
        audioLib.hotspots["hotspot-11"] = new Audio('./audio/Khari 3d Button_11.m4a');
        audioLib.hotspots["hotspot-12"] = new Audio('./audio/Khari 3d Button_12.m4a');

        audioLib.ambient = new Audio('./audio/Khari 3d Background.m4a');
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
