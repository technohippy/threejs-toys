function Tree() {
  this.root = new Trunk();
  this.root.length = 0.2;
  this.root.topBottomRatio = 0.8;
  this.root.setBottomDiameter(0.05);
}

Tree.textures = {
  trunk: THREE.ImageUtils.loadTexture('images/tree.jpg'),
  leaf: THREE.ImageUtils.loadTexture('images/leaf.png')
};

Tree.materials = {
  trunk: new THREE.MeshPhongMaterial({
    color: 0xffffff,
    ambient: 0x333333,
    map: Tree.textures.trunk,
    bumpMap: Tree.textures.trunk,
    bumpScale: 0.01
  }),
  leaf: new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    ambient: 0xffffff,
    map: Tree.textures.leaf,
    side: THREE.DoubleSide
  })
};

Tree.prototype.connect = function(trunk) {
  this.root.connect(trunk);
};

Tree.prototype.getMesh = function(opts) {
  var group = new THREE.Object3D();
  this.root.addMeshTo(group, opts || {});
  return group;
};

function Trunk() {
  this.bottomPosition = new THREE.Vector3();
  this.direction = new THREE.Vector3(0, 1, 0);
  this.axisX = new THREE.Vector3(1, 0, 0);
  this.axisY = new THREE.Vector3(0, 1, 0);
  this.axisZ = new THREE.Vector3(0, 0, 1);
  this.length = 0;
  this.bottomDiameter = 0;
  this.topDiameter = 0;
  this.parent = null;
  this.children = [];
  this.leaves = [];
  this.topBottomRatio = 1;
}

Trunk.prototype.isRoot = function() {
  return this.parent == null;
};

Trunk.prototype.setBottomDiameter = function(diameter) {
  this.bottomDiameter = diameter;
  this.topDiameter = diameter * this.topBottomRatio;
};

Trunk.prototype.getTopPosition = function() {
// TODO
  return this.bottomPosition.clone().add(
//      this.direction.clone().normalize().multiplyScalar(this.length));
      this.axisY.clone().normalize().multiplyScalar(this.length));
};

Trunk.prototype.connect = function(trunk) {
  trunk.bottomPosition.copy(this.getTopPosition());
  this.children.push(trunk);
  trunk.parent = this;
}

Trunk.prototype.addMeshTo = function(group, opts) {
  var numOfVertex = 8;
  var sphereGeometry = new THREE.SphereGeometry(this.bottomDiameter, numOfVertex, numOfVertex);
  var sphereMesh = new THREE.Mesh(sphereGeometry, Tree.materials.trunk);
  sphereMesh.position.y = -this.length / 2;

  var cylinderGeometry = new THREE.CylinderGeometry(this.topDiameter, this.bottomDiameter, this.length, numOfVertex);
/*
// BUMP
for (var i = 0; i < cylinderGeometry.vertices.length; i++) {
  var v = cylinderGeometry.vertices[i];
  v.x += (Math.random() - 0.5) * 0.01;
  v.z += (Math.random() - 0.5) * 0.01;
}
console.log(32 * 16, cylinderGeometry.vertices.length);
*/
  var cylinderMesh = new THREE.Mesh(cylinderGeometry, Tree.materials.trunk);

  if (opts.castShadow) {
    sphereMesh.castShadow = true;
    cylinderMesh.castShadow = true;
  }
  if (opts.receiveShadow) {
    sphereMesh.receiveShadow = true;
    cylinderMesh.receiveShadow = true;
  }

  var trunk3D = new THREE.Object3D();
  if (!this.isRoot()) trunk3D.add(sphereMesh);
  trunk3D.add(cylinderMesh);

  var dir = new THREE.Vector3();
  dir.crossVectors(this.direction, this.axisY).normalize();
  var dot = this.direction.dot(this.axisY);
  var rad = Math.acos(dot);
  trunk3D.setRotationFromAxisAngle(dir, rad);

  if (this.isRoot()) {
    trunk3D.position.copy(this.bottomPosition);
    trunk3D.translateOnAxis(this.direction, this.length/2);
  }
  else {
    trunk3D.position.copy(this.parent.getTopPosition());
    trunk3D.translateOnAxis(this.parent.direction, this.length/2);
  }
  group.add(trunk3D);

  for (var i = 0; i < this.children.length; i++) {
    this.children[i].addMeshTo(group, opts);
  }

  for (var j = 0; j < this.leaves.length; j++) {
    this.leaves[j].addMeshTo(group, opts);
  }

  return group;
};

Trunk.prototype.rotateX = function(rad) {
  this.rotateAxisRad(this.axisX, rad);
};

Trunk.prototype.rotateY = function(rad) {
  this.rotateAxisRad(this.axisY, rad);
};

Trunk.prototype.rotateZ = function(rad) {
  this.rotateAxisRad(this.axisZ, rad);
};

Trunk.prototype.rotateAxisRad = function(axis, rad) {
  var q = new THREE.Quaternion();
  q.setFromAxisAngle(axis, rad);
  var m4 = new THREE.Matrix4().makeRotationFromQuaternion(q);
  this.axisX.applyMatrix4(m4);
  this.axisY.applyMatrix4(m4);
  this.axisZ.applyMatrix4(m4);
};

Trunk.prototype.clone = function(withChildren) {
  var clone = new Trunk();
  clone.bottomPosition = this.bottomPosition.clone();
  clone.direction = this.direction.clone();
  clone.axisX = this.axisX.clone();
  clone.axisY = this.axisY.clone();
  clone.axisZ = this.axisZ.clone();
  clone.length = this.length;
  clone.bottomDiameter = this.bottomDiameter;
  clone.topDiameter = this.topDiameter;
  clone.topBottomRatio = this.topBottomRatio;
  clone.children = [];
  if (withChildren) {
    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      clone.children.push(child.clone(true));
    }
  }
  clone.leaves = [];
  for (var j = 0; j < this.leaves.length; j++) {
    var leaf = this.leaves[j];
    clone.leaves.push(leaf.clone());
  }
  return clone;
};

Trunk.prototype.toBranch = function() {
  this.length = 0.01;
  this.topBottomRatio = 1;
  this.setBottomDiameter(0.0001);
};

Trunk.prototype.grow = function() {
  var trunk = this.clone();
  trunk.setBottomDiameter(this.topDiameter);
  trunk.length *= 0.9; // TODO
  return trunk;
};

Trunk.prototype.growBranch = function() {
  return Branch.trunkToBranch(this.clone());
};

Trunk.prototype.growLeaf = function() {
  this.leaves.push(new Leaf(this));
};

function Leaf(trunk) {
  this.trunk = trunk;
}

Leaf.prototype.addMeshTo = function(group, opts) {
  var leafWidth = 0.01;
  var leafHeight = 0.03;

  var leafGeometry = new THREE.PlaneGeometry(leafWidth, leafHeight);
  var leafMesh = new THREE.Mesh(leafGeometry, Tree.materials.leaf);
  if (opts.castShadow) {
    leafMesh.castShadow = true;
  }
  if (opts.receiveShadow) {
    leafMesh.receiveShadow = true;
  }

  leafMesh.position.copy(this.trunk.getTopPosition());
  leafMesh.position.y -= leafHeight / 2;
  leafMesh.position.y -= this.trunk.topDiameter / 2;

  var dir = new THREE.Vector3();
  dir.crossVectors(this.trunk.direction, this.trunk.axisY).normalize();
  var dot = this.trunk.direction.dot(this.trunk.axisY);
  var rad = Math.acos(dot);
  leafMesh.setRotationFromAxisAngle(dir, rad + 3.14/2);

  group.add(leafMesh);
  return group;
};

Leaf.prototype.clone = function() {
  return new Leaf(this.trunk);
};

function TreeInterpretor(tree) {
  this.tree = tree || new Tree();
  this.currentTrunk = this.tree.root;
  this.nextTrunk = this.currentTrunk.grow();
  this.stack = [];
}

TreeInterpretor.prototype.interpreteAll = function(s) {
  for (var i = 0; i < s.length; i++) {
    this.interprete(s[i]);
  }
};

TreeInterpretor.prototype.interprete = function(c) {
  if (c == '[') {
    this.stack.push(this.currentTrunk);
  }
  else if (c == ']') {
    if (this.stack.length == 0) {
      throw 'nothing to pop';
    }
    this.currentTrunk = this.stack.pop();
    this.nextTrunk = this.currentTrunk.grow();
  }
  else if (c == 'Y') {
    this.nextTrunk.rotateZ(THREE.Math.degToRad(20));
  }
  else if (c == 'y') {
    this.nextTrunk.rotateZ(THREE.Math.degToRad(-20));
  }
  else if (c == 'R') {
    this.nextTrunk.rotateY(THREE.Math.degToRad(20));
  }
  else if (c == 'r') {
    this.nextTrunk.rotateY(THREE.Math.degToRad(-20));
  }
  else if (c == 'd') {
    this.nextTrunk.setBottomDiameter(this.nextTrunk.bottomDiameter * 0.9);
  }
  else if (c == 's') {
    this.nextTrunk.length *= 0.9;
  }
  else if (c == 'l') {
    this.nextTrunk.length *= 1.1;
  }
  else if (c == 'T') {
    this.currentTrunk.connect(this.nextTrunk);
    this.currentTrunk = this.nextTrunk;
    this.nextTrunk = this.nextTrunk.grow();
  }
  else if (c == 'B') {
    this.nextTrunk.toBranch();
    this.currentTrunk.connect(this.nextTrunk);
    this.currentTrunk = this.nextTrunk;
    this.nextTrunk = this.nextTrunk.grow();
  }
  else if (c == 'L') {
    this.currentTrunk.growLeaf();
  }
};
