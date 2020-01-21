import * as TWEEN from './js/tween';
import * as THREE from './build/three.module.js';
// import Stats from './jsm/libs/stats.module.js';
import { GUI } from './jsm/libs/dat.gui.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { ColladaLoader } from './jsm/loaders/ColladaLoader.js';
import Hammer from 'hammerjs';

var container, stats, controls;
var camera, scene, renderer;
var model;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

var cameraTargets = {
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
        x: 3.7, y: 1.7, z: 1.4
    },
    "hotspot-mirror-back": {
        x: 1.8, y: 1, z: -3.6
    }
};
var hotspots;
var selectedTooltip = null;
var controlsSelectedTooltip = null;
var features = {
    loader: true,
    navigation: true,
};

init();
animate();

function init() {
    var gui;
    // if (process.env.NODE_ENV !== 'production') {
    //     gui = new GUI();
    // }

    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-6, 5, -9);
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
    var loader = new ColladaLoader(loadingManager);

    loader.load('./models/model6/opium.dae', function (dae) {
        model = dae.scene;
        for (var mat in dae.library.materials) {
            dae.library.materials[mat].build.side = THREE.DoubleSide;
            dae.library.materials[mat].build.shininess = 30;
        }

        hotspots = [];

        model.traverse(function (child) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.name.includes('hotspot')) {
                hotspots.push(child);
            }
        });
    });

    // lights
    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.15);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(0, 1, 1).normalize();
    // scene.add(directionalLight);
    var spotLight;
    spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0.2, 2.1, -1.1);
    var targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, 0);
    scene.add(targetObject);
    spotLight.target = targetObject;
    spotLight.angle = Math.PI / 2.5;
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
        pointLight.distance = 1.5;
        pointLight.penumbra = 0;

        if (gui && name) {
            gui.add(pointLight.position, 'z', -10, 10).name(name + 'z').step(0.1).listen();
            gui.add(pointLight.position, 'x', -10, 10).name(name + 'x').step(0.1).listen();
            gui.add(pointLight.position, 'y', -10, 10).name(name + 'y').step(0.1).listen();
        }
        return pointLight;
    }

    var pointLight1 = makePointLight({ x: -0.5, y: 0.8, z: -1.8 });
    scene.add(pointLight1);

    var pointLight2 = makePointLight({ x: 1.2, y: 0.8, z: -0.3 });
    scene.add(pointLight2);

    var pointLight21 = makePointLight({ x: 1.2, y: 0.8, z: 0.6});
    scene.add(pointLight21);

    var pointLight3 = makePointLight({ x: -1.8, y: 1.1, z: 3.4 });
    scene.add(pointLight3);

    var pointLight4 = makePointLight({ x: 1, y: 1, z: -1.4 });
    scene.add(pointLight4);

    var pointLight5 = makePointLight({ x: 1, y: 1, z: -1.4 });
    scene.add(pointLight5);

    var pointLight6 = makePointLight({ x: 1, y: 1, z: -2.5 });
    scene.add(pointLight6);

    var pointLight7 = makePointLight({ x: 1, y: 0.5, z: -2.5 });
    scene.add(pointLight7);

    var pointLight8 = makePointLight({ x: -1.9, y: 0.7, z: 0.7 });
    scene.add(pointLight8);

    // renderer

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    //
    // stats = new Stats();
    // container.appendChild( stats.dom );
    //
    window.addEventListener('resize', onWindowResize, false);

    var hammertime = new Hammer(document.querySelector('#container'), {});
    hammertime.on('tap', function (ev) {
        onDocumentClick(ev);
    });

    if (process.env.NODE_ENV !== 'production' && gui) {
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

var uiTooltips = document.getElementById('tooltips');

if (uiTooltips) {
    uiTooltips.addEventListener('click', function (e) {
        if (e.target.matches('.tooltip-close')) {
            selectedTooltip = null;
            toggleTooltip(null);
        }
    });
}

function onDocumentClick(event) {
    if (event.target.matches('.tooltip') || event.target.parentElement.matches('.tooltip')) {
        return;
    }

    if (event.target.matches('.controls') ||
        event.target.parentElement.matches('.controls') ||
        event.target.parentElement.parentElement.matches('.controls')
    ) {
        return;
    }

    selectedTooltip = getIntersects(event);

    var activeTooltip = document.getElementById(selectedTooltip);
    toggleTooltip(activeTooltip);

    var cameraTarget;

    // console.log(camera.position);

    if (selectedTooltip) {

        if (selectedTooltip.includes("opium")) {
            selectedTooltip = "hotspot-opium1";
        } 

        controlsSelectedTooltip = selectedTooltip;
        setControlLabel(controlsSelectedTooltip);
        cameraTarget = cameraTargets[selectedTooltip];
    }

    // removed this for intuitivity
    // if (activeTooltip) {
    //     setupTween(cameraTarget);
    // }
}

function setupTween(target) {
    new TWEEN.Tween(camera.position)
        .to(target, 1100)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function () {
            controls.target.set(0, 1, 0);
            controls.update();
        })
        .start();
}

function getIntersects(event) {
    if (event.srcEvent) {
        mouse.x = (event.srcEvent.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.srcEvent.clientY / window.innerHeight) * 2 + 1;
    } else {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    raycaster.setFromCamera(mouse, camera);

    var interStack = [];

    hotspots.forEach(function (agent) {
        var inter = raycaster.intersectObject(agent, true);
        if (inter.length) {
            interStack = interStack.concat(inter);
        }
    });

    if (interStack.length && interStack[0].object.name !== 'Table') {
        return interStack[0].object.name;
    }

    return null;
}

function toggleTooltip(activeTooltip) {
    document.querySelectorAll('.tooltip').forEach(function (tooltip) {
        tooltip.classList.remove('active');
    });

    if (activeTooltip) {
        activeTooltip.classList.add('active');
        document.getElementById('tooltips').classList.add('tooltip-open');
    } else {
        document.getElementById('tooltips').classList.remove('tooltip-open');
    }
}

function setControlLabel(tooltipId) {
    var tooltip = document.getElementById(tooltipId);
    var currentLabelElement = document.getElementById('controls-current');
    currentLabelElement.innerText = tooltip.querySelector('h2').innerText;

    toggleTooltip(tooltip);
}

function addControls() {
    var tooltips = document.querySelectorAll('.tooltip');
    var tooltipsCount = tooltips.length;
    document.getElementById('controls').style.display = 'block';

    document.getElementById('next').addEventListener('click', function (e) {
        e.preventDefault();
        var currentOrder = document.getElementById(controlsSelectedTooltip);
        var nextTooltip;
        if (currentOrder) {
            nextTooltip = (parseInt(currentOrder.getAttribute('data-order')) - 1);
            if (nextTooltip > 0) {
                setControlLabel(document.querySelector(`[data-order="${nextTooltip}"]`).id);
                controlsSelectedTooltip = document.querySelector(`[data-order="${nextTooltip}"]`).id;
                setupTween(cameraTargets[controlsSelectedTooltip]);
                return;
            }
        }

        setControlLabel(document.querySelector(`[data-order="${tooltipsCount}"]`).id);
        controlsSelectedTooltip = document.querySelector(`[data-order="${tooltipsCount}"]`).id;
        setupTween(cameraTargets[controlsSelectedTooltip]);
    });

    document.getElementById('prev').addEventListener('click', function (e) {
        e.preventDefault();
        var currentOrder = document.getElementById(controlsSelectedTooltip);
        var nextTooltip;
        if (currentOrder) {
            nextTooltip = (parseInt(currentOrder.getAttribute('data-order'))) % tooltipsCount + 1;
            setControlLabel(document.querySelector(`[data-order="${nextTooltip}"]`).id);
            controlsSelectedTooltip = document.querySelector(`[data-order="${nextTooltip}"]`).id;
            setupTween(cameraTargets[controlsSelectedTooltip]);
        } else {
            setControlLabel(document.querySelector(`[data-order="1"]`).id);
            controlsSelectedTooltip = document.querySelector(`[data-order="1"]`).id;
            setupTween(cameraTargets[controlsSelectedTooltip]);
        }
    });
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    render();
    // stats.update();
}
function render() {
    controls.update();
    renderer.render(scene, camera);
}
