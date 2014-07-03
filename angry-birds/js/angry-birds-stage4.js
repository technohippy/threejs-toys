var AngryBirds = AngryBirds || {};

(function(AngryBirds) {
"use strict";

AngryBirds.Stage4 = function(denPosition) {
  AngryBirds.Stage.call(this);
  //this.denPosition = denPosition || {x:-4.8, z:40};
  this.denPosition = denPosition || {x:0, z:40};
};

AngryBirds.Stage4.prototype = Object.create(AngryBirds.Stage.prototype);
AngryBirds.Stage4.prototype.constructor = AngryBirds.Stage4;
AngryBirds.Stage4.prototype.constructOn = function(world) {

  var ground = this.createBoard(
    {width:10, height:1, depth:10}, 
    {x:this.denPosition.x, y:-0.5, z:this.denPosition.z}, 
    {fixed:true, map:AngryBirds.Texture.CLOD, bumpMap:AngryBirds.Texture.CLOD}
  );
  ground.construct();
  world.threeScene.add(
    ground.threeMesh
  );

  for (var dx = -2; dx <= 2; dx += 2) {
    for (var dz = -2; dz <= 2; dz += 2) {
      if (dx == 0 && dz == 0) continue;
      world.add(this.createBoard(
        {width:0.5, height:8, depth:0.5}, 
        {x:this.denPosition.x+dx, y:8/2, z:this.denPosition.z+dz}, 
        {map:AngryBirds.Texture.POST, bumpMap:AngryBirds.Texture.POST}
      ));
    }
  }

  world.add(this.createBoard(
    {width:2, height:1, depth:2}, 
    {x:this.denPosition.x, y:0.5, z:this.denPosition.z}, 
    {fixed:true, map:AngryBirds.Texture.CLOD, bumpMap:AngryBirds.Texture.CLOD}
  ));

  var piggy1 = new AngryBirds.Piggy(0.6, {mass:0.5, angularDamping:0.8, ambient:0x999999});
  piggy1.position.set(this.denPosition.x, 1+0.6/2, this.denPosition.z);
  world.add(piggy1);
  this.piggies.push(piggy1);

  world.add(this.createBoard(
    {width:10, height:1, depth:10}, 
    {x:this.denPosition.x, y:19, z:this.denPosition.z}, 
    {fixed:true, map:AngryBirds.Texture.CLOD, bumpMap:AngryBirds.Texture.CLOD}
  ));

  for (var dx = -4; dx <= 4; dx += 8) {
    for (var dz = -4; dz <= 4; dz += 8) {
      world.add(this.createBoard(
        {width:1, height:20, depth:1}, 
        {x:this.denPosition.x+dx, y:20/2-1, z:this.denPosition.z+dz}, 
        {fixed:true, map:AngryBirds.Texture.CLOD, bumpMap:AngryBirds.Texture.CLOD}
      ));
    }
  }

  var piggy2 = new AngryBirds.Piggy(0.6, {mass:0.5, angularDamping:0.8, ambient:0x999999});
  piggy2.position.set(this.denPosition.x, 19+1/2+0.6/2, this.denPosition.z);
  world.add(piggy2);
  this.piggies.push(piggy2);

};

}).call(this, AngryBirds);
