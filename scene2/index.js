import * as TWEEN from './js/tween';
import * as THREE from './build/three.module.js';
import Stats from './jsm/libs/stats.module.js';
// import { GUI } from './jsm/libs/dat.gui.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { TrackballControls } from './jsm/controls/TrackballControls.js';
import { ColladaLoader } from './jsm/loaders/ColladaLoader.js';

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { BokehPass } from './jsm/postprocessing/BokehPass.js';

var container, stats, controls;
var camera, scene, renderer;
var model;

var features = {
    loader: true,
    touchEvents: false,
    navigation: false,
    stats: false,
    dof: false
};

var width = window.innerWidth;
var height = window.innerHeight;

var postprocessing = {};

init();
animate();

function init() {
    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-20, 5, 45);
    var cameraAnimatePos = {x: 6, y: 5, z: 16};
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbbbbb);

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

                setupTween(cameraAnimatePos);
            }, 1000);
        }
    };

    // models
    var loader = new ColladaLoader(loadingManager);

    loader.load('./models/Ribbon_V1.dae', function (collada) {
        model = collada.scene;
        for (var mat in collada.library.materials) {
            collada.library.materials[mat].build.side = THREE.DoubleSide;
            collada.library.materials[mat].build.alphaTest = 0.05;
        }
        model.scale.set(0.4,0.4,0.4);
        model.position.set(0,0,-1);
    });

    // lights
    var ambientLight = new THREE.AmbientLight(0xccccdd, 1);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(-0.3, 0.2, -1).normalize();
    scene.add(directionalLight);
    var directionalLight2 = new THREE.DirectionalLight(0xddddff, 0.2);
    directionalLight2.position.set(0.3, 0.2, 1).normalize();
    scene.add(directionalLight2);
    // var spotLight;
    // spotLight = new THREE.SpotLight(0xffffff, 1);
    // spotLight.position.set(0, 2, 0);
    // var targetObject = new THREE.Object3D();
    // targetObject.position.set(0, 0, 0);
    // scene.add(targetObject);
    // spotLight.target = targetObject;
    // spotLight.angle = Math.PI / 3;
    // spotLight.penumbra = 0.05;
    // spotLight.decay = 1;
    // spotLight.distance = 50;
    // spotLight.shadow.mapSize.width = 1024;
    // spotLight.shadow.mapSize.height = 1024;
    // spotLight.shadow.camera.near = 10;
    // spotLight.shadow.camera.far = 800;
    // scene.add(spotLight);

    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshStandardMaterial( {color: 0xdadaff, side: THREE.BackSide } );
    var cube = new THREE.Mesh( geometry, material );
    cube.scale.set(60,50,60);
    cube.position.y = 10;
    scene.add( cube );

    // renderer

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.antialias = true;
    container.appendChild(renderer.domElement);

    createControls( camera );
    
    if (features.stats) {
        stats = new Stats();
        container.appendChild( stats.dom );
    }
    
    window.addEventListener('resize', onWindowResize, false);

    // // add events
    // if (features.touchEvents) {
    //     $('#container').on('vclick', onDocumentClick);
    // }
    if (features.dof) {
        initPostprocessing();
    }
}

function createControls( camera ) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.target.set(0, 1, 0);
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.update();
}

function setupTween(target) {
    new TWEEN.Tween(camera.position)
        .to(target, 2000)
        .easing(TWEEN.Easing.Cubic.Out)
        .onUpdate(function () {
            controls.target.set(0, 1, 0);
            controls.update();
        })
        .start();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    render();
    if (features.stats) {
        stats.update();
    }
}

function render() {
    controls.update();
    renderer.render(scene, camera);
    if (features.dof) {
        postprocessing.composer.render( 0.1 );
    }
    
}

function initPostprocessing() {

    var renderPass = new RenderPass( scene, camera );

    var bokehPass = new BokehPass( scene, camera, {
        focus: 70.0,
        aperture: 0.00005,
        maxblur: 1,

        width: width,
        height: height
    } );

    var composer = new EffectComposer( renderer );

    composer.addPass( renderPass );
    composer.addPass( bokehPass );

    postprocessing.composer = composer;
    postprocessing.bokeh = bokehPass;

}