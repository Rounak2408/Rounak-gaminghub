(function () {
  'use strict';

  var scene, camera, renderer, bike, controller, otherBike;
  var terrainData, treesGroup, turbinesGroup, rampsGroup;
  var keys = { forward: false, backward: false, left: false, right: false, jump: false };
  var gameMode = 'mountain';
  var score = 0;
  var lastPos = new THREE.Vector3(0, 0, 0);
  var running = false;
  var clock = new THREE.Clock();
  var otherBikeState = null;
  var lastSentTime = 0;

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 80, 350);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 15);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;

    var ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    var sun = new THREE.DirectionalLight(0xffffcc, 1);
    sun.position.set(80, 120, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 400;
    sun.shadow.camera.left = -120;
    sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120;
    sun.shadow.camera.bottom = -120;
    sun.shadow.bias = -0.0001;
    scene.add(sun);

    var fill = new THREE.DirectionalLight(0x4488ff, 0.3);
    fill.position.set(-30, 40, -30);
    scene.add(fill);
  }

  function initTerrain() {
    terrainData = MountainTerrain.createTerrain(scene, { size: 400, segments: 80, maxHeight: 25 });
    scene.add(terrainData.group);
    treesGroup = MountainTerrain.createTrees(scene, terrainData.height, 35);
    scene.add(treesGroup);
    turbinesGroup = MountainTerrain.createTurbines(terrainData.height, 5);
    scene.add(turbinesGroup);
    rampsGroup = MountainTerrain.createRamps(scene, terrainData.height, 8);
    scene.add(rampsGroup);
  }

  function initBike() {
    bike = Bike.createBike();
    var startY = terrainData.height(0, 0) + 0.6;
    bike.position.set(0, startY, 0);
    scene.add(bike);
    controller = new Bike.BikeController(bike, terrainData.height);
    controller.position.set(0, startY, 0);
    lastPos.copy(controller.position);
    otherBike = Bike.createBike({ bodyColor: 0x22cc66, riderColor: 0x22aa88 });
    otherBike.visible = false;
    scene.add(otherBike);
  }

  function updateScore() {
    var dist = lastPos.distanceTo(controller.position);
    score += dist;
    lastPos.copy(controller.position);
    var el = document.getElementById('score-value');
    if (el) el.textContent = Math.round(score);
  }

  function updateCamera(dt) {
    var target = controller.position.clone();
    var offset = controller.getForward().clone().multiplyScalar(-12).add(new THREE.Vector3(0, 6, 0));
    var desired = target.clone().add(offset);
    camera.position.lerp(desired, 1 - Math.exp(-4 * dt));
    camera.lookAt(target.x, target.y + 1.5, target.z);
  }

  function animateTurbines(dt) {
    if (!turbinesGroup) return;
    turbinesGroup.children.forEach(function (t) {
      if (t.userData.hub) t.userData.hub.rotation.y += (t.userData.hub.userData.rotationSpeed || 0.02) * 60 * dt;
    });
  }

  function gameLoop() {
    if (!running) return;
    var dt = Math.min(clock.getDelta(), 0.05);
    controller.update(dt, keys);
    updateScore();
    updateCamera(dt);
    animateTurbines(dt);
    if (window.MountainBikeMultiplayer && MountainBikeMultiplayer.isInMultiplayer()) {
      var now = Date.now();
      if (now - lastSentTime > 50) {
        lastSentTime = now;
        MountainBikeMultiplayer.sendBikeState({
          x: controller.position.x, y: controller.position.y, z: controller.position.z,
          rotY: controller.rotationY
        });
      }
      if (otherBike && otherBikeState) {
        otherBike.position.set(otherBikeState.x, otherBikeState.y, otherBikeState.z);
        otherBike.rotation.y = otherBikeState.rotY;
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
  }

  function startGame(mode, isMultiplayerMode) {
    gameMode = mode || 'mountain';
    if (otherBike) otherBike.visible = !!isMultiplayerMode;
    otherBikeState = null;
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    document.getElementById('game-canvas-wrap').style.display = 'block';
    var tc = document.getElementById('touch-controls');
    if (tc && window.matchMedia('(max-width: 768px)').matches) tc.classList.add('active');
    score = 0;
    var startY = terrainData.height(0, 0) + 0.6;
    controller.position.set(0, startY, 0);
    controller.velocity.set(0, 0, 0);
    controller.speed = 0;
    controller.rotationY = 0;
    lastPos.set(0, startY, 0);
    bike.position.set(0, startY, 0);
    running = true;
    clock = new THREE.Clock();
    gameLoop();
  }

  document.addEventListener('keydown', function (e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': keys.forward = true; e.preventDefault(); break;
      case 'KeyS': case 'ArrowDown': keys.backward = true; e.preventDefault(); break;
      case 'KeyA': case 'ArrowLeft': keys.left = true; e.preventDefault(); break;
      case 'KeyD': case 'ArrowRight': keys.right = true; e.preventDefault(); break;
      case 'Space': keys.jump = true; e.preventDefault(); break;
    }
  });
  document.addEventListener('keyup', function (e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': keys.forward = false; break;
      case 'KeyS': case 'ArrowDown': keys.backward = false; break;
      case 'KeyA': case 'ArrowLeft': keys.left = false; break;
      case 'KeyD': case 'ArrowRight': keys.right = false; break;
      case 'Space': keys.jump = false; break;
    }
  });

  document.getElementById('btn-mountain-ride').addEventListener('click', function () { startGame('mountain'); });
  document.getElementById('btn-free-ride').addEventListener('click', function () { startGame('free'); });
  document.getElementById('btn-shop').addEventListener('click', function () { alert('Shop – Coming soon!'); });

  (function setupMultiplayer() {
    var mp = window.MountainBikeMultiplayer;
    if (!mp) return;
    var mainMenu = document.getElementById('main-menu');
    var mpPanel = document.getElementById('multiplayer-panel');
    var createView = document.getElementById('mp-create-view');
    var joinView = document.getElementById('mp-join-view');
    var codeDisplay = document.getElementById('room-code-display');
    var codeInput = document.getElementById('room-code-input');
    var joinError = document.getElementById('mp-join-error');

    document.getElementById('btn-2p-online').addEventListener('click', function () {
      mainMenu.style.display = 'none';
      mpPanel.style.display = 'block';
      createView.style.display = 'none';
      joinView.style.display = 'none';
      joinError.style.display = 'none';
    });
    document.getElementById('btn-back-mp').addEventListener('click', function () {
      mpPanel.style.display = 'none';
      mainMenu.style.display = 'block';
    });
    document.getElementById('btn-create-room').addEventListener('click', function () {
      createView.style.display = 'block';
      joinView.style.display = 'none';
      joinError.style.display = 'none';
      mp.createRoom();
    });
    document.getElementById('btn-join-room').addEventListener('click', function () {
      joinView.style.display = 'block';
      createView.style.display = 'none';
      joinError.style.display = 'none';
      codeInput.value = '';
    });
    document.getElementById('btn-do-join').addEventListener('click', function () {
      var code = codeInput.value.trim();
      if (!code) { joinError.textContent = 'Enter room code'; joinError.style.display = 'block'; return; }
      joinError.style.display = 'none';
      mp.joinRoom(code);
    });
    document.getElementById('btn-copy-code').addEventListener('click', function () {
      if (codeDisplay.textContent) {
        navigator.clipboard.writeText(codeDisplay.textContent).then(function () { alert('Code copied!'); });
      }
    });

    mp.onRoomCreated(function (code) {
      codeDisplay.textContent = code;
    });
    mp.onRoomJoined(function () {
      joinError.style.display = 'none';
      codeDisplay.textContent = 'Joined! Waiting for start...';
    });
    mp.onRoomReady(function () {
      startGame('free', true);
    });
    mp.onJoinError(function (msg) {
      joinError.textContent = msg;
      joinError.style.display = 'block';
    });
    mp.onOtherBikeState(function (data) {
      otherBikeState = { x: data.x, y: data.y, z: data.z, rotY: data.rotY };
    });
  })();

  function onResize() {
    if (!camera || !renderer) return;
    var wrap = document.getElementById('game-canvas-wrap');
    var w = (wrap && wrap.offsetWidth) ? wrap.offsetWidth : window.innerWidth;
    var h = (wrap && wrap.offsetHeight) ? wrap.offsetHeight : window.innerHeight;
    if (w <= 0) w = window.innerWidth;
    if (h <= 0) h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);
  var wrapEl = document.getElementById('game-canvas-wrap');
  if (wrapEl && typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function () { onResize(); });
    ro.observe(wrapEl);
  }

  (function setupTouchControls() {
    var tc = document.getElementById('touch-controls');
    if (!tc) return;
    var actionMap = { forward: 'forward', left: 'left', right: 'right', jump: 'jump' };
    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function (ev) {
      tc.addEventListener(ev, function (e) {
        e.preventDefault();
        var touch = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : (e.touches && e.touches[0] ? e.touches[0] : null);
        if (!touch) return;
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!el || !el.classList || !el.classList.contains('touch-zone')) {
          if (ev === 'touchend' || ev === 'touchcancel') keys.forward = keys.left = keys.right = keys.jump = false;
          return;
        }
        var action = el.dataset.action;
        if (!action) return;
        if (ev === 'touchstart' || ev === 'touchmove') {
          keys.forward = keys.left = keys.right = keys.jump = false;
          if (action === 'forward') keys.forward = true;
          if (action === 'left') keys.left = true;
          if (action === 'right') keys.right = true;
          if (action === 'jump') keys.jump = true;
        } else {
          keys.forward = keys.left = keys.right = keys.jump = false;
        }
      }, { passive: false });
    });
  })();

  initScene();
  initTerrain();
  initBike();
  onResize();
  setTimeout(onResize, 100);
})();
