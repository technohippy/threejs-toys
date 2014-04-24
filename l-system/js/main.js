if(!Detector.webgl) Detector.addGetWebGLMessage();

var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColorHex(0x000000, 1);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight);
camera.position = new THREE.Vector3(0, 0, 8);
camera.lookAt(new THREE.Vector3(0, 0, 0));
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
l.step(2);
l.eval();
var group = tree.getGroup();

scene.add(group);

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

