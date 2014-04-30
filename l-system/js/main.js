if(!Detector.webgl) Detector.addGetWebGLMessage();

var PARAMS = Utils.getParams();
if (!PARAMS.repeat) PARAMS.repeat = 3;
var DEBUG = PARAMS['debug'];
var baseTime;

if (DEBUG) {
  var stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.zIndex = 100;
  document.body.appendChild(stats.domElement);
}

function lensFlareUpdateCallback(object) {
  var f, fl = object.lensFlares.length;
  var flare;
  var vecX = -object.positionScreen.x * 2;
  var vecY = -object.positionScreen.y * 2;
  for (f = 0; f < fl; f++) {
    flare = object.lensFlares[f];
    flare.x = object.positionScreen.x + vecX * flare.distance;
    flare.y = object.positionScreen.y + vecY * flare.distance;
    flare.rotation = 0;
  }
  object.lensFlares[2].y += 0.025;
  object.lensFlares[3].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);
}

function buildRenderer() {
  var renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMapType = THREE.PCFShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 1);
  return renderer;
}

function buildCamera(cameraHeight, cameraDistance) {
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
  camera.position = new THREE.Vector3(0, cameraHeight, cameraDistance);
  camera.lookAt(new THREE.Vector3(0, cameraHeight, 0));
  return camera;
}

function addLights(scene) {
  var sunLight = new THREE.SpotLight(0xffffff);
  sunLight.position = new THREE.Vector3(4, 4, 4);
  scene.add(sunLight);

  var light = new THREE.DirectionalLight(0xffffff);
  light.position = new THREE.Vector3(2, 2, 2);
  light.castShadow = true;
  light.shadowBias = 0.0001;
  if (DEBUG) light.shadowCameraVisible = true;

  light.shadowCameraNear = 1;
  light.shadowCameraFar = 8;
  light.shadowCameraLeft = -5;
  light.shadowCameraRight = 5;
  light.shadowCameraTop = 5;
  light.shadowCameraBottom = -5;
  light.shadowMapWidth = 1024;
  light.shadowMapHeight = 1024;

  scene.add(light);

  var ambient = new THREE.AmbientLight(0x666666);
  scene.add(ambient);

  // lens flare
  var textureFlare0 = THREE.ImageUtils.loadTexture('images/lensflare0.png');
  var textureFlare2 = THREE.ImageUtils.loadTexture('images/lensflare2.png');
  var textureFlare3 = THREE.ImageUtils.loadTexture('images/lensflare3.png');
  var flareColor = new THREE.Color(0xffccdd);
  var lensFlare = new THREE.LensFlare(textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);
  lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
  lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
  lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
  lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
  lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
  lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
  lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);
  lensFlare.customUpdateCallback = lensFlareUpdateCallback;
  lensFlare.position = sunLight.position;
  scene.add(lensFlare);
}

function buildTree() {
  var tree = new Tree();
  var l = new LSystem();
  for (var key in PARAMS) {
    if (PARAMS.hasOwnProperty(key)) {
      var val = PARAMS[key];
      if (key.match(/^rule-/)) {
        l.addRule(key.substring('rule-'.length), val);
      }
      else if (key === 'init') {
        l.value = val;
      }
    }
  }
  if (!l.value) {
    l.value = 'F';
  }
  if (Object.getOwnPropertyNames(l.rules).length === 0) {
    l.addRule('F', 'F[+F-F-F]F[--F+F+F]');
  }
  l.interpretor = new TreeInterpretor(tree);
  l.step(PARAMS.repeat);
  l.eval();

  return tree.getMesh({
    castShadow: true,
    receiveShadow: false
  });
}

function buildSkybox() {
  var urls = [
    'images/cube01.jpg',
    'images/cube02.jpg',
    'images/cube03.jpg',
    'images/cube04.jpg',
    'images/cube05.jpg',
    'images/cube06.jpg'
  ];

  var cubemap = THREE.ImageUtils.loadTextureCube(urls); // load textures
  cubemap.format = THREE.RGBFormat;

  var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib
  shader.uniforms['tCube'].value = cubemap; // apply textures to shader

  var skyBoxMaterial = new THREE.ShaderMaterial( {
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide
  });

  return new THREE.Mesh(
    new THREE.CubeGeometry(1000, 1000, 1000),
    skyBoxMaterial
  );
}

function buildGround() {
  // TODO: http://yomotsu.net/blog/2012/12/01/create-terrain-with-threejs.html
  var groundTexture = THREE.ImageUtils.loadTexture('images/cube04.jpg');
  var groundGeometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
  var groundMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: groundTexture, 
    bumpMap: groundTexture, 
    bumpScale: 0.1
  });
  var ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = THREE.Math.degToRad(-90);
  ground.castShadow = false;
  ground.receiveShadow = true;
  return ground;
}

function buildControls(camera, cameraHeight, cameraDistance) {
  /*
  var controls = new THREE.FirstPersonControls(camera);
  controls.movementSpeed = 10;
  controls.lookSpeed = 0.05
  controls.lon = -85;
  controls.center = new THREE.Vector3(0, 0, 0);
  */
  /*
  var controls = new THREE.OrbitControls(camera);
  controls.center = new THREE.Vector3(0, 0, 0);
  */
  return {
    update: function() {
      var dt = +new Date - baseTime;
      var rad = THREE.Math.degToRad(dt / 50 % 360);
      var distance = cameraDistance * (0.6 + 0.3 * Math.cos(rad * 2));
      camera.position.set(distance * Math.sin(rad), cameraHeight + 0.5 * Math.sin(rad), distance * Math.cos(rad));
      camera.lookAt(new THREE.Vector3(0, cameraHeight, 0));
    }
  };
}

function start() {
  var renderer = buildRenderer();
  document.body.appendChild(renderer.domElement);

  var scene = new THREE.Scene();

  var cameraHeight = 0.7;
  var cameraDistance = 3;
  var camera = buildCamera(cameraHeight, cameraDistance);
  scene.add(camera);

  addLights(scene);
  scene.add(buildTree());
  scene.add(buildSkybox());
  scene.add(buildGround());
  scene.fog = new THREE.FogExp2(0xdddddd, 0.01);
  if (DEBUG) scene.add(new THREE.AxisHelper(5));

  var controls = buildControls(camera, cameraHeight, cameraDistance);

  baseTime = +new Date;
  function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
  };
  render();

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }, false);
}

start();
