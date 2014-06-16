var AngryBirds = AngryBirds || {};

(function(AngryBirds) {
"use strict";

AngryBirds.Stage3 = function(denPosition) {
  AngryBirds.Stage.call(this);
  this.denPosition =  denPosition || {x:0, z:48};
  //this.denPosition =  denPosition || {x:0, z:10};
};

AngryBirds.Stage3.prototype = Object.create(AngryBirds.Stage.prototype);
AngryBirds.Stage3.prototype.constructor = AngryBirds.Stage3;
AngryBirds.Stage3.prototype.constructDen = function(world, dh, denDx, denDz) {
  dz = dz || 0;
  dh = dh || 0;
  var h1 = 2 + dh;
  world.add(this.createBox(
    {width:5, height:h1, depth:5},
    {x:this.denPosition.x+denDx, y:h1/2, z:this.denPosition.z+denDz},
    {fixed:true, color:AngryBirds.Color.FIXED, receiveShadow:true}
  ));

  var h2 = 1;
  world.add(this.createBox(
    {width:2, height:h2, depth:0.3},
    {x:this.denPosition.x+denDx-1-0.05, y:h1+h2/2, z:this.denPosition.z+denDz-2},
    {color:AngryBirds.Color.STONE}
  ));
  world.add(this.createBox(
    {width:2, height:1, depth:0.3},
    {x:this.denPosition.x+denDx+1+0.05, y:h1+h2/2, z:this.denPosition.z+denDz-2},
    {color:AngryBirds.Color.STONE}
  ));

  world.add(this.createBox(
    {width:2, height:1, depth:0.3},
    {x:this.denPosition.x+denDx-1-0.05, y:h1+h2/2, z:this.denPosition.z+denDz},
    {color:AngryBirds.Color.STONE}
  ));
  world.add(this.createBox(
    {width:2, height:1, depth:0.3},
    {x:this.denPosition.x+denDx+1+0.05, y:h1+h2/2, z:this.denPosition.z+denDz},
    {color:AngryBirds.Color.STONE}
  ));

  world.add(this.createBox(
    {width:2, height:1, depth:0.3},
    {x:this.denPosition.x+denDx-1-0.05, y:h1+h2/2, z:this.denPosition.z+denDz+2},
    {color:AngryBirds.Color.STONE}
  ));
  world.add(this.createBox(
    {width:2, height:1, depth:0.3},
    {x:this.denPosition.x+denDx+1+0.05, y:h1+h2/2, z:this.denPosition.z+denDz+2},
    {color:AngryBirds.Color.STONE}
  ));

  var h3 = 0.2;
  world.add(this.createBox(
    {width:4.5, height:h3, depth:4.5},
    {x:this.denPosition.x+denDx, y:h1+h2+h3/2, z:this.denPosition.z+denDz},
    {color:AngryBirds.Color.STONE, receiveShadow:true}
  ));

  var piggy = new AngryBirds.Piggy(0.6, {mass:0.5, angularDamping:0.8, ambient:0x999999});
  piggy.position.set(this.denPosition.x+denDx, h1+h2+h3+0.6, this.denPosition.z+denDz);
  world.add(piggy);
  this.piggies.push(piggy);

  var h4 = 3;
  var w4 = 0.7;
  var unit = 1.3;
  for (var dx = -unit; dx <= unit; dx += unit*2) {
    for (var dz = -unit; dz <= unit; dz += unit*2) {
      world.add(this.createPost(
        {width:w4, height:h4, depth:w4}, 
        {x:this.denPosition.x+denDx+dx, y:h1+h2+h3+h4/2, z:this.denPosition.z+denDz+dz},
        {map:AngryBirds.Texture.ICE, shininess:200, bumpMap:AngryBirds.Texture.ICE}
      ));
    }
  }

  var h5 = 0.1;
  world.add(this.createBox(
    {width:4.5, height:h5, depth:4.5},
    {x:this.denPosition.x+denDx, y:h1+h2+h3+h4+h5/2, z:this.denPosition.z+denDz},
    {map:AngryBirds.Texture.ICE, shininess:200, bumpMap:AngryBirds.Texture.ICE}
  ));

  var h6 = 0.7;
  var w6 = 1;
  for (var dx = -unit; dx <= unit; dx += unit*2) {
    for (var dz = -unit; dz <= unit; dz += unit*2) {
      world.add(this.createBoard(
        {width:w6, height:h6, depth:w6}, 
        {x:this.denPosition.x+denDx+dx, y:h1+h2+h3+h4+h5+h6/2+0.1, z:this.denPosition.z+denDz+dz}
      ));
    }
  }
};

AngryBirds.Stage3.prototype.constructOn = function(world) {
  this.constructDen(world, 0, -1, -2);
  this.constructDen(world, 2, 1, 8);
};

}).call(this, AngryBirds);
