var C3 = C3 || {};
//C3.DEBUG = true;

C3.delegateProperty = function(from, property, to, opts) {
  opts = opts || {};
  var desc = {};
  if (!opts['readonly']) desc['set'] = function(value) { to[property] = value };
  if (!opts['writeonly']) desc['get'] = function() { return to[property] };
  Object.defineProperty(from, property, desc);
};

C3.delegate = function(from, method, to) {
  from[method] = function() {
    return to[method].apply(to, arguments);
  };
};

C3.Vector3 = function(x, y, z) {
  this._x = x;
  this._y = y;
  this._z = z;
  this.listeners = [];

  Object.defineProperty(this, 'x', {
    get: function() {return this._x},
    set: function(value) {this._x = value},
  });
  Object.defineProperty(this, 'y', {
    get: function() {return this._y},
    set: function(value) {this._y = value},
  });
  Object.defineProperty(this, 'z', {
    get: function() {return this._z},
    set: function(value) {this._z = value},
  });
};

C3.Vector3.prototype = {
  constructor: C3.Vector3,

  set: function(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
    this.listeners.forEach(function(listener) {
      listener(this);
    }, this);
  },

  toString: function() {
    return '[' + this._x + ', ' + this._y + ', ' + this._z + ']';
  }
};

C3.World = function(opts) {
  opts = opts || {};
  this.bodies = [];
  this.threeScene = opts.scene || new THREE.Scene();

  this.cannonWorld = opts.world;
  if (!this.cannonWorld) {
    this.cannonWorld = new CANNON.World();
    //this.cannonWorld.allowSleep = true;
    this.cannonWorld.gravity.set(0,0,-9.82);
    this.cannonWorld.broadphase = new CANNON.NaiveBroadphase();
  }

  this.threeCamera = opts.camera;
  if (!this.threeCamera) {
    this.threeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
    this.threeCamera.position = new THREE.Vector3(0, -10, 3);
    this.threeCamera.lookAt(new THREE.Vector3(0, 0, 0));
    this.cameraAdded = false;
  }

  this.threeRenderer = opts.renderer;
  if (!this.threeRenderer) {
    this.threeRenderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    this.threeRenderer.shadowMapEnabled = true;
    this.threeRenderer.shadowMapSoft = true;
    this.threeRenderer.shadowMapType = THREE.PCFShadowMap;
    this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
    this.threeRenderer.setClearColor(0x000000, 1);
    window.addEventListener('resize', function() {
      this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
      // TODO
      //camera.aspect = window.innerWidth / window.innerHeight;
      //camera.updateProjectionMatrix();
    }, false);
  }

  ['allowSleep', 'broadphase'].forEach(function(prop) {
    C3.delegateProperty(this, prop, this.cannonWorld);
  }, this);

  ['gravity', 'solver'].forEach(function(prop) {
    C3.delegateProperty(this, prop, this.cannonWorld, {readonly:true});
  }, this);

  ['fog'].forEach(function(prop) {
    C3.delegateProperty(this, prop, this.threeScene);
  }, this);

  ['domElement'].forEach(function(prop) {
    C3.delegateProperty(this, prop, this.threeRenderer, {readonly:true});
  }, this);
};

C3.World.prototype = {
  constructor: C3.World,

  add: function(body) {
    if (!body.isConstructed) body.construct();
    this.bodies.push(body);
    this.cannonWorld.add(body.cannonBody);
    this.threeScene.add(body.threeMesh);
  },

  addCamera: function(camera) {
    if (camera) this.threeCamera = camera;
    this.threeScene.add(this.threeCamera);
    this.cameraAdded = true;
  },

  addLight: function(light) {
    if (!light) throw 'light is undefined';
    this.threeScene.add(light);
  },

  addDirectionalLight: function(color, opts) {
    // TODO
    var light = new THREE.DirectionalLight(color || 0xffffff);
    light.position = new THREE.Vector3(5, -5, 10);
    light.castShadow = true;
    light.shadowBias = 0.0001;
    if (C3.DEBUG) light.shadowCameraVisible = true;

    light.shadowCameraNear = 1;
    light.shadowCameraFar = 100;
    light.shadowCameraLeft = -50;
    light.shadowCameraRight = 50;
    light.shadowCameraTop = 5;
    light.shadowCameraBottom = -5;
    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;

    this.threeScene.add(light);
  },

  addAmbientLight: function(color) {
    var ambient = new THREE.AmbientLight(color || 0x666666);
    this.threeScene.add(ambient);
  },

  step: function(msec) {
    if (!this.cameraAdded) this.addCamera();
    this.cannonWorld.step(msec || 1.0/24.0);
    this.bodies.forEach(function(body) {
      body.sync();
    }, this);
  },

  render: function() {
    this.threeRenderer.render(this.threeScene, this.threeCamera);
  },

  stepRender: function(msec) {
    this.step(msec);
    this.render();
  },

  start: function(msec) {
    window.addEventListener('DOMContentLoaded', function() {
      document.body.appendChild(this.domElement);
      (function() {
        this.stepRender(msec);
        requestAnimationFrame(arguments.callee.bind(this));
      }.bind(this))();
    }.bind(this));
  }
};

C3.Body = function() {
};

C3.Sphere = function(radius, opts) {
  this.isConstrucrted = false;
  this.radius = radius;
  opts = opts || {};
  this.position = new C3.Vector3(0, 0, 0);

  this.threeOpts = {color:0xffffff, ambient:0x333333, castShadow:true, receiveShadow:false};
  if (opts['color']) this.threeOpts['color'] = opts['color'];
  if (opts['ambient']) this.threeOpts['ambient'] = opts['ambient'];

  this.cannonOpts = {mass:1};
  if (opts['mass']) this.cannonOpts['mass'] = opts['mass'];

  ['castShadow', 'receiveShadow'].forEach(function(prop) {
    C3.delegateProperty(this, prop, this.threeOpts);
  }, this);
};

C3.Sphere.prototype = {
  constructor: C3.Shape,

  construct: function() {
    var geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    var material = new THREE.MeshPhongMaterial({
      color:this.threeOpts['color'],
      ambient:this.threeOpts['ambient']
    });
    this.threeMesh = new THREE.Mesh(geometry, material);
    if (this.threeOpts['castShadow']) this.threeMesh.castShadow = true;
    if (this.threeOpts['receiveShadow']) this.threeMesh.receiveShadow = true;
    this.threeMesh.position.copy(this.position);

    var shape = new CANNON.Sphere(this.radius);
    this.cannonBody = new CANNON.RigidBody(this.cannonOpts['mass'], shape);
    this.cannonBody.position.set(this.position.x, this.position.y, this.position.z);

    this.position.listeners.push(function(p) {
      this.threeMesh.position.copy(p);
      this.cannonBody.position.set(p.x, p.y, p.z);
    });

    this.isConstrucrted = true;
  },

  sync: function() {
    this.threeMesh.position.copy(this.cannonBody.position);
    this.threeMesh.quaternion.copy(this.cannonBody.quaternion);
  }
};

C3.Box = function(x, y, z, opts) {
  this.isConstrucrted = false;
  this.x = x;
  this.y = y;
  this.z = z;
  opts = opts || {};
  this.position = new C3.Vector3(0, 0, 0);

  this.threeOpts = {color:0xffffff, ambient:0x333333, castShadow:true, receiveShadow:false};
  if (opts['color']) this.threeOpts['color'] = opts['color'];
  if (opts['ambient']) this.threeOpts['ambient'] = opts['ambient'];

  this.cannonOpts = {mass:1};
  if (opts['mass']) this.cannonOpts['mass'] = opts['mass'];

  ['castShadow', 'receiveShadow'].forEach(function(prop) {
    C3.delegateProperty(this, prop, this.threeOpts);
  }, this);
};

C3.Box.prototype = {
  constructor: C3.Box,

  construct: function() {
    var geometry = new THREE.BoxGeometry(this.x, this.y, this.z);
    var material = new THREE.MeshPhongMaterial({
      color:this.threeOpts['color'],
      ambient:this.threeOpts['ambient']
    });
    this.threeMesh = new THREE.Mesh(geometry, material);
    if (this.threeOpts['castShadow']) this.threeMesh.castShadow = true;
    if (this.threeOpts['receiveShadow']) this.threeMesh.receiveShadow = true;
    this.threeMesh.position.copy(this.position);

    var shape = new CANNON.Box(new CANNON.Vec3(this.x/2, this.y/2, this.z/2));
    this.cannonBody = new CANNON.RigidBody(this.cannonOpts['mass'], shape);
    this.cannonBody.position.set(this.position.x, this.position.y, this.position.z);

    this.position.listeners.push(function(p) {
      this.threeMesh.position.copy(p);
      this.cannonBody.position.set(p.x, p.y, p.z);
    });

    this.isConstrucrted = true;
  },
  
  applyImpulse: function(impulse, point) {
    this.cannonBody.applyImpulse(impulse, point);
  },

  sync: function() {
    this.threeMesh.position.copy(this.cannonBody.position);
    this.threeMesh.quaternion.copy(this.cannonBody.quaternion);
  }
};

C3.Ground = function(opts) {
  this.isConstrucrted = false;
  opts = opts || {};
  this.position = new C3.Vector3(0, 0, 0);

  this.threeOpts = {color:0xffffff, ambient:0x333333, castShadow:false, receiveShadow:true};
  if (opts['color']) this.threeOpts['color'] = opts['color'];
  if (opts['ambient']) this.threeOpts['ambient'] = opts['ambient'];

  this.cannonOpts = {mass:0};
  if (opts['mass']) this.cannonOpts['mass'] = opts['mass'];

  ['castShadow', 'receiveShadow'].forEach(function(prop) {
    C3.delegateProperty(this, prop, this.threeOpts);
  }, this);
};

C3.Ground.prototype = {
  constructor: C3.Ground,

  construct: function() {
    var geometry = new THREE.BoxGeometry(1000, 1000, 0.1);
    var material = new THREE.MeshPhongMaterial({
      color:this.threeOpts['color'],
      ambient:this.threeOpts['ambient']
    });
    this.threeMesh = new THREE.Mesh(geometry, material);
    if (this.threeOpts['castShadow']) this.threeMesh.castShadow = true;
    if (this.threeOpts['receiveShadow']) this.threeMesh.receiveShadow = true;
    this.threeMesh.position.copy(this.position);

    var shape = new CANNON.Plane();
    this.cannonBody = new CANNON.RigidBody(this.cannonOpts['mass'], shape);
    this.cannonBody.position.set(this.position.x, this.position.y, this.position.z);

    this.position.listeners.push(function(p) {
      this.threeMesh.position.copy(p);
      this.cannonBody.position.set(p.x, p.y, p.z);
    });

    this.isConstrucrted = true;
  },

  sync: function() {
//    this.threeMesh.position.copy(this.cannonBody.position);
//    this.threeMesh.quaternion.copy(this.cannonBody.quaternion);
  }
};
