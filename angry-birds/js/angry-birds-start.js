var AngryBirds = AngryBirds || {};

(function(AngryBirds) {
"use strict";

function isSmartphone() {
  var ua = navigator.userAgent;
  var keys = ['iPhone', 'iPad', 'iPod', 'Android'];
  for (var i = 0; i < keys.length; i++) {
    if (0 <= ua.indexOf(keys[i])) {
      return true;
    }
  }
  return false;
}

window.addEventListener('load', function() {
  if (isSmartphone()) {
    window.location = window.location.pathname.replace('index.html', '') + 'controller.html';
  }
  AngryBirds.Game.start({stages:[
    new AngryBirds.Stage1(),
    new AngryBirds.Stage2(),
    new AngryBirds.Stage3(),
    new AngryBirds.Stage4()
  ]});
});

}).call(this, AngryBirds);
