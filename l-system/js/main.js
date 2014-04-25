if(!Detector.webgl) Detector.addGetWebGLMessage();

var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var cameraHeight = 1;
var cameraDistance = 3;
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
camera.position = new THREE.Vector3(0, cameraHeight, cameraDistance);
camera.lookAt(new THREE.Vector3(0, cameraHeight, 0));
scene.add(camera);

var light = new THREE.DirectionalLight(0xffffff);
light.position = new THREE.Vector3(0.577, 0.577, 0.577);
scene.add(light);

var ambient = new THREE.AmbientLight(0x333333);
scene.add(ambient);

var tree = new Tree();
var l = new LSystem('F');
//l.addRule('F', 'F[+F-F-F]F[--F+F+F]');
//l.addRule('F', 'F[+F-***F-F]////F[--F*****++F+F]');
l.addRule('F', window.location.search || 'F[+F-F-F]F[--F+F+F]');
l.interpretor = new TreeInterpretor(tree);
l.step(2);
l.eval();
var group = tree.getGroup();

scene.add(group);

/*
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

// create shader material
var skyBoxMaterial = new THREE.ShaderMaterial( {
  fragmentShader: shader.fragmentShader,
  vertexShader: shader.vertexShader,
  uniforms: shader.uniforms,
  depthWrite: false,
  side: THREE.BackSide
});

// create skybox mesh
var skybox = new THREE.Mesh(
  new THREE.CubeGeometry(1000, 1000, 1000),
  skyBoxMaterial
);

scene.add(skybox);
*/

scene.add(new THREE.AxisHelper(5));

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
var rad = THREE.Math.degToRad((+new Date - baseTime) / 10 % 360);
camera.position.set(cameraDistance * Math.sin(rad), cameraHeight + Math.sin(rad), cameraDistance * Math.cos(rad));
camera.lookAt(new THREE.Vector3(0, cameraHeight, 0));

  renderer.render(scene, camera);
};
render();

var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = 100;
document.body.appendChild(stats.domElement);

window.addEventListener('resize', function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}, false);

