var IMAGE_WIDTH = 208;
var IMAGE_HEIGHT = 170;

window.addEventListener('DOMContentLoaded', function(event) {
  var original = document.getElementById('original');
  var originalContext = original.getContext('2d');
  var emboss = document.getElementById('emboss');
  var embossContext = emboss.getContext('2d');

  var originalImage = new Image();
  originalImage.addEventListener('load', function() {
    originalContext.drawImage(originalImage, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    filter(originalContext, embossContext, [
      [1,  1,  1],
      [1,  0, -1],
      [0, -1, -1],
    ]);
    make3d(original, emboss);
  });
  originalImage.src = "images/pumpkin.png";
});

function filter(inContext, outContext, array) {
  var x, y;
  var grayscaled = [];
  var inImageData = inContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  for (y = 0; y < IMAGE_HEIGHT; y++) {
    var grayscaledRow = []
    for (x = 0; x < IMAGE_WIDTH; x++) {
      var baseIndex = 4 * (y * IMAGE_WIDTH + x);
      var r = inImageData.data[baseIndex+0];
      var g = inImageData.data[baseIndex+1];
      var b = inImageData.data[baseIndex+2];
      var a = inImageData.data[baseIndex+3];

      var grayValue = Math.floor(0.29891 * r + 0.58661 * g + 0.11448 * b);

      grayscaledRow.push(grayValue);
    }
    grayscaled.push(grayscaledRow);
  }

  var filtered = [[]];
  for (y = 1; y < IMAGE_HEIGHT - 1; y++) {
    var filteredRow = [[]]
    for (x = 1; x < IMAGE_WIDTH - 1; x++) {
      var filteredValue = 0;
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          filteredValue += grayscaled[y + dy][x + dx] * array[dy + 1][dx + 1];
        }
      }
      filteredRow.push(filteredValue);
    }
    filteredRow.push([]);
    filtered.push(filteredRow);
  }
  filtered.push([]);
  
  var outImageData = outContext.createImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
  for (y = 1; y < IMAGE_HEIGHT - 1; y++) {
    for (x = 1; x < IMAGE_WIDTH - 1; x++) {
      /*
      var val = grayscaled[y][x];
      var baseIndex = 4 * (y * IMAGE_WIDTH + x);
      outImageData.data[baseIndex+0] = val;
      outImageData.data[baseIndex+1] = val;
      outImageData.data[baseIndex+2] = val;
      outImageData.data[baseIndex+3] = 255;
      */
      /*
      var val = filtered[y][x];
      var baseIndex = 4 * (y * IMAGE_WIDTH + x);
      outImageData.data[baseIndex+0] = val;
      outImageData.data[baseIndex+1] = val;
      outImageData.data[baseIndex+2] = val;
      outImageData.data[baseIndex+3] = 255;
      */
      var baseIndex = 4 * (y * IMAGE_WIDTH + x);
      outImageData.data[baseIndex+0] = filtered[y][x-1] - filtered[y][x+1];
      outImageData.data[baseIndex+1] = filtered[y-1][x] - filtered[y+1][x];
      outImageData.data[baseIndex+2] = 255;
      outImageData.data[baseIndex+3] = 255;
    }
  }
  outContext.putImageData(outImageData, 0, 0);
}

function make3d(textureCanvas, bumpMapCanvas) {
  // http://www.atmarkit.co.jp/ait/articles/1210/04/news142.html
  var renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(IMAGE_WIDTH, IMAGE_HEIGHT);
  renderer.setClearColor(0x000000, 1);
  document.body.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, IMAGE_WIDTH / IMAGE_HEIGHT);
  camera.position.set(0, 0, 208);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  var pointLight = new THREE.PointLight(0xffffff, 0.3, 300);
  var angle = 0;
  var length = 200;
  var z = 150;
  pointLight.position.set(length * Math.cos(angle), length * Math.sin(angle), z);
  scene.add(pointLight);

  scene.add(new THREE.AmbientLight(0xcccccc));

  var texture = new THREE.Texture(textureCanvas);
  texture.needsUpdate = true;
  var bumpMap = new THREE.Texture(bumpMapCanvas);
  bumpMap.needsUpdate = true;

  var material = new THREE.MeshPhongMaterial({
    color: 0xffffff, ambient: 0xffffff,
    specular: 0xcccccc, shininess:50,
    map: texture,
    bumpMap: bumpMap
  });

  var geometry = new THREE.PlaneGeometry(IMAGE_WIDTH, IMAGE_HEIGHT);
  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  (function render() {
    requestAnimationFrame(render);
    angle += 0.05;
    pointLight.position.set(length * Math.cos(angle), length * Math.sin(angle), z);
    renderer.render(scene, camera);
  })();
}
