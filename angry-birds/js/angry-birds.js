var angryBirdTexture = THREE.ImageUtils.loadTexture('image/angry_birds.jpg');
var boardTexture = THREE.ImageUtils.loadTexture('image/board.jpg');
var grassTexture = THREE.ImageUtils.loadTexture('image/grass.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(400, 400);

var world = new C3.World();
world.addDirectionalLight(0xffffff);
world.addAmbientLight(0x666666);
world.fog = new THREE.FogExp2(0xccccff, 0.010);

var sphere = new C3.Sphere(1, {mass:5, map:angryBirdTexture});
sphere.position.set(0, -1, 6);
sphere.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI/2);
world.add(sphere);

var box = new C3.Box(2, 2, 3, {mass:5, map:boardTexture});
box.position.set(0, 12.1, 3);
world.add(box);

var wall = new C3.Box(10, 1, 0.5, {fixed:true, map:boardTexture});
wall.position.set(0, -3, 0.25);
world.add(wall);

var ground = new C3.Ground({map:grassTexture});
world.add(ground);

world.start(1.0/24.0);

// TODO
box.cannonBody.addEventListener("collide", function(evt) {
  if (sphere.cannonBody == evt.with) {
    var hit = document.getElementById('hit');
    hit.classList.remove('hide');
    setTimeout(function() {
      hit.classList.add('hide');
    }, 2000);
  }
});

window.addEventListener('click', function() {
  var f = 2900;
  var dt = 1/60;
  var impulse = new CANNON.Vec3(0, f * dt, f * dt);
  // TODO
  sphere.applyImpulse(impulse, sphere.cannonBody.position);
});
