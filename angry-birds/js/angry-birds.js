"use strict";

// vars
var dx, dz;

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
var DEN_Z = 24;

// functions
function createBox(size, position, opts) {
  opts = opts || {};
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
var bird = new C3.Sphere(0.6, {mass:1.1, map:ANGRY_BIRD_TEXTURE, ambient:0x999999});
//bird.position.set(1, 0.6, -2);
bird.position.set(0, 2.5 + 2.5*Math.sin(Math.PI/4), 0);
bird.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2);
world.add(bird);

// base
var baseHeight = 1;
world.add(createBoard(
  {width:10, height:0.2, depth:10}, 
  {x:DEN_X, y:baseHeight, z:DEN_Z}, 
  {fixed:true, color:0x660000, receiveShadow:true}
));
baseHeight += 0.2/2;

world.add(createBox(
  {width:8, height:1.4, depth:0.4},
  {x:DEN_X, y:baseHeight+1.4/2, z:DEN_Z-4},
  {map:BOARD_TEXTURE}
));

world.add(createBox(
  {width:8, height:1.4, depth:0.4},
  {x:DEN_X, y:baseHeight+1.4/2, z:DEN_Z+4},
  {map:BOARD_TEXTURE}
));

// base outer frame
for (dx = -2; dx <= 2; dx += 4) {
  for (dz = -2; dz <= 2; dz += 4) {
    world.add(createPost(
      {width:0.7, height:6, depth:0.7}, 
      {x:DEN_X+dx, y:baseHeight+6/2, z:DEN_Z+dz}
    ));
  }
}

world.add(createBoard(
  {width:6, height:0.2, depth:6},
  {x:DEN_X, y:baseHeight+6+0.2/2, z:DEN_Z}
));

// base inner frame
world.add(createBoard(
  {width:3, height:0.2, depth:3},
  {x:DEN_X, y:baseHeight+0.2/2, z:DEN_Z},
  {fixed:true, map:BOARD_TEXTURE}
));

for (dx = -0.6; dx <= 0.6; dx += 1.2) {
  for (dz = -0.6; dz <= 0.6; dz += 1.2) {
    world.add(createPost(
      {width:0.6, height:4, depth:0.6},
      {x:DEN_X-dx, y:baseHeight+4/2+0.2, z:DEN_Z-dz},
      {color:0x00ffff, shininess:200}
    ));
  }
}

world.add(createBoard(
  {width:3, height:0.2, depth:3},
  {x:DEN_X, y:baseHeight+4+0.2+0.2/2, z:DEN_Z}
));

// top frame
baseHeight += 6+0.2;
for (dx = -1; dx <= 1; dx += 2) {
  for (dz = -1; dz <= 1; dz += 2) {
    world.add(createPost(
      {width:0.6, height:4.4, depth:0.6},
      {x:DEN_X-dx, y:baseHeight+4.4/2, z:DEN_Z-dz}
    ));
  }
}

world.add(createBoard(
  {width:3.4, height:0.2, depth:3.4},
  {x:DEN_X, y:baseHeight+4.4+0.2/2, z:DEN_Z}
));

// piggy
var piggy = new C3.Sphere(0.6, {mass:0.5, map:PIGGY_TEXTURE, ambient:0x999999});
piggy.position.set(DEN_X, baseHeight+0.2+0.6/2, DEN_Z);
world.add(piggy);

// top
baseHeight += 4.4;
world.add(createBox(
  {width:1, height:1, depth:1},
  {x:DEN_X, y:baseHeight+0.2+1/2, z:DEN_Z},
  {color:0x999999}
));

baseHeight += 1;
world.add(createPost(
  {width:0.6, height:1, depth:0.6},
  {x:DEN_X, y:baseHeight+0.2+1/2, z:DEN_Z}
));

// ground
var ground = new C3.Ground({map:GRASS_TEXTURE});
world.add(ground);

// slingshot
var slingshotGeometry = new THREE.Geometry();
var barGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8);
var bar1 = new THREE.Mesh(barGeometry);
bar1.position.set(0, 2.5/2, 0);
var bar2 = new THREE.Mesh(barGeometry);
bar2.position.set(2.5/2*Math.sin(Math.PI/4), 2.5+2.5/2*Math.sin(Math.PI/4), 0);
bar2.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI/4);
var bar3 = new THREE.Mesh(barGeometry);
bar3.position.set(-2.5/2*Math.sin(Math.PI/4), 2.5+2.5/2*Math.sin(Math.PI/4), 0);
bar3.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI/4);
THREE.GeometryUtils.merge(slingshotGeometry, bar1);
THREE.GeometryUtils.merge(slingshotGeometry, bar2);
THREE.GeometryUtils.merge(slingshotGeometry, bar3);
var slingshot = new THREE.Mesh(slingshotGeometry, new THREE.MeshPhongMaterial({
  map:BOARD_TEXTURE, 
  transparent:true,
  opacity:0.5, 
  blending:THREE.NormalBlending
}));
slingshot.castShadow = true;
world.threeScene.add(slingshot);

world.start(1.0/24.0);
world.stop();

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
  //var f = 800;
  var f = 900;
  var dt = 1/60;
  var impulse = new CANNON.Vec3(0, f * dt, f * dt);
  // TODO
  bird.applyImpulse(impulse, bird.cannonBody.position);
world.isStopped = false;
});
