function Tree() {
  this.root = new Branch();
  this.root.length = 0.2;
  this.root.topBottomRatio = 0.8;
  this.root.setBottomDiameter(0.05);
}

Tree.textures = {
  branch: THREE.ImageUtils.loadTexture('images/tree.jpg'),
  leaf: THREE.ImageUtils.loadTexture('images/leaf.png')
};

Tree.materials = {
  branch: new THREE.MeshPhongMaterial({
    color: 0xffffff,
    ambient: 0x333333,
    map: Tree.textures.branch,
    bumpMap: Tree.textures.branch,
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

Tree.prototype.connect = function(branch) {
  this.root.connect(branch);
};

Tree.prototype.getMesh = function(opts) {
  var group = new THREE.Object3D();
  this.root.addMeshTo(group, opts || {});
  return group;
};

function Branch() {
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

Branch.prototype.isRoot = function() {
  return this.parent == null;
};

Branch.prototype.setBottomDiameter = function(diameter) {
  this.bottomDiameter = diameter;
  this.topDiameter = diameter * this.topBottomRatio;
};

Branch.prototype.getTopPosition = function() {
// TODO
  return this.bottomPosition.clone().add(
//      this.direction.clone().normalize().multiplyScalar(this.length));
      this.axisY.clone().normalize().multiplyScalar(this.length));
};

Branch.prototype.connect = function(branch) {
  branch.bottomPosition.copy(this.getTopPosition());
  this.children.push(branch);
  branch.parent = this;
}

Branch.prototype.addMeshTo = function(group, opts) {
  var numOfVertex = 8;
  var sphereGeometry = new THREE.SphereGeometry(this.bottomDiameter, numOfVertex, numOfVertex);
  var sphereMesh = new THREE.Mesh(sphereGeometry, Tree.materials.branch);
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
  var cylinderMesh = new THREE.Mesh(cylinderGeometry, Tree.materials.branch);

  if (opts.castShadow) {
    sphereMesh.castShadow = true;
    cylinderMesh.castShadow = true;
  }
  if (opts.receiveShadow) {
    sphereMesh.receiveShadow = true;
    cylinderMesh.receiveShadow = true;
  }

  var branch3D = new THREE.Object3D();
  if (!this.isRoot()) branch3D.add(sphereMesh);
  branch3D.add(cylinderMesh);

  var dir = new THREE.Vector3();
  dir.crossVectors(this.direction, this.axisY).normalize();
  var dot = this.direction.dot(this.axisY);
  var rad = Math.acos(dot);

  branch3D.setRotationFromAxisAngle(dir, rad);
  if (this.isRoot()) {
    branch3D.position.copy(this.bottomPosition);
    branch3D.translateOnAxis(this.direction, this.length/2);
  }
  else {
    branch3D.position.copy(this.parent.getTopPosition());
    branch3D.translateOnAxis(this.parent.direction, this.length/2);
  }
  group.add(branch3D);

  for (var i = 0; i < this.children.length; i++) {
    this.children[i].addMeshTo(group, opts);
  }

  for (var j = 0; j < this.leaves.length; j++) {
    this.leaves[j].addMeshTo(group, opts);
  }

  return group;
};

Branch.prototype.rotateX = function(rad) {
  this.rotateAxisRad(this.axisX, rad);
};

Branch.prototype.rotateY = function(rad) {
  this.rotateAxisRad(this.axisY, rad);
};

Branch.prototype.rotateZ = function(rad) {
  this.rotateAxisRad(this.axisZ, rad);
};

Branch.prototype.rotateAxisRad = function(axis, rad) {
  var q = new THREE.Quaternion();
  q.setFromAxisAngle(axis, rad);
  var m4 = new THREE.Matrix4().makeRotationFromQuaternion(q);
  this.axisX.applyMatrix4(m4);
  this.axisY.applyMatrix4(m4);
  this.axisZ.applyMatrix4(m4);
};

Branch.prototype.clone = function(withChildren) {
  var clone = new Branch();
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

Branch.prototype.grow = function() {
  var branch = this.clone();
  branch.setBottomDiameter(this.topDiameter);
branch.length *= 0.9; // TODO
  return branch;
};

Branch.prototype.growLeaf = function() {
  // TODO:
  //this.root.topBottomRatio = 0.8;
  //this.root.setBottomDiameter(0.05);
  if (this.topDiameter < 0.05 * Math.pow(0.8, 4))
  this.leaves.push(new Leaf(this));
};

function Leaf(branch) {
  this.branch = branch;
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

  var up = new THREE.Vector3(0, 0, 1).normalize();
  var normalAxis = this.branch.axisY.clone();
  normalAxis.y = 0;
  normalAxis.normalize();
  var dir = new THREE.Vector3();
  dir.crossVectors(up, normalAxis).normalize();
  var dot = up.dot(normalAxis);
  var rad = Math.acos(dot);
  var m1 = new THREE.Matrix4().makeRotationFromQuaternion(
    new THREE.Quaternion().setFromAxisAngle(dir, rad)
  );
  //leafMesh.setRotationFromMatrix(m1);
  
  // TODO: ??
  var normalAxis2 = this.branch.axisZ.clone();
  normalAxis2.y = 0;
  normalAxis2.normalize();
  var m2 = new THREE.Matrix4().makeRotationFromQuaternion(
    new THREE.Quaternion().setFromAxisAngle(normalAxis2, THREE.Math.degToRad(Math.random() * 10 - 35))
  );
  leafMesh.setRotationFromMatrix(
    new THREE.Matrix4().multiplyMatrices(m2, m1)
  );

  leafMesh.position.copy(this.branch.getTopPosition());
  leafMesh.position.y -= leafHeight / 2;
  leafMesh.position.y -= this.branch.topDiameter / 2;
  group.add(leafMesh);
  return group;
};

Leaf.prototype.clone = function() {
  return new Leaf(this.branch);
};

function TreeInterpretor(tree) {
  this.tree = tree || new Tree();
  this.currentBranch = this.tree.root;
  this.nextBranch = this.currentBranch.grow();
  this.stack = [];
}

TreeInterpretor.prototype.interprete = function(c) {
  if (c == '[') {
    this.stack.push(this.currentBranch);
  }
  else if (c == ']') {
    if (this.stack.length == 0) {
      throw 'nothing to pop';
    }
    this.currentBranch = this.stack.pop();
    this.nextBranch = this.currentBranch.grow();
  }
  else if (c == 'Y') {
    this.nextBranch.rotateZ(THREE.Math.degToRad(20));
  }
  else if (c == 'y') {
    this.nextBranch.rotateZ(THREE.Math.degToRad(-20));
  }
  else if (c == 'R') {
    this.nextBranch.rotateY(THREE.Math.degToRad(20));
  }
  else if (c == 'r') {
    this.nextBranch.rotateY(THREE.Math.degToRad(-20));
  }
  else if (c == 'd') {
    this.nextBranch.setBottomDiameter(this.nextBranch.bottomDiameter * 0.9);
  }
  else if (c == 's') {
    this.nextBranch.length *= 0.9;
  }
  else if (c == 'T') {
    this.currentBranch.connect(this.nextBranch);
    this.currentBranch = this.nextBranch;
    this.nextBranch = this.nextBranch.grow();
  }
  else if (c == 'L') {
    this.currentBranch.growLeaf();
  }
};
