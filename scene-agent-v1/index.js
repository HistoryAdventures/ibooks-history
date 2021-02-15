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

import '../styles/agent.scss';

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
    "agent-1": {
        x: -3.6, y: 1.3, z: 1.7
    },
    "agent-2": {
        x: 0.5, y: 1.6, z: -3.9
    },
    "agent-3": {
        x: -0.3, y: 1.4, z: 4
    },
    "agent-4": {
        x: -3.3, y: 1.5, z: -2.2
    },
    "agent-5": {
        x: 4, y: 0.5, z: 0.1
    },
    "agent-6": {
        x: 4, y: 0.5, z: 0.1
    },
    "agent-7": {
        x: -2.3, y: 1.6, z: 3.2
    },
    Paper1: {
        x: 2.6, y: 4, z: 0.1
    },
    Paper3: {
        x: 2.6, y: 4, z: 0.1
    },
    Paper2: {
        x: 2.6, y: 4, z: 0.1
    },
    Paper4: {
        x: 2.6, y: 4, z: 0.1
    },

};
window.hotspots = [];
window.selectedTooltip = null;
window.controlsSelectedTooltip = null;
window.audioLib = {
    ambient: null,
    lastPlayedPaperIndex: 0,
    muteButton: document.getElementById('mute-button'),
    unmuteButton: document.getElementById('unmute-button'),
    mute: false,
    papers: [],
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
    camera.position.set(6, 0, -3);
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

    var texture = new THREE.TextureLoader().load( 'textures/Agent_pano.jpg' );
    var material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );

    scene.add( mesh );

    // caleb brewster
    var sprite1 = createButton('agent-1');
    sprite1.position.set(200, -21, -112);
    sprite1.lookAt(0 ,0 ,0);
    scene.add( sprite1 );

    // agent 355
    var sprite2 = createButton('agent-2');
    sprite2.position.set(-25, -42, 200);
    sprite2.lookAt(0 ,0 ,0);
    scene.add( sprite2 );

    // Robert townsend
    var sprite3 = createButton('agent-3');
    sprite3.position.set(-3, -25, -200);
    sprite3.lookAt(0 ,0 ,0);
    scene.add( sprite3 );

    // Abraham woodhul
    var sprite4 = createButton('agent-4');
    sprite4.position.set(166, -29, 109);
    sprite4.lookAt(0 ,0 ,0);
    scene.add( sprite4 );

    // george washington 
    var sprite5 = createButton('agent-5');
    sprite5.position.set(-200, 36, 23);
    sprite5.lookAt(0 ,0 ,0);
    scene.add( sprite5 );

    // benjamin tallmadge 
    var sprite6 = createButton('agent-6');
    sprite6.position.set(-200, 36, -25);
    sprite6.lookAt(0 ,0 ,0);
    scene.add( sprite6 );

    // Anna Strong
    var sprite7 = createButton('agent-7');
    sprite7.position.set(127, -38, -187);
    sprite7.lookAt(0 ,0 ,0);
    scene.add( sprite7 );

    var Paper1 = createButton('Paper1');
    Paper1.position.set(-151, -190, -51);
    Paper1.lookAt(0 ,0 ,0);
    scene.add( Paper1 );

    var Paper2 = createButton('Paper2');
    Paper2.position.set(-94, -200, 23);
    Paper2.lookAt(0 ,0 ,0);
    scene.add( Paper2 );

    var Paper3 = createButton('Paper3');
    Paper3.position.set(-190, -200, 57);
    Paper3.lookAt(0 ,0 ,0);
    scene.add( Paper3 );

    var Paper4 = createButton('Paper4');
    Paper4.position.set(-200, -164, -31);
    Paper4.lookAt(0 ,0 ,0);
    scene.add( Paper4 );

    hotspots = [sprite1, sprite2, sprite3, sprite4, sprite5, sprite6, sprite7, Paper1, Paper2, Paper3, Paper4];

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
    controls.target.set(-6, 0, -3);
    controls.zoomSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 1.6;
    controls.minPolarAngle = Math.PI / 4.5;
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
        audioLib.papers.push(new Audio('./audio/Agent 355 3d Accomplishment 1_1.m4a'));
        audioLib.papers.push(new Audio('./audio/Agent 355 3d Accomplishment 2_1.m4a'));
        audioLib.papers.push(new Audio('./audio/Agent 355 3d Accomplishment 3_1.m4a'));
        audioLib.papers.push(new Audio('./audio/Agent 355 3d Accomplishment 4_1.m4a'));

        audioLib.ambient = new Audio('./audio/Agent 355 3d Background.m4a');
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
