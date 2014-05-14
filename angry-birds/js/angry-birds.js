var angryBirdTexture = THREE.ImageUtils.loadTexture('image/angry_birds.jpg');
var boardTexture = THREE.ImageUtils.loadTexture('image/board.jpg');
var grassTexture = THREE.ImageUtils.loadTexture('image/grass.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(400, 400);

var world = new C3.World();
world.addDirectionalLight(0xffffff);
world.addAmbientLight(0x666666);
world.fog = new THREE.FogExp2(0xccccff, 0.035);

var sphere = new C3.Sphere(1, {mass:5, map:angryBirdTexture});
sphere.position.set(0, 0, 5);
sphere.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI/2);
world.add(sphere);

var box = new C3.Box(2, 2, 2, {mass:5, map:boardTexture});
box.position.set(1.1, 0, 3);
world.add(box);

var wall = new C3.Box(1, 10, 0.5, {fixed:true, map:boardTexture});
wall.position.set(-5, 0, 0.25);
world.add(wall);

var ground = new C3.Ground({map:grassTexture});
//var ground = new C3.Ground({map:grassTexture, bumpMap:grassTexture});
world.add(ground);

world.start(1.0/24.0);

window.addEventListener('click', function() {
  var f = 2000;
  var dt = 1/60;
  var impulse = new CANNON.Vec3(0, 0, f * dt);
  // TODO
  sphere.applyImpulse(impulse, sphere.cannonBody.position);
  box.applyImpulse(impulse, box.cannonBody.position);
});
