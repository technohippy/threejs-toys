"use strict";

addEventListener('message', function(event) {
  var imageData = event.data;
  var width = imageData.width;
  var height = imageData.height;
  var data = imageData.data;
  var redPoints = [];
  var greenPoints = [];

  for (var x = 0; x < width; x+=10) {
    for (var y = 0; y < height; y+=10) {
      var base = x * 4 + y * width * 4;
      var r = data[base];
      var g = data[base+1];
      var b = data[base+2];
      var a = data[base+3];
      if (isRed(r, g, b, a)) {
        redPoints.push({x:x, y:y});
      }
      if (isGreen(r, g, b, a)) {
        greenPoints.push({x:x, y:y});
      }
    }
  }
  postMessage({
    redPoints:{points:redPoints, center:getCenter(redPoints), size:redPoints.length},
    greenPoints:{size:greenPoints.length},
    isShot:greenPoints.length > redPoints.length
  });
});

function isRed(r, b, g, a) {
  return 250 < a && 100 < r && g < r/2.0 && b < r/2.0;
}

function isGreen(r, g, b, a) {
  return 250 < a && r < g/2.0 && 100 < g && b < g/2.0;
}

function getCenter(points) {
  var meanValue = {x:0, y:0};
  points.forEach(function(p) {
    meanValue.x += p.x;
    meanValue.y += p.y;
  });
  meanValue.x /= points.length;
  meanValue.y /= points.length;

  var standardDeviation = {x:0, y:0};
  points.forEach(function(p) {
    standardDeviation.x += Math.pow(p.x - meanValue.x, 2);
    standardDeviation.y += Math.pow(p.y - meanValue.y, 2);
  });
  standardDeviation.x /= points.length;
  standardDeviation.y /= points.length;
  standardDeviation.x = Math.sqrt(standardDeviation.x);
  standardDeviation.y = Math.sqrt(standardDeviation.y);

  var ret = {x:0, y:0};
  for (var i = 0; i < points.length; i++) {
    var deviationX = 10 * (points[i].x - meanValue.x) / standardDeviation.x;
    var deviationY = 10 * (points[i].y - meanValue.y) / standardDeviation.y;
  }

  // TODO: あとで標準偏差の大きいものと小さいものを外す
  return meanValue;
}
