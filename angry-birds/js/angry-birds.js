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

var bird = new C3.Sphere(0.3, {mass:0.5, map:angryBirdTexture});
bird.position.set(0, -1, 6);
bird.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI/2);
world.add(bird);

// base
var box = new C3.Box(5, 5, 0.1, {fixed:true, color:0x660000, receiveShadow:true});
box.position.set(0, 12, 0.5);
world.add(box);

box = new C3.Box(4, 0.2, 0.7, {mass:2, map:boardTexture});
box.position.set(0, 10, 0.8);
world.add(box);

box = new C3.Box(4, 0.2, 0.7, {mass:2, map:boardTexture});
box.position.set(0, 14, 0.8);
world.add(box);

// base outer frame
box = new C3.Box(0.35, 0.35, 3, {mass:2, map:boardTexture});
box.position.set(0-1, 12-1, 2);
world.add(box);

box = new C3.Box(0.35, 0.35, 3, {mass:2, map:boardTexture});
box.position.set(0+1, 12-1, 2);
world.add(box);

box = new C3.Box(0.35, 0.35, 3, {mass:2, map:boardTexture});
box.position.set(0+1, 12+1, 2);
world.add(box);

box = new C3.Box(0.35, 0.35, 3, {mass:2, map:boardTexture});
box.position.set(0-1, 12+1, 2);
world.add(box);

box = new C3.Box(3, 3, 0.1, {mass:2, map:boardTexture});
box.position.set(0, 12, 3.5);
world.add(box);

// base inner frame
box = new C3.Box(1.5, 1.5, 0.1, {fixed:true, map:boardTexture});
box.position.set(0, 12, 0.6);
world.add(box);

box = new C3.Box(0.3, 0.3, 2, {mass:2, color:0x00ffff, shininess:200});
box.position.set(0-0.3, 12-0.3, 2);
world.add(box);

box = new C3.Box(0.3, 0.3, 2, {mass:2, color:0x00ffff, shininess:200});
box.position.set(0+0.3, 12-0.3, 2);
world.add(box);

box = new C3.Box(0.3, 0.3, 2, {mass:2, color:0x00ffff, shininess:200});
box.position.set(0+0.3, 12+0.3, 2);
world.add(box);

box = new C3.Box(0.3, 0.3, 2, {mass:2, color:0x00ffff, shininess:200});
box.position.set(0-0.3, 12+0.3, 2);
world.add(box);

box = new C3.Box(1.5, 1.5, 0.1, {mass:2, map:boardTexture});
box.position.set(0, 12, 2.7);
world.add(box);

// top frame
box = new C3.Box(0.3, 0.3, 2.2, {mass:1, map:boardTexture});
box.position.set(0-0.5, 12-0.5, 4.8);
world.add(box);

box = new C3.Box(0.3, 0.3, 2.2, {mass:1, map:boardTexture});
box.position.set(0+0.5, 12-0.5, 4.8);
world.add(box);

box = new C3.Box(0.3, 0.3, 2.2, {mass:1, map:boardTexture});
box.position.set(0+0.5, 12+0.5, 4.8);
world.add(box);

box = new C3.Box(0.3, 0.3, 2.2, {mass:1, map:boardTexture});
box.position.set(0-0.5, 12+0.5, 4.8);
world.add(box);

box = new C3.Box(1.7, 1.7, 0.1, {mass:1, map:boardTexture});
box.position.set(0, 12, 6);
world.add(box);

// top
box = new C3.Box(0.5, 0.5, 0.5, {mass:3, color:0x999999});
box.position.set(0, 12, 6.5);
world.add(box);

box = new C3.Box(0.3, 0.3, 0.5, {mass:0.5, map:boardTexture});
box.position.set(0, 12, 6.8);
world.add(box);

var ground = new C3.Ground({map:grassTexture});
world.add(ground);

world.start(1.0/24.0);

/*
box.addEventListener('collide', function(evt) {
  if (bird.isEqual(evt.with)) {
    var hit = document.getElementById('hit');
    hit.classList.remove('hide');
    setTimeout(function() {
      hit.classList.add('hide');
    }, 2000);
  }
});
*/

window.addEventListener('click', function() {
  var f = 303;
  var dt = 1/60;
  var impulse = new CANNON.Vec3(0, f * dt, f * dt);
  // TODO
  bird.applyImpulse(impulse, bird.cannonBody.position);
});
