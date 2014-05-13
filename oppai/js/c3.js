var C3 = C3 || {};

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

C3.World = function(world, scene, renderer) {
  this.threeScene = scene || new THREE.Scene();
  this.cannonWorld = world || new CANNON.World();
  this.threeRenderer = renderer;
  if (!this.threeRenderer) {
    this.threeRenderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    this.threeRenderer.shadowMapEnabled = true;
    this.threeRenderer.shadowMapSoft = true;
    this.threeRenderer.shadowMapType = THREE.PCFShadowMap;
    this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
    this.threeRenderer.setClearColor(0x000000, 1);
  }

  ['allowSleep', 'broadphase'].forEach(function(prop) {
    C3.delegateProperty(this, prop, this.cannonWorld);
  }, this);

  ['gravity', 'solver'].forEach(function(prop) {
    C3.delegateProperty(this, prop, this.cannonWorld, {readonly:true});
  }, this);
};

C3.World.prototype = {
  constructor: C3.World,

  add: function(body) {
    if (!body.isConstructed) body.construct();
    this.cannonWorld.add(body.cannonBody);
    this.threeScene.add(body.threeMesh);
  },

  step: function(msec) {
    this.cannonWorld.step(msec);
  }
};

C3.Sphere = function(radius, opts) {
  this.isConstrucrted = false;
  this.opts = opts || {};
  this.opts['color'] = this.opts['color'] || 0xffffff;
  this.opts['ambient'] = this.opts['ambient'] || 0x333333;
  this.opts['mass'] = this.opts['mass'] || 1;
};

C3.Sphere.prototype = {
  constructor: C3.Shape,

  construct: function() {
    var geometry = new THREE.SphereGeometry(radius, 32, 32);
    var material = new THREE.MeshPhongMaterial({
      color:this.opts['color'],
      ambient:this.opts['ambient']
    });
    this.threeMesh = new THREE.Mesh(geometry, material);

    var shape = new CANNON.Sphere(radius);
    this.cannonBody = new CANNON.RigidBody(this.opts['mass'], shape);

    ['castShadow', 'receiveShadow'].forEach(function(prop) {
      C3.delegateProperty(this, prop, this.threeMesh);
    }, this);

    this.isConstrucrted = true;
  },

  position: function(x, y, z) {
    if (arguments.length == 0) {
      return this.cannonBody.position;
    }
    else {
      this.threeMesh.position.set(new THREE.Vec3(x, y, z));
      this.cannonBody.position.set(new CANNON.Vec3(x, y, z));
    }
  }
};
