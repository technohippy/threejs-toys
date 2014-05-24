(function() {
"use strict";

var AngryBirds = {
  Texture: {
    BIRD: THREE.ImageUtils.loadTexture('image/angry_birds.jpg'),
    PIGGY: THREE.ImageUtils.loadTexture('image/piggy.jpg'),
    BOARD: THREE.ImageUtils.loadTexture('image/board.jpg'),
    get GRASS() {
      if (!this._GRASS) {
        this._GRASS = THREE.ImageUtils.loadTexture('image/grass.jpg');
        this._GRASS.wrapS = THREE.RepeatWrapping;
        this._GRASS.wrapT = THREE.RepeatWrapping;
        this._GRASS.repeat.set(400, 400);
      }
      return this._GRASS;
    }
  },

  Mode: {
    SIGHT_SETTING: 0,
    FLYING: 1,
    SIDEVIEW: 2
  }
};

AngryBirds.Setting = function(density) {
  this.density = density || 2;
};

AngryBirds.Stage = function() {
  this.game = null;
  this.piggies = [];
};

AngryBirds.Stage.prototype = {
  constructor: AngryBirds.Stage,

  createBox: function(size, position, opts) {
    opts = opts || {};
    if (!opts.mass && !opts.fixed) {
      opts.mass = size.width * size.height * size.depth * this.game.setting.density;
    }
    var box = new C3.Box(size.width, size.height, size.depth, opts);
    box.position.copy(position);
    return box;
  },

  createBoard: function(size, position, opts) {
    opts = opts || {};
    // TODO: 厚さを指定しなくていいようにしたり
    if (!opts.map && !opts.color) opts.map = AngryBirds.Texture.BOARD;
    return this.createBox(size, position, opts);
  },

  createPost: function(size, position, opts) {
    opts = opts || {};
    // TODO: 太さを指定しなくていいようにしたり
    if (!opts.map && !opts.color) opts.map = AngryBirds.Texture.BOARD;
    return this.createBox(size, position, opts);
  },

  setupEventListeners: function() {
    this.piggies.forEach(function(piggy) {
      piggy.addEventListener('collide', function(evt) {
        var impact = evt.with.velocity.distanceTo(piggy.cannonBody.velocity) * evt.with.mass;
        console.log(impact); // TODO: 合計100くらいで破壊かな
        if (this.game.bird.isEqual(evt.with)) {
          var hit = document.getElementById('hit');
          hit.classList.remove('hide');
          setTimeout(function() {
            hit.classList.add('hide');
          }, 2000);
        }
      }.bind(this));
    }.bind(this));
  }
};

AngryBirds.Stage1 = function(denPosition) {
  AngryBirds.Stage.call(this);
  this.denPosition =  denPosition || {x:0, z:24};
};

AngryBirds.Stage1.prototype = Object.create(AngryBirds.Stage.prototype);
AngryBirds.Stage1.prototype.constructor = AngryBirds.Stage1;
AngryBirds.Stage1.prototype.constructOn = function(world) {
  var dx, dz;
  var baseHeight = 1;
  world.add(this.createBoard(
    {width:10, height:0.2, depth:10}, 
    {x:this.denPosition.x, y:baseHeight, z:this.denPosition.z}, 
    {fixed:true, color:0x660000, receiveShadow:true}
  ));
  baseHeight += 0.2/2;

  world.add(this.createBox(
    {width:8, height:1.4, depth:0.4},
    {x:this.denPosition.x, y:baseHeight+1.4/2, z:this.denPosition.z-4},
    {map:AngryBirds.Texture.BOARD}
  ));

  world.add(this.createBox(
    {width:8, height:1.4, depth:0.4},
    {x:this.denPosition.x, y:baseHeight+1.4/2, z:this.denPosition.z+4},
    {map:AngryBirds.Texture.BOARD}
  ));

  // base outer frame
  for (dx = -2; dx <= 2; dx += 4) {
    for (dz = -2; dz <= 2; dz += 4) {
      world.add(this.createPost(
        {width:0.7, height:6, depth:0.7}, 
        {x:this.denPosition.x+dx, y:baseHeight+6/2, z:this.denPosition.z+dz}
      ));
    }
  }

  world.add(this.createBoard(
    {width:6, height:0.2, depth:6},
    {x:this.denPosition.x, y:baseHeight+6+0.2/2, z:this.denPosition.z}
  ));

  // base inner frame
  world.add(this.createBoard(
    {width:3, height:0.2, depth:3},
    {x:this.denPosition.x, y:baseHeight+0.2/2, z:this.denPosition.z},
    {fixed:true, map:AngryBirds.Texture.BOARD}
  ));

  for (dx = -0.6; dx <= 0.6; dx += 1.2) {
    for (dz = -0.6; dz <= 0.6; dz += 1.2) {
      world.add(this.createPost(
        {width:0.6, height:4, depth:0.6},
        {x:this.denPosition.x-dx, y:baseHeight+4/2+0.2, z:this.denPosition.z-dz},
        {color:0x00ffff, shininess:200}
      ));
    }
  }

  world.add(this.createBoard(
    {width:3, height:0.2, depth:3},
    {x:this.denPosition.x, y:baseHeight+4+0.2+0.2/2, z:this.denPosition.z}
  ));

  // top frame
  baseHeight += 6+0.2;
  for (dx = -1; dx <= 1; dx += 2) {
    for (dz = -1; dz <= 1; dz += 2) {
      world.add(this.createPost(
        {width:0.6, height:4.4, depth:0.6},
        {x:this.denPosition.x-dx, y:baseHeight+4.4/2, z:this.denPosition.z-dz}
      ));
    }
  }

  world.add(this.createBoard(
    {width:3.4, height:0.2, depth:3.4},
    {x:this.denPosition.x, y:baseHeight+4.4+0.2/2, z:this.denPosition.z}
  ));

  // piggy
  var piggy = new C3.Sphere(0.6, {mass:0.5, angularDamping:0.8, map:AngryBirds.Texture.PIGGY, ambient:0x999999});
  piggy.position.set(this.denPosition.x, baseHeight+0.2+0.6/2, this.denPosition.z); // 7.8
  world.add(piggy);
  this.piggies.push(piggy);

  // top
  baseHeight += 4.4;
  world.add(this.createBox(
    {width:1, height:1, depth:1},
    {x:this.denPosition.x, y:baseHeight+0.2+1/2, z:this.denPosition.z},
    {color:0x999999}
  ));

  baseHeight += 1;
  world.add(this.createPost(
    {width:0.6, height:1, depth:0.6},
    {x:this.denPosition.x, y:baseHeight+0.2+1/2, z:this.denPosition.z}
  ));
};

AngryBirds.Game = function(opts) {
  if (!opts.stages) throw 'stages is the mandatory option.';
  this.stages = opts.stages;
  this.stages.forEach(function(stage) {stage.game = this}, this);
  this.currentStageNo = 0;
  this.setting = new AngryBirds.Setting(opts.density);
  this.mode = AngryBirds.Mode.SIGHT_SETTING;
  this.world = null;
  this.slingshot = null;
  this.bird = null;
  this.birdStartPosition = new THREE.Vector3(0, 2.5/*bar*/ + 2/*arm*/, 0);
  this.piggy = null;

  this.isBirdDragging = false;
  this.isWorldDragging = false;
  this.dragStartMousePosition;
  this.projector = new THREE.Projector();
};

AngryBirds.Game.prototype = {
  constructor: AngryBirds.Game,

  construct: function() {
    this.world = new C3.World();
    this.world.addDirectionalLight(0xffffff);
    this.world.addAmbientLight(0x666666);
    this.world.fog = new THREE.FogExp2(0xccccff, 0.010);

    // ground
    var ground = new C3.Ground({map:AngryBirds.Texture.GRASS});
    //var ground = new C3.Ground({color:0x00ff00});
    this.world.add(ground);

    // slingshot
    this.slingshot = this.createSlingshotMesh();
    this.slingshot.position.z += 1;
    this.world.threeScene.add(this.slingshot);

    // bird
    this.bird = this.createBird();
    this.bird.position.copy(this.birdStartPosition);
    this.bird.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2);
    this.world.add(this.bird);

    this.constructStage(this.world);
  },

  createBird: function(world) {
    var bird = new C3.Sphere(0.5, {
      mass:1.1, 
      angularDamping:0.8,
      threeMaterial:new THREE.MeshPhongMaterial({
        map:AngryBirds.Texture.BIRD, 
        ambient:0x999999,
        transparent:true,
        opacity:0.5, 
        blending:THREE.NormalBlending
      }),
      cannonMaterial:this.world.cannonWorld.defaultMaterial
    });
    return bird;
  },

  constructStage: function(world) {
    var stage = this.stages[this.currentStageNo];
    stage.constructOn(world);
    stage.setupEventListeners();
  },

  createSlingshotMesh: function() {
    var slingshotGeometry = new THREE.Geometry();
    var barGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8);
    var bar = new THREE.Mesh(barGeometry);
    bar.position.set(0, 2.5/2, 0);

    var armGeometry = new THREE.TorusGeometry(2, 0.2, 8, 16, Math.PI);
    var arm = new THREE.Mesh(armGeometry);
    arm.position.set(0, 2.5+2+0.2-0.03, 0);
    arm.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
    
    THREE.GeometryUtils.merge(slingshotGeometry, bar);
    THREE.GeometryUtils.merge(slingshotGeometry, arm);
    var slingshot = new THREE.Mesh(slingshotGeometry, new THREE.MeshPhongMaterial({
      map:AngryBirds.Texture.BOARD,
      transparent:true,
      opacity:0.5, 
      blending:THREE.NormalBlending
    }));
    slingshot.castShadow = true;
    return slingshot;
  },

  dragWorld: function(event) {
    var dx = this.dragStartMousePosition.x - event.clientX;
    var dy = this.dragStartMousePosition.y - event.clientY;
    this.dragStartMousePosition = new THREE.Vector3(event.clientX, event.clientY, 0);

    var yAxis = new THREE.Vector3(0, 1, 0);
    var yawAngle = -dx / 5000 * Math.PI;
    var yawMatrix = new THREE.Matrix4().makeRotationAxis(yAxis, yawAngle);
    var xAxis = new THREE.Vector3(1, 0, 0);
    var pitchAngle = dy / 5000 * Math.PI;
    var pitchMatrix = new THREE.Matrix4().makeRotationAxis(xAxis, pitchAngle);
    this.cameraDirection.applyMatrix4(yawMatrix);
    this.cameraDirection.applyMatrix4(pitchMatrix);
    this.world.threeCamera.position.copy(new THREE.Vector3().copy(this.bird.threeMesh.position).sub(this.cameraDirection));
    this.world.threeCamera.lookAt(this.bird.threeMesh.position);
  },

  dragBird: function(event) {
    var currentMousePosition = new THREE.Vector3(event.clientX, event.clientY, 0);
    var dist = this.dragStartMousePosition.distanceTo(currentMousePosition) / 600;
    if (0.4 < dist) dist = 0.4;

    this.bird.position.set(
      this.birdStartPosition.x - this.cameraDirection.x * dist,
      this.birdStartPosition.y - this.cameraDirection.y * dist,
      this.birdStartPosition.z - this.cameraDirection.z * dist
    );
    return dist;
  },

  mouseDownListener: function(event) {
    if (this.mode != AngryBirds.Mode.SIGHT_SETTING) return;

    this.dragStartMousePosition = new THREE.Vector3(event.clientX, event.clientY, 0);
    var vector = new THREE.Vector3(
      (event.clientX / window.innerWidth) * 2 - 1, 
      -(event.clientY / window.innerHeight) * 2 + 1, 
      0.5
    );
    var camera = this.world.threeCamera;
    this.projector.unprojectVector(vector, camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = ray.intersectObjects([this.bird.threeMesh]);
    if (0 < intersects.length) {
      this.isBirdDragging = true;
      this.isWorldDragging = false;
    }
    else {
      this.isBirdDragging = false;
      this.isWorldDragging = true;
    }
  },

  mouseMoveListener: function(event) {
    if (this.mode != AngryBirds.Mode.SIGHT_SETTING) return;

    if (this.isBirdDragging) {
      this.dragBird(event);
    }
    else if (this.isWorldDragging) {
      this.dragWorld(event);
    }
  },

  mouseUpListener: function(event) {
    if (this.mode != AngryBirds.Mode.SIGHT_SETTING) return;

    if (this.isBirdDragging) {
      this.isBirdDragging = false;
      var dist = this.dragBird(event);

      var f = dist * 4000;
      var dt = 1/60;
      if (f < 600) {
        this.ready();
      }
      else {
        var impulseDir = new CANNON.Vec3(this.cameraDirection.x, this.cameraDirection.y, this.cameraDirection.z);
        impulseDir.normalize();
        var impulse = impulseDir.mult(f * dt);
        this.bird.applyImpulse(impulse, this.bird.cannonBody.position);
        this.world.isStopped = false;
        this.slingshot.material.opacity = 1;
        this.bird.threeMesh.material.opacity = 1;
        //this.mode = AngryBirds.Mode.FLYING;
        this.mode = AngryBirds.Mode.SIDEVIEW;
      }
    }
    else if (this.isWorldDragging) {
      this.isWorldDragging = false;
    }
  },

  keyPressListener: function(event) {
    if (event.charCode === 13) { // enter
      if (this.world.isStopped) {
        window.location.reload();
      }
      else {
        this.world.stop();
        this.ready();
      }
    }
    else if (event.charCode === 32) { // space
      if (this.mode === AngryBirds.Mode.FLYING) {
        this.mode = AngryBirds.Mode.SIDEVIEW;
        this.bird.threeMesh.material.opacity = 1;
      }
      else if (this.mode === AngryBirds.Mode.SIDEVIEW) {
        this.mode = AngryBirds.Mode.FLYING;
        this.bird.threeMesh.material.opacity = 0.5;
      }
    }
  },

  setupEventListeners: function() {
    document.addEventListener('mousedown', this.mouseDownListener.bind(this));
    document.addEventListener('mousemove', this.mouseMoveListener.bind(this));
    document.addEventListener('mouseup', this.mouseUpListener.bind(this));
    document.addEventListener('keypress', this.keyPressListener.bind(this));
  },

  ready: function() {
    this.mode = AngryBirds.Mode.SIGHT_SETTING;
    this.isBirdDragging = false;
    this.isWorldDragging = false;
    this.bird.cannonBody.velocity.set(0, 0, 0);
    this.bird.position.copy(this.birdStartPosition);
    this.bird.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2);
    this.bird.threeMesh.material.opacity = 0.5;
    this.slingshot.material.opacity = 0.5;
    this.cameraDirection = new THREE.Vector3(0, 0, 5);
    this.world.threeCamera.position.copy(new THREE.Vector3().copy(this.bird.threeMesh.position).sub(this.cameraDirection));
    this.world.threeCamera.lookAt(this.bird.threeMesh.position);
  },

  start: function() {
    this.construct();
    this.setupEventListeners();
    this.ready();
    this.world.start(1/24, function() {
      if (this.mode === AngryBirds.Mode.FLYING) {
        this.slingshot.material.opacity = 0.5;
        this.world.threeCamera.position.copy(this.bird.threeMesh.position);
        this.world.threeCamera.lookAt(this.stages[0].piggies[0].threeMesh.position);
      }
      else if (this.mode === AngryBirds.Mode.SIDEVIEW) {
        this.slingshot.material.opacity = 1;
        this.world.threeCamera.position.set(-25, 15, 15);
        this.world.threeCamera.lookAt(new THREE.Vector3(0, 5, 15));
      }
    }.bind(this));
    this.world.stop();
  }
};

function start() {
  var game = new AngryBirds.Game({stages:[new AngryBirds.Stage1()]});
  game.start();
}
start();

}).apply(this);
