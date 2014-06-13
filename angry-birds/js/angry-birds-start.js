var AngryBirds = AngryBirds || {};

(function(AngryBirds) {
"use strict";

window.addEventListener('load', function() {
  AngryBirds.Game.start({stages:[
    new AngryBirds.Stage1(),
    new AngryBirds.Stage1()
  ]});
});

}).call(this, AngryBirds);
