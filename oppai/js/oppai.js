var world = new C3.World();
world.addDirectionalLight(0xffffff);
world.addAmbientLight(0x666666);

var sphere = new C3.Sphere(1, {mass:5, color:0xff0000});
sphere.position.set(0, 0, 3);
world.add(sphere);

var box = new C3.Box(2, 2, 2, {mass:5, color:0xff0000});
box.position.set(0.5, 0, 5);
world.add(box);

var ground = new C3.Ground({color:0x0000ff});
world.add(ground);

world.fog = new THREE.FogExp2(0x000000, 0.035);

world.start(1.0/24.0);