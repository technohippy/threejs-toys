if(!Detector.webgl) Detector.addGetWebGLMessage();

var PARAMS = Utils.getParams();
var DEBUG = PARAMS['debug'];

var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMapType = THREE.PCFShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var cameraHeight = 0.7;
var cameraDistance = 3;
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
camera.position = new THREE.Vector3(0, cameraHeight, cameraDistance);
camera.lookAt(new THREE.Vector3(0, cameraHeight, 0));
scene.add(camera);

var light = new THREE.DirectionalLight(0xffffff);
light.position = new THREE.Vector3(2, 2, 2);
light.castShadow = true;
light.shadowBias = 0.0001;
if (DEBUG) light.shadowCameraVisible = true;

light.shadowCameraNear = 1;
light.shadowCameraFar = 8;
light.shadowCameraLeft = -5;
light.shadowCameraRight = 5;
light.shadowCameraTop = 5;
light.shadowCameraBottom = -5;
light.shadowMapWidth = 1024;
light.shadowMapHeight = 1024;


scene.add(light);

var ambient = new THREE.AmbientLight(0x333333);
scene.add(ambient);

var tree = new Tree();
var l = new LSystem();
for (var key in PARAMS) {
  if (PARAMS.hasOwnProperty(key)) {
    var val = PARAMS[key];
    if (key.match(/^rule-/)) {
      l.addRule(key.substring('rule-'.length), val);
    }
    else if (key === 'init') {
      l.value = val;
    }
  }
}
if (!l.value) {
  l.value = 'F';
}
if (Object.getOwnPropertyNames(l.rules).length === 0) {
  l.addRule('F', 'F[+F-F-F]F[--F+F+F]');
}
l.interpretor = new TreeInterpretor(tree);
l.step(3);
l.eval();
var treeMesh = tree.getMesh({
  castShadow: true,
  receiveShadow: false
});

scene.add(treeMesh);

var urls = [
  'images/cube01.jpg',
  'images/cube02.jpg',
  'images/cube03.jpg',
  'images/cube04.jpg',
  'images/cube05.jpg',
  'images/cube06.jpg'
];

var cubemap = THREE.ImageUtils.loadTextureCube(urls); // load textures
cubemap.format = THREE.RGBFormat;

var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib
shader.uniforms['tCube'].value = cubemap; // apply textures to shader

var skyBoxMaterial = new THREE.ShaderMaterial( {
  fragmentShader: shader.fragmentShader,
  vertexShader: shader.vertexShader,
  uniforms: shader.uniforms,
  depthWrite: false,
  side: THREE.BackSide
});

var skybox = new THREE.Mesh(
  new THREE.CubeGeometry(1000, 1000, 1000),
  skyBoxMaterial
);

scene.add(skybox);

var groundTexture = THREE.ImageUtils.loadTexture('images/cube04.jpg');
var groundGeometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
var groundMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  map: groundTexture, 
  bumpMap: groundTexture, 
  bumpScale: 0.01
});
var ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = THREE.Math.degToRad(-90);
//ground.position.y = -1;
ground.castShadow = false;
ground.receiveShadow = true;
scene.add(ground);

if (DEBUG) scene.add(new THREE.AxisHelper(5));

/*
var controls = new THREE.FirstPersonControls(camera);
controls.movementSpeed = 10;
controls.lookSpeed = 0.05
controls.lon = -85;
controls.center = new THREE.Vector3(0, 0, 0);
*/
/*
var controls = new THREE.OrbitControls(camera);
controls.center = new THREE.Vector3(0, 0, 0);
*/

var baseTime = +new Date;
function render() {
  requestAnimationFrame(render);

//  controls.update();
var rad = THREE.Math.degToRad((+new Date - baseTime) / 50 % 360);
camera.position.set(cameraDistance * Math.sin(rad), cameraHeight + 0.5 * Math.sin(rad), cameraDistance * Math.cos(rad));
camera.lookAt(new THREE.Vector3(0, cameraHeight, 0));

  renderer.render(scene, camera);
};
render();

if (DEBUG) {
  var stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.zIndex = 100;
  document.body.appendChild(stats.domElement);
}

window.addEventListener('resize', function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}, false);

