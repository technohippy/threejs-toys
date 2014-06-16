var AngryBirds = AngryBirds || {};

(function(AngryBirds) {
"use strict";

window.addEventListener('load', function() {
  AngryBirds.Game.start({stages:[
    new AngryBirds.Stage1(),
    new AngryBirds.Stage2(),
    new AngryBirds.Stage3()
  ]});
});

}).call(this, AngryBirds);
