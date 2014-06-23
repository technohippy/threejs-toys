var AngryBirds = AngryBirds || {};

(function(AngryBirds) {
"use strict";

AngryBirds.Stage2 = function(denPosition) {
  AngryBirds.Stage.call(this);
  this.denPosition =  denPosition || {x:0, z:48};
};

AngryBirds.Stage2.prototype = Object.create(AngryBirds.Stage.prototype);
AngryBirds.Stage2.prototype.constructor = AngryBirds.Stage2;
AngryBirds.Stage2.prototype.createTable = function(world, x, z, height) {
  world.add(this.createPost(
    {width:0.7, height:height, depth:0.7}, 
    {x:x, y:height/2, z:z}
  ));

  world.add(this.createBoard(
    {width:2, height:0.4, depth:2}, 
    {x:x, y:height + 0.2/2, z:z}
  ));

  var piggy = new AngryBirds.Piggy(0.6, {mass:0.5, angularDamping:0.8, ambient:0x999999});
  //piggy.position.set(x, height + 0.4/2 + 0.6/2, z);
  piggy.position.set(x, height + 0.4/2 + 0.6, z);
  world.add(piggy);
  this.piggies.push(piggy);
};
AngryBirds.Stage2.prototype.constructOn = function(world) {
  this.createTable(world, this.denPosition.x - 0.2, this.denPosition.z - 10, 4);
  this.createTable(world, this.denPosition.x,       this.denPosition.z - 5, 4);
  this.createTable(world, this.denPosition.x + 0.2, this.denPosition.z, 4);
  this.createTable(world, this.denPosition.x + 0.4, this.denPosition.z + 6, 6);
};

}).call(this, AngryBirds);
