var Bike = (function () {
  'use strict';

  var ACCEL = 80;
  var MAX_SPEED = 35;
  var TURN_SPEED = 2.2;
  var GRAVITY = -32;
  var JUMP_FORCE = 14;
  var GROUND_DAMP = 0.92;
  var AIR_DAMP = 0.98;

  function createBike(options) {
    options = options || {};
    var bodyColor = options.bodyColor !== undefined ? options.bodyColor : 0xcc2222;
    var riderColor = options.riderColor !== undefined ? options.riderColor : 0x3366ff;
    var group = new THREE.Group();

    var bodyGeo = new THREE.BoxGeometry(1.2, 0.5, 2.2);
    var wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    var matBody = new THREE.MeshStandardMaterial({ color: bodyColor });
    var matWheel = new THREE.MeshStandardMaterial({ color: 0x222222 });

    var body = new THREE.Mesh(bodyGeo, matBody);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    var wheelFL = new THREE.Mesh(wheelGeo, matWheel);
    wheelFL.rotation.z = Math.PI / 2;
    wheelFL.position.set(-0.6, 0.5, 0.8);
    wheelFL.castShadow = true;
    group.add(wheelFL);
    var wheelFR = new THREE.Mesh(wheelGeo, matWheel);
    wheelFR.rotation.z = Math.PI / 2;
    wheelFR.position.set(0.6, 0.5, 0.8);
    wheelFR.castShadow = true;
    group.add(wheelFR);
    var wheelBL = new THREE.Mesh(wheelGeo, matWheel);
    wheelBL.rotation.z = Math.PI / 2;
    wheelBL.position.set(-0.6, 0.5, -0.8);
    wheelBL.castShadow = true;
    group.add(wheelBL);
    var wheelBR = new THREE.Mesh(wheelGeo, matWheel);
    wheelBR.rotation.z = Math.PI / 2;
    wheelBR.position.set(0.6, 0.5, -0.8);
    wheelBR.castShadow = true;
    group.add(wheelBR);

    var riderGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
    var riderMat = new THREE.MeshStandardMaterial({ color: riderColor });
    var rider = new THREE.Mesh(riderGeo, riderMat);
    rider.position.set(0, 1.6, 0.2);
    rider.castShadow = true;
    group.add(rider);

    group.userData.wheels = [wheelFL, wheelFR, wheelBL, wheelBR];
    return group;
  }

  function BikeController(bikeMesh, terrainHeight) {
    this.mesh = bikeMesh;
    this.terrainHeight = terrainHeight;
    this.position = new THREE.Vector3(0, 5, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotationY = 0;
    this.onGround = true;
    this.speed = 0;
  }

  BikeController.prototype.getForward = function () {
    return new THREE.Vector3(-Math.sin(this.rotationY), 0, -Math.cos(this.rotationY));
  };

  BikeController.prototype.update = function (dt, keys) {
    var forward = this.getForward();
    var right = new THREE.Vector3(forward.z, 0, -forward.x);

    if (this.onGround) {
      if (keys.forward) this.speed = Math.min(MAX_SPEED, this.speed + ACCEL * dt);
      if (keys.backward) this.speed = Math.max(-MAX_SPEED * 0.5, this.speed - ACCEL * dt);
      if (!keys.forward && !keys.backward) this.speed *= GROUND_DAMP;
      if (keys.left) this.rotationY += TURN_SPEED * dt * (Math.abs(this.speed) / MAX_SPEED || 0.3);
      if (keys.right) this.rotationY -= TURN_SPEED * dt * (Math.abs(this.speed) / MAX_SPEED || 0.3);

      this.velocity.x = forward.x * this.speed;
      this.velocity.z = forward.z * this.speed;
      this.velocity.y = 0;
      if (keys.jump) {
        this.velocity.y = JUMP_FORCE;
        this.onGround = false;
      }
    } else {
      this.velocity.y += GRAVITY * dt;
      this.velocity.x *= AIR_DAMP;
      this.velocity.z *= AIR_DAMP;
    }

    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;
    this.position.y += this.velocity.y * dt;

    var groundY = this.terrainHeight(this.position.x, this.position.z);
    if (this.position.y <= groundY + 0.6) {
      this.position.y = groundY + 0.6;
      this.velocity.y = 0;
      this.onGround = true;
    }

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;

    var tilt = -this.velocity.x * 0.02;
    this.mesh.rotation.z = Math.max(-0.4, Math.min(0.4, tilt));
  };

  return {
    createBike: createBike,
    BikeController: BikeController
  };
})();
