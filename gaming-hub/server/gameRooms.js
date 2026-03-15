/**
 * Generic 2-player game rooms. Key = prefix + ':' + code (e.g. 'ttt:ABC123', 'mb:XYZ789').
 */
const rooms = new Map();
const CODE_LEN = 6;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode() {
  let code = '';
  for (let i = 0; i < CODE_LEN; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
  return code;
}

function roomKey(prefix, code) {
  const c = (code || '').toString().trim();
  return (prefix || '') + ':' + c;
}

function normalizeCustomCode(input) {
  const s = (input || '').toString().trim().replace(/\s+/g, ' ');
  if (s.length < 2) return null;
  if (s.length > 20) return s.slice(0, 20).trim();
  return s;
}

function createRoom(prefix, socketId, customCode) {
  let code;
  if (customCode && normalizeCustomCode(customCode)) {
    code = normalizeCustomCode(customCode);
    const key = roomKey(prefix, code);
    if (rooms.has(key)) return { ok: false, reason: 'This Room ID is already in use. Choose another.' };
  } else {
    code = generateCode();
    let key = roomKey(prefix, code);
    while (rooms.has(key)) {
      code = generateCode();
      key = roomKey(prefix, code);
    }
    code = code.toUpperCase();
  }
  const key = roomKey(prefix, code);
  rooms.set(key, {
    prefix,
    code,
    playerIds: new Set([socketId]),
    playerOrder: [socketId],
    createdAt: Date.now()
  });
  return { ok: true, code };
}

function joinRoom(prefix, code, socketId) {
  const normalized = (code || '').toString().trim().replace(/\s+/g, ' ');
  const key = roomKey(prefix, normalized);
  const room = rooms.get(key);
  if (!room) return { ok: false, reason: 'Room not found. Check the Room ID.' };
  if (room.playerIds.size >= 2) return { ok: false, reason: 'Room full' };
  room.playerIds.add(socketId);
  room.playerOrder.push(socketId);
  return { ok: true, roomCode: room.code, key };
}

function leaveRoom(socketId) {
  for (const [key, room] of rooms.entries()) {
    if (room.playerIds.has(socketId)) {
      room.playerIds.delete(socketId);
      const idx = room.playerOrder.indexOf(socketId);
      if (idx !== -1) room.playerOrder.splice(idx, 1);
      if (room.playerIds.size === 0) rooms.delete(key);
      return { key, prefix: room.prefix, code: room.code };
    }
  }
  return null;
}

function getRoomBySocket(socketId) {
  for (const [key, room] of rooms.entries()) {
    if (room.playerIds.has(socketId)) return { key, prefix: room.prefix, code: room.code, room };
  }
  return null;
}

function getRoom(prefix, code) {
  return rooms.get(roomKey(prefix, code)) || null;
}

function getPlayerIndex(room, socketId) {
  const idx = room.playerOrder.indexOf(socketId);
  return idx === -1 ? -1 : idx;
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomBySocket,
  getRoom,
  getPlayerIndex,
  roomKey,
  normalizeCustomCode,
  rooms
};
