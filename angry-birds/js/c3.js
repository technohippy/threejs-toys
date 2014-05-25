"use strict";

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

  copy: function(v) {
    this.set(v.x, v.y, v.z);
  }
};

/*
C3.Quaternion = function() {
  this.listeners = [];
};

C3.Quaternion.prototype = {
  constructor: C3.Quaternion,

  set: function(x, y, z, w) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
    this.listeners.forEach(function(listener) {
      listener(this);
    }, this);
  }
};
*/

C3.World = function(opts) {
  opts = opts || {};
  this.bodies = [];
  this.threeScene = opts.scene || new THREE.Scene();

  this.cannonWorld = opts.world;
  if (!this.cannonWorld) {
    this.cannonWorld = new CANNON.World();
    //this.cannonWorld.allowSleep = true;
    //this.cannonWorld.gravity.set(0,0,-9.82);
    this.cannonWorld.gravity.set(0,-9.82,0);
    this.cannonWorld.broadphase = new CANNON.NaiveBroadphase();
  }

  this.threeCamera = opts.camera;
  if (!this.threeCamera) {
    this.threeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
if (true) {
    //this.threeCamera.position = new THREE.Vector3(0, 6, -5);
    //this.threeCamera.lookAt(new THREE.Vector3(0, 6, 5));
    this.threeCamera.position = new THREE.Vector3(0, 6+2, -10);
    //this.threeCamera.position = new THREE.Vector3(0, 3, -10);
    this.threeCamera.lookAt(new THREE.Vector3(0, 3+2, 5));
}
else {
    this.threeCamera.position = new THREE.Vector3(-30, 6, 13);
    this.threeCamera.lookAt(new THREE.Vector3(10, 6, 13));
}
    this.cameraAdded = false;
  }

  this.threeRenderer = opts.renderer;
  if (!this.threeRenderer) {
    this.threeRenderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    this.threeRenderer.shadowMapEnabled = true;
    this.threeRenderer.shadowMapSoft = true;
    this.threeRenderer.shadowMapType = THREE.PCFShadowMap;
    this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
    //this.threeRenderer.setClearColor(0x000000, 1);
    this.threeRenderer.setClearColor(0xccccff, 1); // TODO
    window.addEventListener('resize', function() {
      this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
      this.threeCamera.aspect = window.innerWidth / window.innerHeight;
      this.threeCamera.updateProjectionMatrix();
    }.bind(this), false);
  }

  this.isStarted = false;
  this.isStopped = false;

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
    body.world = this;
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
    light.position = new THREE.Vector3(-10, 20, -5);
    light.castShadow = true;
    light.shadowBias = 0.0001;
    if (C3.DEBUG) light.shadowCameraVisible = true;

    light.shadowCameraNear = 1;
    light.shadowCameraFar = 100;
    light.shadowCameraLeft = -50;
    light.shadowCameraRight = 50;
    light.shadowCameraTop = 50;
    light.shadowCameraBottom = -50;
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
    if (!this.isStopped) this.step(msec);
    this.render();
  },

  start: function(msec, callback) {
    if (!callback) callback = function() {};
    if (this.isStarted) {
      this.isStopped = false;
    }
    else {
      window.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(this.domElement);
        var _start = function() {
          this.stepRender(msec);
          requestAnimationFrame(_start.bind(this));
          callback();
        }.bind(this);
        _start();
      }.bind(this));
    }
  },

  stop: function() {
    this.isStopped = true;
  }
};

C3.Body = function(opts) {
  this.world = null;
  this.isConstrucrted = false;
  opts = opts || {};
  this.position = new C3.Vector3(0, 0, 0);
  this.quaternion = new THREE.Quaternion();

  this.threeOpts = {color:0xffffff, ambient:0x333333, castShadow:false, receiveShadow:false};
  if (opts['color']) this.threeOpts['color'] = opts['color'];
  if (opts['ambient']) this.threeOpts['ambient'] = opts['ambient'];
  if (opts['specular']) this.threeOpts['specular'] = opts['specular'];
  if (opts['shininess']) this.threeOpts['shininess'] = opts['shininess'];
  if (opts['map']) this.threeOpts['map'] = opts['map'];
  if (opts['bumpMap']) {
    this.threeOpts['bumpMap'] = opts['bumpMap'];
    this.threeOpts['bumpScale'] = 0.01;
  }
  if (opts['bumpScale']) this.threeOpts['bumpScale'] = opts['bumpScale'];
  if (opts['castShadow']) this.threeOpts['castShadow'] = true;
  if (opts['receiveShadow']) this.threeOpts['receiveShadow'] = true;
  if (opts['threeMaterial']) this.threeOpts['threeMaterial'] = opts['threeMaterial'];

  this.cannonOpts = {mass:1};
  if (opts['mass']) this.cannonOpts['mass'] = opts['mass'];
  if (opts['fixed']) this.cannonOpts['mass'] = 0;
  if (opts['linearDamping']) this.cannonOpts['linearDamping'] = opts['linearDamping'];
  if (opts['angularDamping']) this.cannonOpts['angularDamping'] = opts['angularDamping'];
  if (opts['cannonMaterial']) this.cannonOpts['cannonMaterial'] = opts['cannonMaterial'];

  ['castShadow', 'receiveShadow'].forEach(function(prop) {
    C3.delegateProperty(this, prop, this.threeOpts);
  }, this);
};

C3.Body.prototype = {
  constructThreeGeometry: function() {
    throw 'subclass responsibility';
  },

  constructCannonShape: function() {
    throw 'subclass responsibility';
  },

  construct: function() {
    var geometry = this.constructThreeGeometry();
    var material = this.threeOpts['threeMaterial'];
    if (!material) {
      var materialOpts = {
        color:this.threeOpts['color'],
        ambient:this.threeOpts['ambient']
      };
      if (this.threeOpts['map']) materialOpts['map'] = this.threeOpts['map'];
      if (this.threeOpts['bumpMap']) {
        materialOpts['bumpMap'] = this.threeOpts['bumpMap'];
        materialOpts['bumpScale'] = this.threeOpts['bumpScale'];
      }
      material = new THREE.MeshPhongMaterial(materialOpts);
    }
    this.threeMesh = new THREE.Mesh(geometry, material);
    if (this.threeOpts['castShadow']) this.threeMesh.castShadow = true;
    if (this.threeOpts['receiveShadow']) this.threeMesh.receiveShadow = true;
    this.threeMesh.position.copy(this.position);
    this.threeMesh.quaternion.copy(this.quaternion);

    var shape = this.constructCannonShape();
    this.cannonBody = new CANNON.RigidBody(this.cannonOpts['mass'], shape, this.cannonOpts['cannonMaterial']);
    this.cannonBody.position.set(this.position.x, this.position.y, this.position.z);
    this.cannonBody.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
    if (this.cannonOpts['linearDamping']) this.cannonBody.linearDamping = this.cannonOpts['linearDamping'];
    if (this.cannonOpts['angularDamping']) this.cannonBody.angularDamping = this.cannonOpts['angularDamping'];
    if (this.cannonOpts['sleepState']) this.cannonBody.sleepState = this.cannonOpts['sleepState'];

    this.position.listeners.push(function(p) {
      this.threeMesh.position.copy(p);
      this.cannonBody.position.set(p.x, p.y, p.z);
    }.bind(this));

    /*
    this.quaternion.listeners.push(function(q) {
      this.threeMesh.quaternion.copy(q);
      this.cannonBody.quaternion.set(q.x, q.y, q.z, q.w);
    }.bind(this));
    */

    this.isConstrucrted = true;
  },

  removeFromWorld: function() {
    this.world.threeScene.remove(this.threeMesh);
//    this.world.cannonWorld.remove(this.cannonBody);
    this.cannonBody.mass = 0;
    this.cannonBody.position.set(0, -100, 0);
  },
  
  applyImpulse: function(impulse, point) {
    this.cannonBody.applyImpulse(impulse, point);
  },

  addEventListener: function(eventName, listener) {
    if (0 <= ['collide'].indexOf(eventName)) {
      this.cannonBody.addEventListener(eventName, listener);
    }
  },

  //http://zachberry.com/blog/tracking-3d-objects-in-2d-with-three-js/
  getPosition2D: function() {
    var projector = new THREE.Projector();
    var camera = this.world.threeCamera;
    if (camera instanceof THREE.PerspectiveCamera) {
      var p = this.threeMesh.matrixWorld.getPosition().clone();
      var v = projector.projectVector(p, camera);
      var percX = (v.x + 1) / 2;
      var percY = (-v.y + 1) / 2;
      return {left: percX * window.innerWidth - 150/2, top: percY * window.innerHeight - 150};
    }
    else if (camera instanceof THREE.OrthographicCamera) {
      // TODO
    }
    else {
      throw 'Unknown camera';
    }
  },

  isEqual: function(obj) {
    return this == obj || this.cannonBody == obj;
  },

  sync: function() {
    this.threeMesh.position.copy(this.cannonBody.position);
    this.threeMesh.quaternion.copy(this.cannonBody.quaternion);
  }
};

C3.Sphere = function(radius, opts) {
  opts = opts || {};
  if (typeof(opts['castShadow']) === 'undefined') opts['castShadow'] = true;
  C3.Body.call(this, opts);
  this.radius = radius;
};

C3.Sphere.prototype = Object.create(C3.Body.prototype);
C3.Sphere.prototype.constructor = C3.Sphere;
C3.Sphere.prototype.constructThreeGeometry = function() {
  return new THREE.SphereGeometry(this.radius, 32, 32);
};
C3.Sphere.prototype.constructCannonShape = function() {
  return new CANNON.Sphere(this.radius);
};

C3.Box = function(x, y, z, opts) {
  opts = opts || {};
  if (typeof(opts['castShadow']) === 'undefined') opts['castShadow'] = true;
  C3.Body.call(this, opts);
  this.x = x;
  this.y = y;
  this.z = z;
};

C3.Box.prototype = Object.create(C3.Body.prototype);
C3.Box.prototype.constructor = C3.Box;
C3.Box.prototype.constructThreeGeometry = function() {
  return new THREE.BoxGeometry(this.x, this.y, this.z);
};
C3.Box.prototype.constructCannonShape = function() {
  return new CANNON.Box(new CANNON.Vec3(this.x/2, this.y/2, this.z/2));
};

C3.Ground = function(opts) {
  opts = opts || {};
  if (typeof(opts['fixed']) === 'undefined') opts['fixed'] = true;
  if (typeof(opts['receiveShadow']) === 'undefined') opts['receiveShadow'] = true;
  C3.Body.call(this, opts);
  this.quaternion = new CANNON.Quaternion();
  this.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
};

C3.Ground.prototype = Object.create(C3.Body.prototype);
C3.Ground.prototype.constructor = C3.Ground;
C3.Ground.prototype.constructThreeGeometry = function() {
  return new THREE.BoxGeometry(1000, 1000, 0.1);
  //return new THREE.BoxGeometry(1000, 0.1, 1000);
};
C3.Ground.prototype.constructCannonShape = function() {
  return new CANNON.Plane();
  /*
  var plane = new CANNON.Plane();
  plane.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  return plane;
  */
};
C3.Ground.prototype.sync = function() {};
