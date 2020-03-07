import '@babel/polyfill';
import * as TWEEN from '@scripts/js/tween';
import * as THREE from '@scripts/build/three.module.js';
import Stats from '@scripts/jsm/libs/stats.module.js';
import { GUI } from '@scripts/jsm/libs/dat.gui.module.js';
import { OrbitControls } from '@scripts/jsm/controls/OrbitControls.js';
import { ColladaLoader } from '@scripts/jsm/loaders/ColladaLoader.js';
import { RenderPass } from '@scripts/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from '@scripts/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from '@scripts/jsm/postprocessing/OutlinePass.js';
import lights from './js/lights';
import Hammer from '@scripts/hammerjs';

var container, stats, controls;
var camera, scene, renderer;
var composer, outlinePass;
var model;
var agents, papers;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

var cameraTargets = {
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

var features = {
    loader: true,
    navigation: true,
};

var selectedTooltip = null;
var controlsSelectedTooltip = null;
var gui;

init();
animate();

function init() {
    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-7, 5, 9);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    if (window.location.hash === '#debug') {
        gui = new GUI();
    }

    // loading manager
    var loadingManager = new THREE.LoadingManager(function () {
        scene.add(model);
    });

    var textureLoader = new THREE.TextureLoader();

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

    loader.load("./models/model1/agent01.dae", function (dae) {
        for (var mat in dae.library.materials) {
            dae.library.materials[mat].build.side = THREE.DoubleSide;
            dae.library.materials[mat].build.alphaTest = 0.05;
            dae.library.materials[mat].build.shininess = 5;
        }

        agents = [];
        papers = [];
        dae.scene.traverse(function (child) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.name.includes('agent')) {
                agents.push(child);
            }

            if (child.name.includes('Paper')) {
                papers.push(child);
            }

            var lightMapIntensity = 0.3;

            // if (child.name === 'Box186') {
            //     var texture = textureLoader.load( "./models/model1/wall-tiles-lm.png" );
            //     child.material.lightMap = texture;
            //     child.material.lightMapIntensity = lightMapIntensity;
            // }

            if (child.name.includes('frame') || child.name.includes('agent')) {
                var texture = textureLoader.load( "./models/model1/frame-lm.png" );
                child.material.lightMap = texture;
                child.material.lightMapIntensity = lightMapIntensity + 0.6;
            }

            if (child.name === 'floor') {
                var texture = textureLoader.load( "./models/model1/floor-lm.png" );
                child.material.lightMap = texture;
                child.material.lightMapIntensity = lightMapIntensity;
            }

            // if (child.name === 'wall-1') {
            //     var texture = textureLoader.load( "./models/model1/wall-dark-lm.png" );
            //     child.material.lightMap = texture;
            //     child.material.lightMapIntensity = lightMapIntensity;
            // }

            // if (child.name === 'room') {
            //     var texture = textureLoader.load( "./models/model1/walls-lm.png" );
            //     child.material.lightMap = texture;
            //     child.material.lightMapIntensity = lightMapIntensity;
            // }

            // if (child.name === 'Table_01') {
            //     var texture = textureLoader.load( "./models/model1/table-lm.png" );
            //     child.material.lightMap = texture;
            //     child.material.lightMapIntensity = lightMapIntensity + 0.2;
            // }

            // if (child.name === 'Chair012') {
            //     var texture = textureLoader.load( "./models/model1/chair-lm-1.png" );
            //     child.material.lightMap = texture;
            //     child.material.lightMapIntensity = lightMapIntensity;
            // }

            // if (child.name === 'chair004') {
            //     var texture = textureLoader.load( "./models/model1/chair-lmn-2.png" );
            //     child.material.lightMap = texture;
            //     child.material.lightMapIntensity = lightMapIntensity;
            // }

            
        });

        model = dae.scene;
        model.scale.set(1.4, 1.4, 1.4);
        model.position.set(3.2, -1, 0.8);
        outlinePass.selectedObjects = [].concat(papers, agents);
    });

    var gui;
    // if (process.env.NODE_ENV !== 'production') {
    //     gui = new GUI();
    // }

    // lights
    lights.setup(scene, gui);

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
    controls.maxDistance = 5.4;
    controls.target.set(0, 1, 0);
    controls.zoomSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 1.95;
    controls.minPolarAngle = Math.PI / 2.5;
    controls.update();
    
    if (window.location.hash === '#debug') {
        stats = new Stats();
        container.appendChild(stats.dom);
    }

    window.addEventListener("resize", onWindowResize, false);

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

    var hammertime = new Hammer(document.querySelector('#container'), {});
    hammertime.on('tap', function (ev) {
        onDocumentClick(ev);
    });

    // postprocessing

    composer = new EffectComposer( renderer );

    var renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
    outlinePass.edgeStrength = 4;
    outlinePass.edgeGlow = 1;
    outlinePass.edgeThickness = 3;
    outlinePass.pulsePeriod = 5;
    outlinePass.hiddenEdgeColor = new THREE.Color(0x000000);
    composer.addPass( outlinePass );

    //
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

    agents.forEach(function (agent) {
        var inter = raycaster.intersectObject(agent, true);
        if (inter.length) {
            interStack = interStack.concat(inter);
        }
    });

    papers.forEach(function (paper) {
        var inter = raycaster.intersectObject(paper, true);
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
    if (window.location.hash === '#debug') {
        stats.update();
    }
    composer.render();
}
function render() {
    controls.update();
    renderer.render(scene, camera);
}
