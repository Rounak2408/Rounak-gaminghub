/**
 * Mountain Bike 2-player online: Socket.io client.
 * Connects to same origin (gaming-hub server).
 */
window.MountainBikeMultiplayer = (function () {
  'use strict';

  var socket = null;
  var isMultiplayer = false;
  var roomCode = null;
  var onRoomCreatedCb = null;
  var onRoomJoinedCb = null;
  var onRoomReadyCb = null;
  var onJoinErrorCb = null;
  var onOtherBikeStateCb = null;

  function connect() {
    if (socket && socket.connected) return socket;
    var origin = window.location.origin;
    socket = io(origin, { path: '/socket.io/', transports: ['websocket', 'polling'] });
    socket.on('connect', function () {});
    socket.on('mountain-bike:room-created', function (data) {
      roomCode = data.code;
      if (onRoomCreatedCb) onRoomCreatedCb(data.code);
    });
    socket.on('mountain-bike:room-joined', function (data) {
      roomCode = data.code;
      if (onRoomJoinedCb) onRoomJoinedCb();
    });
    socket.on('mountain-bike:room-ready', function () {
      if (onRoomReadyCb) onRoomReadyCb();
    });
    socket.on('mountain-bike:join-error', function (data) {
      if (onJoinErrorCb) onJoinErrorCb(data.message || 'Could not join');
    });
    socket.on('mountain-bike:other-bike-state', function (data) {
      if (onOtherBikeStateCb) onOtherBikeStateCb(data);
    });
    return socket;
  }

  function createRoom() {
    isMultiplayer = true;
    connect();
    socket.emit('mountain-bike:create-room');
  }

  function joinRoom(code) {
    isMultiplayer = true;
    connect();
    socket.emit('mountain-bike:join-room', { code: (code || '').toUpperCase().trim() });
  }

  function sendBikeState(state) {
    if (socket && socket.connected && isMultiplayer) {
      socket.emit('mountain-bike:bike-state', state);
    }
  }

  function isInMultiplayer() {
    return isMultiplayer && socket && socket.connected;
  }

  function getRoomCode() {
    return roomCode;
  }

  function onRoomCreated(fn) { onRoomCreatedCb = fn; }
  function onRoomJoined(fn) { onRoomJoinedCb = fn; }
  function onRoomReady(fn) { onRoomReadyCb = fn; }
  function onJoinError(fn) { onJoinErrorCb = fn; }
  function onOtherBikeState(fn) { onOtherBikeStateCb = fn; }

  return {
    connect: connect,
    createRoom: createRoom,
    joinRoom: joinRoom,
    sendBikeState: sendBikeState,
    isInMultiplayer: isInMultiplayer,
    getRoomCode: getRoomCode,
    onRoomCreated: onRoomCreated,
    onRoomJoined: onRoomJoined,
    onRoomReady: onRoomReady,
    onJoinError: onJoinError,
    onOtherBikeState: onOtherBikeState
  };
})();
