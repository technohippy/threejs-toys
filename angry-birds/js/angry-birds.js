var angryBirdTexture = THREE.ImageUtils.loadTexture('image/angry_birds.jpg');
var piggyTexture = THREE.ImageUtils.loadTexture('image/piggy.jpg');
var boardTexture = THREE.ImageUtils.loadTexture('image/board.jpg');
var grassTexture = THREE.ImageUtils.loadTexture('image/grass.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(400, 400);

var world = new C3.World();
world.addDirectionalLight(0xffffff);
world.addAmbientLight(0x666666);
world.fog = new THREE.FogExp2(0xccccff, 0.010);

// angry birds
var bird = new C3.Sphere(0.3, {mass:1.1, map:angryBirdTexture, ambient:0x999999});
//bird.position.set(0, -1, 6);
bird.position.set(0.5, 6, -1);
bird.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2);
world.add(bird);

// base
var box = new C3.Box(5, 0.1, 5, {fixed:true, color:0x660000, receiveShadow:true});
box.position.set(0, 0.5, 12);
world.add(box);

box = new C3.Box(4, 0.7, 0.2, {mass:2, map:boardTexture});
box.position.set(0, 0.8, 10);
world.add(box);

box = new C3.Box(4, 0.7, 0.2, {mass:2, map:boardTexture});
box.position.set(0, 0.8, 14);
world.add(box);

// base outer frame
box = new C3.Box(0.35, 3, 0.35, {mass:2, map:boardTexture});
box.position.set(0-1, 2, 12-1);
world.add(box);

box = new C3.Box(0.35, 3, 0.35, {mass:2, map:boardTexture});
box.position.set(0+1, 2, 12-1);
world.add(box);

box = new C3.Box(0.35, 3, 0.35, {mass:2, map:boardTexture});
box.position.set(0+1, 2, 12+1);
world.add(box);

box = new C3.Box(0.35, 3, 0.35, {mass:2, map:boardTexture});
box.position.set(0-1, 2, 12+1);
world.add(box);

box = new C3.Box(3, 0.1, 3, {mass:2, map:boardTexture});
box.position.set(0, 3.5, 12);
world.add(box);

// base inner frame
box = new C3.Box(1.5, 0.1, 1.5, {fixed:true, map:boardTexture});
box.position.set(0, 0.6, 12);
world.add(box);

box = new C3.Box(0.3, 2, 0.3, {mass:2, color:0x00ffff, shininess:200});
box.position.set(0-0.3, 2, 12-0.3);
world.add(box);

box = new C3.Box(0.3, 2, 0.3, {mass:2, color:0x00ffff, shininess:200});
box.position.set(0+0.3, 2, 12-0.3);
world.add(box);

box = new C3.Box(0.3, 2, 0.3, {mass:2, color:0x00ffff, shininess:200});
box.position.set(0+0.3, 2, 12+0.3);
world.add(box);

box = new C3.Box(0.3, 2, 0.3, {mass:2, color:0x00ffff, shininess:200});
box.position.set(0-0.3, 2, 12+0.3);
world.add(box);

box = new C3.Box(1.5, 0.1, 1.5, {mass:2, map:boardTexture});
box.position.set(0, 2.7, 12);
world.add(box);

// top frame
box = new C3.Box(0.3, 2.2, 0.3, {mass:1, map:boardTexture});
box.position.set(0-0.5, 4.8, 12-0.5);
world.add(box);

box = new C3.Box(0.3, 2.2, 0.3, {mass:1, map:boardTexture});
box.position.set(0+0.5, 4.8, 12-0.5);
world.add(box);

box = new C3.Box(0.3, 2.2, 0.3, {mass:1, map:boardTexture});
box.position.set(0+0.5, 4.8, 12+0.5);
world.add(box);

box = new C3.Box(0.3, 2.2, 0.3, {mass:1, map:boardTexture});
box.position.set(0-0.5, 4.8, 12+0.5);
world.add(box);

box = new C3.Box(1.7, 0.1, 1.7, {mass:1, map:boardTexture});
box.position.set(0, 6, 12);
world.add(box);

// top
box = new C3.Box(0.5, 0.5, 0.5, {mass:3, color:0x999999});
box.position.set(0, 6.5, 12);
world.add(box);

box = new C3.Box(0.3, 0.5, 0.3, {mass:0.5, map:boardTexture});
box.position.set(0, 6.8, 12);
world.add(box);

// piggy
/*
box = new C3.Box(0.5, 0.1, 0.1, {mass:0.5, map:boardTexture});
box.position.set(0, 3.6, 12-0.7);
world.add(box);
box = new C3.Box(0.5, 0.1, 0.1, {mass:0.5, map:boardTexture});
box.position.set(0, 3.6, 12+0.7);
world.add(box);
box = new C3.Box(0.1, 0.1, 0.5, {mass:0.5, map:boardTexture});
box.position.set(0-0.7, 3.6, 12);
world.add(box);
box = new C3.Box(0.1, 0.1, 0.5, {mass:0.5, map:boardTexture});
box.position.set(0+0.7, 3.6, 12);
world.add(box);
*/

var piggy = new C3.Sphere(0.3, {mass:0.5, map:piggyTexture, ambient:0x999999});
piggy.position.set(0, 3.8, 12);
world.add(piggy);

// ground
var ground = new C3.Ground({map:grassTexture});
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
