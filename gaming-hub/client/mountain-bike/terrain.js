var MountainTerrain = (function () {
  'use strict';

  function createTerrain(scene, options) {
    options = options || {};
    var size = options.size || 400;
    var segments = options.segments || 80;
    var maxHeight = options.maxHeight || 25;
    var group = new THREE.Group();

    // Height function: hills and valleys
    function height(x, z) {
      var xx = x / size;
      var zz = z / size;
      var h = 0;
      h += 8 * Math.sin(xx * 2) * Math.cos(zz * 1.5);
      h += 5 * Math.sin(xx * 4 + 1) * Math.cos(zz * 3);
      h += 3 * Math.sin(xx * 0.8) * Math.cos(zz * 0.8);
      return h * maxHeight * 0.5;
    }

    var geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    var vertices = geometry.attributes.position.array;
    for (var i = 0; i < vertices.length; i += 3) {
      vertices[i + 1] = height(vertices[i], vertices[i + 2]);
    }
    geometry.computeVertexNormals();

    var material = new THREE.MeshStandardMaterial({
      color: 0x2d4a2d,
      roughness: 0.9,
      metalness: 0.1
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    group.add(mesh);

    return { group: group, height: height };
  }

  function createTrees(scene, terrainHeight, count) {
    count = count || 30;
    var group = new THREE.Group();
    var trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 4, 6);
    var leavesGeo = new THREE.ConeGeometry(2.5, 6, 6);
    var trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    var leavesMat = new THREE.MeshStandardMaterial({ color: 0x1a5c1a });

    for (var i = 0; i < count; i++) {
      var x = (Math.random() - 0.5) * 350;
      var z = (Math.random() - 0.5) * 350;
      var y = typeof terrainHeight === 'function' ? terrainHeight(x, z) : 0;

      var tree = new THREE.Group();
      var trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2;
      trunk.castShadow = true;
      tree.add(trunk);
      var leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.y = 5;
      leaves.castShadow = true;
      tree.add(leaves);
      tree.position.set(x, y, z);
      group.add(tree);
    }
    return group;
  }

  function createWindTurbine(x, z, terrainHeight) {
    var group = new THREE.Group();
    var towerGeo = new THREE.CylinderGeometry(0.8, 1.2, 25, 8);
    var towerMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    var tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 12.5;
    tower.castShadow = true;
    group.add(tower);

    var bladeLength = 8;
    var bladeGeo = new THREE.BoxGeometry(0.4, bladeLength, 0.2);
    var bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    var hub = new THREE.Group();
    for (var i = 0; i < 3; i++) {
      var blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = bladeLength / 2;
      blade.rotation.z = (i / 3) * Math.PI * 2;
      hub.add(blade);
    }
    hub.position.y = 25;
    hub.userData.rotationSpeed = 0.02;
    group.add(hub);
    group.userData.hub = hub;

    var y = typeof terrainHeight === 'function' ? terrainHeight(x, z) : 0;
    group.position.set(x, y, z);
    return group;
  }

  function createRamp(x, z, terrainHeight, width, height, depth) {
    width = width || 12;
    height = height || 4;
    depth = depth || 8;
    var group = new THREE.Group();
    var geo = new THREE.BoxGeometry(width, height, depth);
    var mat = new THREE.MeshStandardMaterial({ color: 0x8b6914 });
    var ramp = new THREE.Mesh(geo, mat);
    ramp.rotation.x = -0.4;
    ramp.position.y = height / 2;
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    group.add(ramp);
    var y = typeof terrainHeight === 'function' ? terrainHeight(x, z) : 0;
    group.position.set(x, y, z);
    return group;
  }

  function createRamps(scene, terrainHeight, count) {
    count = count || 6;
    var group = new THREE.Group();
    for (var i = 0; i < count; i++) {
      var x = (Math.random() - 0.5) * 300;
      var z = (Math.random() - 0.5) * 300;
      group.add(createRamp(x, z, terrainHeight, 10 + Math.random() * 6, 2 + Math.random() * 3, 6));
    }
    return group;
  }

  function createTurbines(terrainHeight, count) {
    count = count || 5;
    var group = new THREE.Group();
    for (var i = 0; i < count; i++) {
      var x = (Math.random() - 0.5) * 280;
      var z = (Math.random() - 0.5) * 280;
      group.add(createWindTurbine(x, z, terrainHeight));
    }
    return group;
  }

  return {
    createTerrain: createTerrain,
    createTrees: createTrees,
    createWindTurbine: createWindTurbine,
    createRamp: createRamp,
    createRamps: createRamps,
    createTurbines: createTurbines
  };
})();
