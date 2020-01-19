import * as TWEEN from "./js/tween";
import * as THREE from "./build/three.module.js";
// import Stats from './jsm/libs/stats.module.js';
import { GUI } from './jsm/libs/dat.gui.module.js';
import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { ColladaLoader } from "./jsm/loaders/ColladaLoader.js";

var container, stats, controls;
var camera, scene, renderer;
var model;

var features = {
  loader: true,
  touchEvents: false,
  navigation: false
};

init();
animate();

function init() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(10, 5, 9);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  // loading manager
  var loadingManager = new THREE.LoadingManager(function() {
    scene.add(model);
  });

  loadingManager.onProgress = function(url, loaded, total) {
    if (total === loaded) {
      setTimeout(function() {
        var uiLoader = document.getElementById("loader");
        if (uiLoader && features.loader) {
          uiLoader.classList.add("off");
        }
        if (features.navigation) {
          addControls();
        }
      }, 1000);
    }
  };

  // models
  var loader = new ColladaLoader(loadingManager);

  loader.load("./models/agent01.dae", function(collada) {
    model = collada.scene;
    for (var mat in collada.library.materials) {
      // collada.library.materials[mat].build.side = THREE.DoubleSide;
      collada.library.materials[mat].build.alphaTest = 0.05;
      collada.library.materials[mat].build.shininess = 30;
    }
    model.scale.set(1.4,1.4,1.4);
    model.position.set(3.2,-1,0.8);

    model.traverse(function(child) {
      child.castShadow = true;
      child.receiveShadow = true;
    });
  });

  // lights
  var fireLight = new THREE.PointLight(0xeecccc, 1.03);
  fireLight.position.set(-2.6, 0.1, -4.6);
  fireLight.distance = 8;
  fireLight.penumbra = 1;
  fireLight.shadow.radius = 8;
  fireLight.castShadow = true;
  fireLight.shadow.mapSize.width = 1024;
  fireLight.shadow.mapSize.height = 1024;
  fireLight.shadow.camera.near = 0.5;
  fireLight.shadow.camera.far = 10;
  
  scene.add(fireLight);

  var ambientLight = new THREE.AmbientLight(0xcccccc, 0.21);
  scene.add(ambientLight);
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(0, 1, 1).normalize();
  // scene.add(directionalLight);
  var spotLight;
  spotLight = new THREE.SpotLight(0xffffff, 1.47);
  spotLight.position.set(0, 2, 0);
  var targetObject = new THREE.Object3D();
  targetObject.position.set(0, 0, 0);
  scene.add(targetObject);
  spotLight.target = targetObject;
  spotLight.angle = Math.PI / 3;
  spotLight.decay = 1;
  spotLight.distance = 10;
  spotLight.penumbra = 1;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 1.5;
  spotLight.shadow.camera.far = 8;
  scene.add(spotLight);

  var lightHelper;
  lightHelper = new THREE.SpotLightHelper( spotLight );
  // scene.add( lightHelper );

  // //Create a helper for the shadow camera (optional)
  // var helper = new THREE.CameraHelper( spotLight.shadow.camera );
  // scene.add( helper );

  // renderer

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.03;
  controls.screenSpacePanning = false;
  controls.minDistance = 0.01;
  controls.maxDistance = 5.4;
  controls.target.set(0, 1, 0);
  controls.zoomSpeed = 0.5;
  controls.maxPolarAngle = Math.PI / 1.95;
  controls.update();
  //
  // stats = new Stats();
  // container.appendChild( stats.dom );
  //
  window.addEventListener("resize", onWindowResize, false);

  if (process.env.NODE_ENV !== 'production') {
    var gui = new GUI();

    gui.add(ambientLight, 'intensity', 0, 4).name("Ambient light").step(0.01).listen();
    gui.add(spotLight, 'intensity', 0, 4).name("Spot light").step(0.01).listen();
    gui.add(spotLight, 'penumbra', 0, 1).name("Spot feather").step(0.01).listen();
    gui.add(fireLight, 'intensity', 0, 4).name("Firelight").step(0.01).listen();

    // gui.add(fireLight.position, 'z', -50, 50).name('fire z').step(0.1).listen();
    // gui.add(fireLight.position, 'x', -50, 50).name('fire x').step(0.1).listen();
    // gui.add(fireLight.position, 'y', -50, 50).name('fire y').step(0.1).listen();

    gui.add(camera.position, 'z', -50, 50).step(0.1).listen();
    gui.add(camera.position, 'x', -50, 50).step(0.1).listen();
    gui.add(camera.position, 'y', -50, 50).step(0.1).listen();
  }
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
