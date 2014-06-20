"use strict";

window.URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia || navigator.msGetUserMedia;

var Detector = function(videoOrId, canvasOrId) {
  if (videoOrId instanceof HTMLElement) {
    this.video = videoOrId;
  }
  else {
    this.video = document.getElementById(videoOrId);
  }

  if (canvasOrId instanceof HTMLElement) {
    this.canvas = canvasOrId;
  }
  else {
    this.canvas = document.getElementById(canvasOrId);
  }
  this.gc = this.canvas.getContext('2d');

  this.worker = null;
  this.detectHandlers = [];
  this.errorHandlers = [];
  this.isDetecting = true;
};

Detector.DEFAULT_WIDTH = 400;
Detector.DEFAULT_HEIGHT = 400;

Detector.prototype.addDetectHandler = function(handler) {
  this.detectHandlers.push(handler);
};

Detector.prototype.addErrorHandler = function(handler) {
  this.errorHandlers.push(handler);
};

Detector.prototype.startCamera = function() {
  navigator.getUserMedia (
    {video: true},
    function(localMediaStream) {
      this.video.src = window.URL.createObjectURL(localMediaStream);
      this.video.play();
    }.bind(this),
    function(err) {
      this.errorHandlers.forEach(function(handler) {
        handler(err);
      });
    }.bind(this)
  );
};

Detector.prototype.startWorker = function() {
  this.worker = new Worker('js/detector_worker.js');
  this.worker.addEventListener('message', function(event) {
    this.detectHandlers.forEach(function(handler) {
      handler(event.data, this.gc);
    }.bind(this));
    if (this.isDetecting) setTimeout(this.detect.bind(this), 10);
  }.bind(this));
};

Detector.prototype.start = function() {
  this.startCamera();
  this.startWorker();
};

Detector.prototype.detect = function() {
  this.gc.drawImage(this.video, 0, 0, this.video.width, this.video.height);
  this.worker.postMessage(this.gc.getImageData(0, 0, this.video.width, this.video.height));
};
