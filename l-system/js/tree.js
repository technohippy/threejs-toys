// texture: tree.jpg
// http://fc00.deviantart.net/fs71/i/2011/187/4/7/tileable_tree_bark_texture_by_ftourini-d3l69hz.jpg

function Tree() {
  this.root = new Branch();
  this.root.length = 0;
this.root.length = 0.1; // TODO
}

Tree.prototype.connect = function(branch) {
  this.root.connect(branch);
};

Tree.prototype.getGroup = function() {
  var group = new THREE.Object3D();

  var texture = THREE.ImageUtils.loadTexture('images/tree.jpg');
  var material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    ambient: 0xffffff,
    map: texture, 
    bumpMap: texture, 
    bumpScale: 0.01
  });

  this.root.addMeshTo(group, material);
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
}

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

Branch.prototype.addMeshTo = function(group, material) {
  var sphereGeometry = new THREE.SphereGeometry(this.topDiameter, 32, 16);
  var sphereMesh = new THREE.Mesh(sphereGeometry, material);
  sphereMesh.position.y = this.length / 2;

  var cylinderGeometry = new THREE.CylinderGeometry(this.topDiameter, this.bottomDiameter, this.length, 32);
  var cylinderMesh = new THREE.Mesh(cylinderGeometry, material);

  var branch3D = new THREE.Object3D();
  branch3D.add(sphereMesh);
  branch3D.add(cylinderMesh);

  var dir = new THREE.Vector3();
  dir.crossVectors(this.direction, this.axisY).normalize();
  var dot = this.direction.dot(this.axisY);
  var rad = Math.acos(dot);

  branch3D.setRotationFromAxisAngle(dir, rad);
  //branch3D.translate(this.length/2, this.direction);
  if (this.parent) {
    branch3D.position.copy(this.parent.getTopPosition());
    branch3D.translate(this.length/2, this.parent.direction);
  }
  group.add(branch3D);

  for (var i = 0; i < this.children.length; i++) {
    this.children[i].addMeshTo(group, material);
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
  clone.children = [];
  if (withChildren) {
    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      clone.children.push(child.clone(true));
    }
  }
  return clone;
};

function TreeInterpretor(tree) {
  this.tree = tree || new Tree();
  this.currentBranch = this.tree.root.clone();
// TODO
this.currentBranch.length = 0.3;
this.currentBranch.bottomDiameter = 0.02;
this.currentBranch.topDiameter = 0.02;
  this.stack = [this.tree.root];
}

TreeInterpretor.prototype.interprete = function(c) {
  if (c == '[') {
    this.stack.push(this.currentBranch);
    this.currentBranch = this.currentBranch.clone();
  }
  else if (c == ']') {
    if (this.stack.length == 0) {
      throw 'nothing to pop';
    }
    this.currentBranch = this.stack.pop();
  }
  else if (c == '+') {
    this.currentBranch.rotateZ(THREE.Math.degToRad(15));
  }
  else if (c == '-') {
    this.currentBranch.rotateZ(THREE.Math.degToRad(-15));
  }
  else if (c == 'F') {
    this.stack[this.stack.length - 1].connect(this.currentBranch);
    var nextBranch = this.currentBranch.clone();
    this.currentBranch = nextBranch;
  }
};
