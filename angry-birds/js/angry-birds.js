var world = new C3.World();
world.addDirectionalLight(0xffffff);
world.addAmbientLight(0x666666);

var sphere = new C3.Sphere(1, {mass:5, color:0xff0000});
sphere.position.set(0, 0, 3);
world.add(sphere);

var box = new C3.Box(2, 2, 2, {mass:5, color:0xff0000});
box.position.set(0.5, 0, 5);
world.add(box);

var wall = new C3.Box(1, 10, 0.5, {mass:0, color:0x0000ff});
wall.position.set(-5, 0, 0.25);
world.add(wall);

var ground = new C3.Ground({color:0x0000ff});
world.add(ground);

world.fog = new THREE.FogExp2(0x000000, 0.035);

world.start(1.0/24.0);

window.addEventListener('click', function() {
  var f = 2000;
  var dt = 1/60;
  var impulse = new CANNON.Vec3(0, 0, f * dt);
  // TODO
  box.applyImpulse(impulse, box.cannonBody.position);
});
