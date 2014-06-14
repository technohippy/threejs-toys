var AngryBirds = AngryBirds || {};

(function(AngryBirds) {
"use strict";

AngryBirds.Stage1 = function(denPosition) {
  AngryBirds.Stage.call(this);
  //this.denPosition =  denPosition || {x:0, z:24};
  this.denPosition =  denPosition || {x:0, z:48};
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
        //{color:0x00ffff, shininess:200}
        {map:AngryBirds.Texture.ICE, shininess:200, bumpMap:AngryBirds.Texture.ICE}
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
  var piggy = new AngryBirds.Piggy(0.6, {mass:0.5, angularDamping:0.8, ambient:0x999999});
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

}).call(this, AngryBirds);
