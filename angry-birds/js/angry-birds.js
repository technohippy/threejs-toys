// vars
var dx, dz;
var baseHeight = 0.5;

// constants
var ANGRY_BIRD_TEXTURE = THREE.ImageUtils.loadTexture('image/angry_birds.jpg');
var PIGGY_TEXTURE = THREE.ImageUtils.loadTexture('image/piggy.jpg');
var BOARD_TEXTURE = THREE.ImageUtils.loadTexture('image/board.jpg');
var GRASS_TEXTURE = THREE.ImageUtils.loadTexture('image/grass.jpg');
GRASS_TEXTURE.wrapS = THREE.RepeatWrapping;
GRASS_TEXTURE.wrapT = THREE.RepeatWrapping;
GRASS_TEXTURE.repeat.set(400, 400);

// settings
var DENSITY = 2;
var DEN_X = 0;
//var DEN_Z = 12;
var DEN_Z = 6;

// functions
function createBox(size, position, opts) {
  opts = opts || {};
  size.width *= 2;
  size.height *= 2;
  size.depth *= 2;
  position.x *= 2;
  position.y *= 2;
  position.z *= 2;
  if (!opts.mass && !opts.fixed) opts.mass = size.width * size.height * size.depth * DENSITY;
  var box = new C3.Box(size.width, size.height, size.depth, opts);
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
bird.position.set(0.5, 6, -1);
bird.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2);
world.add(bird);

// base
world.add(createBoard(
  {width:5, height:0.1, depth:5}, 
  //{x:DEN_X, y:0.5, z:DEN_Z}, 
  {x:DEN_X, y:baseHeight, z:DEN_Z}, 
  {fixed:true, color:0x660000, receiveShadow:true}
));
baseHeight += 0.1;

world.add(createBox(
  {width:4, height:0.7, depth:0.2},
//  {x:DEN_X, y:0.8, z:DEN_Z-2},
  {x:DEN_X, y:baseHeight+0.7/2, z:DEN_Z-2},
  {map:BOARD_TEXTURE}
));

world.add(createBox(
  {width:4, height:0.7, depth:0.2},
//  {x:DEN_X, y:0.8, z:DEN_Z+2},
  {x:DEN_X, y:baseHeight+0.7/2, z:DEN_Z+2},
  {map:BOARD_TEXTURE}
));

// base outer frame
for (dx = -1; dx <= 1; dx += 2) {
  for (dz = -1; dz <= 1; dz += 2) {
    world.add(createPost(
      {width:0.35, height:3, depth:0.35}, 
//      {x:DEN_X+dx, y:2, z:DEN_Z+dz}
      {x:DEN_X+dx, y:baseHeight+3/2, z:DEN_Z+dz}
    ));
  }
}

world.add(createBoard(
  {width:3, height:0.1, depth:3},
//  {x:DEN_X, y:3.5, z:DEN_Z}
  {x:DEN_X, y:baseHeight+3+0.1/2, z:DEN_Z}
));

// base inner frame
world.add(createBoard(
  {width:1.5, height:0.1, depth:1.5},
//  {x:DEN_X, y:0.6, z:DEN_Z},
  {x:DEN_X, y:baseHeight+0.1/2, z:DEN_Z},
  {fixed:true, map:BOARD_TEXTURE}
));

for (dx = -0.3; dx <= 0.3; dx += 0.6) {
  for (dz = -0.3; dz <= 0.3; dz += 0.6) {
    world.add(createPost(
      {width:0.3, height:2, depth:0.3},
//      {x:DEN_X-dx, y:2, z:DEN_Z-dz},
      {x:DEN_X-dx, y:baseHeight+2/2, z:DEN_Z-dz},
      {color:0x00ffff, shininess:200}
    ));
  }
}

world.add(createBoard(
  {width:1.5, height:0.1, depth:1.5},
//  {x:DEN_X, y:2.7, z:DEN_Z}
  {x:DEN_X, y:baseHeight+2+0.1/2, z:DEN_Z}
));

// top frame
baseHeight += 3+0.1;
for (dx = -0.5; dx <= 0.5; dx += 1) {
  for (dz = -0.5; dz <= 0.5; dz += 1) {
    world.add(createPost(
      {width:0.3, height:2.2, depth:0.3},
//      {x:DEN_X-dx, y:4.8, z:DEN_Z-dz}
      {x:DEN_X-dx, y:baseHeight+2.2/2, z:DEN_Z-dz}
    ));
  }
}

world.add(createBoard(
  {width:1.7, height:0.1, depth:1.7},
//  {x:DEN_X, y:6, z:DEN_Z}
  {x:DEN_X, y:baseHeight+2.2+0.1/2, z:DEN_Z}
));

// piggy
var piggy = new C3.Sphere(0.3, {mass:0.5, map:PIGGY_TEXTURE, ambient:0x999999});
//piggy.position.set(DEN_X, 3.8, DEN_Z);
piggy.position.set(DEN_X, baseHeight+0.3/2, DEN_Z);
world.add(piggy);

// top
baseHeight += 2.2;
world.add(createBox(
  {width:0.5, height:0.5, depth:0.5},
//  {x:DEN_X, y:6.5, z:DEN_Z},
  {x:DEN_X, y:baseHeight+=0.5/2, z:DEN_Z},
  {color:0x999999}
));

world.add(createPost(
  {width:0.3, height:0.5, depth:0.3},
//  {x:DEN_X, y:6.8, z:DEN_Z}
  {x:DEN_X, y:baseHeight+0.5/2, z:DEN_Z}
));

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
