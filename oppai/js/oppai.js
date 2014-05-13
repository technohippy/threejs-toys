//var world = new C3.World();
var world = new CANNON.World();
world.allowSleep = true;
world.gravity.set(0,0,-9.82);
world.broadphase = new CANNON.NaiveBroadphase();
//world.solver.iterations = 5;
//world.solver.tolerance = 0.5;

var mass = 5, radius = 1;
var sphereShape = new CANNON.Sphere(radius);
var sphereBody = new CANNON.RigidBody(mass,sphereShape);
sphereBody.position.set(0,0,3);
world.add(sphereBody);

var boxShape = new CANNON.Box(new CANNON.Vec3(1,1,1));
var boxBody = new CANNON.RigidBody(mass,boxShape);
boxBody.position.set(0.5,0,5);
world.add(boxBody);

var groundShape = new CANNON.Plane();
var groundBody = new CANNON.RigidBody(0,groundShape);
world.add(groundBody);



//if(!Detector.webgl) Detector.addGetWebGLMessage();

function buildRenderer() {
  var renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMapType = THREE.PCFShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);
  return renderer;
}

function buildCamera() {
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
  camera.position = new THREE.Vector3(0, -10, 3);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}

function addLights(scene) {
  var light = new THREE.DirectionalLight(0xffffff);
  light.position = new THREE.Vector3(2, -2, 2);
  light.castShadow = true;
  light.shadowBias = 0.0001;
  //if (DEBUG) light.shadowCameraVisible = true;

  light.shadowCameraNear = 1;
  light.shadowCameraFar = 8;
  light.shadowCameraLeft = -5;
  light.shadowCameraRight = 5;
  light.shadowCameraTop = 5;
  light.shadowCameraBottom = -5;
  light.shadowMapWidth = 1024;
  light.shadowMapHeight = 1024;

  scene.add(light);

  var ambient = new THREE.AmbientLight(0x666666);
  scene.add(ambient);
}

function buildSphere() {
  var sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
  var sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    ambient: 0x333333
  });
  var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.castShadow = true;
  sphereMesh.receiveShadow = false;
  return sphereMesh;
}

function buildBox() {
  var boxGeometry = new THREE.BoxGeometry(2, 2, 2);
  var boxMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    ambient: 0x333333
  });
  var boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = false;
  return boxMesh;
}

function buildGround() {
  var groundGeometry = new THREE.BoxGeometry(10, 10, 0.01);
  var groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    ambient: 0x333333
  });
  var groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.castShadow = false;
  groundMesh.receiveShadow = true;
  return groundMesh;
}

function start() {
  var renderer = buildRenderer();
  document.body.appendChild(renderer.domElement);

  var scene = new THREE.Scene();

  var camera = buildCamera();
  scene.add(camera);

  addLights(scene);

  var sphere = buildSphere();
  sphere.position.copy(sphereBody.position);
  sphere.quaternion = sphereBody.quaternion;
  scene.add(sphere);

  var box = buildBox();
  box.position.copy(boxBody.position);
  box.quaternion = boxBody.quaternion;
  scene.add(box);

  var ground = buildGround();
  ground.position.copy(groundBody.position);
  scene.add(ground);

//  if (DEBUG) scene.add(new THREE.AxisHelper(5));
  //var controls = buildControls(camera, cameraHeight, cameraDistance);
  
  function render() {
    world.step(1.0/24.0);

    sphere.position.copy(sphereBody.position);
    sphere.quaternion = sphereBody.quaternion;
//    console.log(sphere.position);
//    console.log(sphereBody.position.x, sphereBody.position.y, sphereBody.position.z);

    box.position.copy(boxBody.position);
    box.quaternion.copy(boxBody.quaternion);

    requestAnimationFrame(render);
    //controls.update();
    renderer.render(scene, camera);
  };
  render();

  document.body.addEventListener('click', function() {
//    sphereBody.
  });

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }, false);
}

window.addEventListener('DOMContentLoaded', start);
