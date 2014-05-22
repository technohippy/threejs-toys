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

var cameraDirection = new THREE.Vector3(0, 0, 5);

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

function createSlingshotMesh() {
  var slingshotGeometry = new THREE.Geometry();
  var barGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8);
  var bar = new THREE.Mesh(barGeometry);
  bar.position.set(0, 2.5/2, 0);

  var armGeometry = new THREE.TorusGeometry(2, 0.2, 8, 16, -Math.PI);
  var arm = new THREE.Mesh(armGeometry);
  arm.position.set(0, 2.5+2+0.2-0.03, 0);
  
  THREE.GeometryUtils.merge(slingshotGeometry, bar);
  THREE.GeometryUtils.merge(slingshotGeometry, arm);
  var slingshot = new THREE.Mesh(slingshotGeometry, new THREE.MeshPhongMaterial({
    map:BOARD_TEXTURE, 
    transparent:true,
    opacity:0.5, 
    blending:THREE.NormalBlending
  }));
  slingshot.castShadow = true;
  return slingshot;
}

// construct world
var world = new C3.World();
world.addDirectionalLight(0xffffff);
world.addAmbientLight(0x666666);
world.fog = new THREE.FogExp2(0xccccff, 0.010);

// angry birds
var birdStartPosition = new THREE.Vector3(0, 2.5/*bar*/ + 2/*arm*/, 0);
var bird = new C3.Sphere(0.5, {
  mass:1.1, 
  angularDamping:0.8,
  threeMaterial:new THREE.MeshPhongMaterial({
    map:ANGRY_BIRD_TEXTURE, 
    ambient:0x999999,
    transparent:true,
    opacity:0.5, 
    blending:THREE.NormalBlending
  }),
  cannonMaterial:world.cannonWorld.defaultMaterial
});
bird.position.copy(birdStartPosition);
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
var piggy = new C3.Sphere(0.6, {mass:0.5, angularDamping:0.8, map:PIGGY_TEXTURE, ambient:0x999999});
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
var groundMaterial = new CANNON.Material();
var ground = new C3.Ground({map:GRASS_TEXTURE});
world.add(ground);

// slingshot
var slingshot = createSlingshotMesh();
slingshot.position.z += 1;
world.threeScene.add(slingshot);

// init camera position
world.threeCamera.position.copy(new THREE.Vector3().copy(bird.threeMesh.position).sub(cameraDirection));
world.threeCamera.lookAt(bird.threeMesh.position);

world.start(1.0/24.0, function() {
  /*
  world.threeCamera.position.set(
    bird.threeMesh.position.x, 
    bird.threeMesh.position.y, 
    bird.threeMesh.position.z - 5
    //bird.threeMesh.position.z - 10
  );
  world.threeCamera.lookAt(piggy.threeMesh.position);
  */
});
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

function dragWorld(event) {
  var dx = dragStartMousePosition.x - event.clientX;
  var dy = dragStartMousePosition.y - event.clientY;
  dragStartMousePosition = new THREE.Vector3(event.clientX, event.clientY, 0);

  var yAxis = new THREE.Vector3(0, 1, 0);
  var yawAngle = -dx / 5000 * Math.PI;
  var yawMatrix = new THREE.Matrix4().makeRotationAxis(yAxis, yawAngle);
  var xAxis = new THREE.Vector3(1, 0, 0);
  var pitchAngle = dy / 5000 * Math.PI;
  var pitchMatrix = new THREE.Matrix4().makeRotationAxis(xAxis, pitchAngle);
  cameraDirection.applyMatrix4(yawMatrix);
  cameraDirection.applyMatrix4(pitchMatrix);
  world.threeCamera.position.copy(new THREE.Vector3().copy(bird.threeMesh.position).sub(cameraDirection));
  world.threeCamera.lookAt(bird.threeMesh.position);
}

// TODO
function dragBird(event) {
  var currentMousePosition = new THREE.Vector3(event.clientX, event.clientY, 0);
  var dist = dragStartMousePosition.distanceTo(currentMousePosition) / 1000;
  bird.position.set(
    birdStartPosition.x - cameraDirection.x * dist,
    birdStartPosition.y - cameraDirection.y * dist,
    birdStartPosition.z - cameraDirection.z * dist
  );
  return dist;
}

var isBirdDragging = false;
var isWorldDragging = false;
var dragStartMousePosition;
var projector = new THREE.Projector();
document.addEventListener('mousedown', function(event) {
  dragStartMousePosition = new THREE.Vector3(event.clientX, event.clientY, 0);
  var vector = new THREE.Vector3(
    (event.clientX / window.innerWidth) * 2 - 1, 
    -(event.clientY / window.innerHeight) * 2 + 1, 
    0.5
  );
  var camera = world.threeCamera;
  projector.unprojectVector(vector, camera);
  var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
  var intersects = ray.intersectObjects([bird.threeMesh]);
  if (0 < intersects.length) {
    isBirdDragging = true;
    isWorldDragging = false;
  }
  else {
    isBirdDragging = false;
    isWorldDragging = true;
  }
});
document.addEventListener('mousemove', function(event) {
  if (isBirdDragging) {
    dragBird(event);
  }
  else if (isWorldDragging) {
    dragWorld(event);
  }
});
document.addEventListener('mouseup', function(event) {
  if (isBirdDragging) {
    isBirdDragging = false;
    var dist = dragBird(event);

    var f = dist * 5000;
    var dt = 1/60;
    var impulseDir = new CANNON.Vec3(cameraDirection.x, cameraDirection.y, cameraDirection.z);
    impulseDir.normalize();
    var impulse = impulseDir.mult(f * dt);
    bird.applyImpulse(impulse, bird.cannonBody.position);
    world.isStopped = false;
    slingshot.material.opacity = 1;
    bird.threeMesh.material.opacity = 1;
  }
  else if (isWorldDragging) {
    isWorldDragging = false;
  }
});
document.addEventListener('keypress', function(event) {
  if (event.charCode == 13) { // enter
    if (world.isStopped) {
      window.location.reload();
    }
    else {
      world.stop();
      bird.position.copy(birdStartPosition);
      bird.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2);
      slingshot.material.opacity = 0.5;
      bird.threeMesh.material.opacity = 0.5;
      cameraDirection = new THREE.Vector3(0, 0, 5);
      world.threeCamera.position.copy(new THREE.Vector3().copy(bird.threeMesh.position).sub(cameraDirection));
      world.threeCamera.lookAt(bird.threeMesh.position);
    }
  }
});
