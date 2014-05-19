var dx, dz;
var ANGRY_BIRD_TEXTURE = THREE.ImageUtils.loadTexture('image/angry_birds.jpg');
var PIGGY_TEXTURE = THREE.ImageUtils.loadTexture('image/piggy.jpg');
var BOARD_TEXTURE = THREE.ImageUtils.loadTexture('image/board.jpg');
var GRASS_TEXTURE = THREE.ImageUtils.loadTexture('image/grass.jpg');
GRASS_TEXTURE.wrapS = THREE.RepeatWrapping;
GRASS_TEXTURE.wrapT = THREE.RepeatWrapping;
GRASS_TEXTURE.repeat.set(400, 400);
var DENSITY = 2;

var box; // TODO

function createBox(size, position, opts) {
  opts = opts || {};
  if (!opts.mass && !opts.fixed) opts.mass = size.x * size.y * size.z * DENSITY;
  var box = new C3.Box(size.x, size.y, size.z, opts);
  box.position.copy(position);
  return box;
}

function createBoard(size, position, opts) {
  opts = opts || {};
  // TODO: 厚さを指定しなくていいようにしたり
  if (!opts.map && !opts.color) opts.map = BOARD_TEXTURE;
  return createBox(size, position, opts);
}

function createPost(size, position, opts) {
  opts = opts || {};
  // TODO: 太さを指定しなくていいようにしたり
  if (!opts.map && !opts.color) opts.map = BOARD_TEXTURE;
  return createBox(size, position, opts);
}

var world = new C3.World();
world.addDirectionalLight(0xffffff);
world.addAmbientLight(0x666666);
world.fog = new THREE.FogExp2(0xccccff, 0.010);

// angry birds
var bird = new C3.Sphere(0.3, {mass:1.1, map:ANGRY_BIRD_TEXTURE, ambient:0x999999});
//bird.position.set(0, -1, 6);
bird.position.set(0.5, 6, -1);
bird.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2);
world.add(bird);

// base
world.add(createBoard(
  {x:5, y:0.1, z:5}, 
  {x:0, y:0.5, z:12}, 
  {fixed:true, color:0x660000, receiveShadow:true}
));

world.add(createBox(
  {x:4, y:0.7, z:0.2},
  {x:0, y:0.8, z:10},
  {map:BOARD_TEXTURE}
));

world.add(createBox(
  {x:4, y:0.7, z:0.2},
  {x:0, y:0.8, z:14},
  {map:BOARD_TEXTURE}
));

// base outer frame
for (dx = -1; dx <= 1; dx += 2) {
  for (dz = -1; dz <= 1; dz += 2) {
    world.add(createPost(
      {x:0.35, y:3, z:0.35}, 
      {x:0+dx, y:2, z:12+dz}
    ));
  }
}

world.add(createBoard(
  {x:3, y:0.1, z:3},
  {x:0, y:3.5, z:12}
));

// base inner frame
world.add(createBoard(
  {x:1.5, y:0.1, z:1.5},
  {x:0, y:0.6, z:12},
  {fixed:true, map:BOARD_TEXTURE}
));

for (dx = -0.3; dx <= 0.3; dx += 0.6) {
  for (dz = -0.3; dz <= 0.3; dz += 0.6) {
    world.add(createPost(
      {x:0.3, y:2, z:0.3},
      {x:0-dx, y:2, z:12-dz},
      {color:0x00ffff, shininess:200}
    ));
  }
}

world.add(createBoard(
  {x:1.5, y:0.1, z:1.5},
  {x:0, y:2.7, z:12}
));

// top frame
for (dx = -0.5; dx <= 0.5; dx += 1) {
  for (dz = -0.5; dz <= 0.5; dz += 1) {
    world.add(createPost(
      {x:0.3, y:2.2, z:0.3},
      {x:0-dx, y:4.8, z:12-dz}
    ));
  }
}

world.add(createBoard(
  {x:1.7, y:0.1, z:1.7},
  {x:0, y:6, z:12}
));

// top
box = new C3.Box(0.5, 0.5, 0.5, {mass:3, color:0x999999});
box.position.set(0, 6.5, 12);
world.add(box);

box = new C3.Box(0.3, 0.5, 0.3, {mass:0.5, map:BOARD_TEXTURE});
box.position.set(0, 6.8, 12);
world.add(box);

// piggy
var piggy = new C3.Sphere(0.3, {mass:0.5, map:PIGGY_TEXTURE, ambient:0x999999});
piggy.position.set(0, 3.8, 12);
world.add(piggy);

// ground
var ground = new C3.Ground({map:GRASS_TEXTURE});
world.add(ground);

world.start(1.0/24.0);

piggy.addEventListener('collide', function(evt) {
  if (bird.isEqual(evt.with)) {
    var hit = document.getElementById('hit');
    hit.classList.remove('hide');
    setTimeout(function() {
      hit.classList.add('hide');
    }, 2000);
  }
});

window.addEventListener('click', function() {
  var f = 730;
  var dt = 1/60;
  var impulse = new CANNON.Vec3(0, f * dt, f * dt);
  // TODO
  bird.applyImpulse(impulse, bird.cannonBody.position);
});
