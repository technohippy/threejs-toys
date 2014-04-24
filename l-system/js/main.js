if(!Detector.webgl) Detector.addGetWebGLMessage();

var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColorHex(0x000000, 1);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
camera.position = new THREE.Vector3(0, 8, 8);
camera.lookAt(new THREE.Vector3(0, 8, -8));
scene.add(camera);

var light = new THREE.DirectionalLight(0xcccccc);
light.position = new THREE.Vector3(0.577, 0.577, 0.577);
scene.add(light);

var ambient = new THREE.AmbientLight(0x333333);
scene.add(ambient);

var tree = new Tree();
var l = new LSystem('F');
l.addRule('F', 'F[+F-F-F]F[--F+F+F]');
l.interpretor = new TreeInterpretor(tree);
l.step(3);
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

var controls = new THREE.OrbitControls(camera);
controls.center = new THREE.Vector3(0, 0, 0);

function render() {
  requestAnimationFrame(render);

  controls.update();

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

