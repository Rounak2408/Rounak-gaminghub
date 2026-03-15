require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/score');
const gameRooms = require('./gameRooms');

connectDB();

const app = express();
const PORT = process.env.PORT || 9000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Serve static client files from client folder
app.use(express.static(path.join(__dirname, '..', 'client')));

app.use('/api', authRoutes);
app.use('/api', scoreRoutes);

// SPA-style fallback: serve index.html for client routes
app.get(['/', '/games', '/leaderboard', '/login', '/register'], (req, res) => {
  const page = req.path === '/' ? 'index' : req.path.slice(1);
  res.sendFile(path.join(__dirname, '..', 'client', page === 'index' ? 'index.html' : `${page}.html`));
});

// Shared game rooms: Mountain Bike (mb) + Tic Tac Toe (ttt) + more
io.on('connection', (socket) => {
  // ----- Mountain Bike -----
  socket.on('mountain-bike:create-room', (data) => {
    const result = gameRooms.createRoom('mb', socket.id, data && data.roomCode);
    if (!result.ok) {
      socket.emit('mountain-bike:join-error', { message: result.reason || 'Could not create room' });
      return;
    }
    socket.join('mb:' + result.code);
    socket.emit('mountain-bike:room-created', { code: result.code });
  });
  socket.on('mountain-bike:join-room', (data) => {
    const result = gameRooms.joinRoom('mb', data.code || '', socket.id);
    if (!result.ok) {
      socket.emit('mountain-bike:join-error', { message: result.reason || 'Could not join' });
      return;
    }
    const roomName = result.key;
    const room = gameRooms.getRoom('mb', result.roomCode);
    socket.join(roomName);
    socket.emit('mountain-bike:room-joined', { code: result.roomCode });
    io.to(roomName).emit('mountain-bike:player-joined', { socketId: socket.id, code: result.roomCode });
    if (room && room.playerIds.size === 2) io.to(roomName).emit('mountain-bike:room-ready');
  });
  socket.on('mountain-bike:bike-state', (state) => {
    const info = gameRooms.getRoomBySocket(socket.id);
    if (!info || info.prefix !== 'mb') return;
    socket.to(info.key).emit('mountain-bike:other-bike-state', { socketId: socket.id, ...state });
  });

  // ----- Tic Tac Toe -----
  socket.on('ttt:create-room', (data) => {
    const result = gameRooms.createRoom('ttt', socket.id, data && data.roomCode);
    if (!result.ok) {
      socket.emit('ttt:create-error', { message: result.reason || 'Could not create room' });
      return;
    }
    socket.join('ttt:' + result.code);
    socket.emit('ttt:room-created', { code: result.code });
  });
  socket.on('ttt:join-room', (data) => {
    const result = gameRooms.joinRoom('ttt', data.code || '', socket.id);
    if (!result.ok) {
      socket.emit('ttt:join-error', { message: result.reason || 'Could not join' });
      return;
    }
    const roomName = result.key;
    const room = gameRooms.getRoom('ttt', result.roomCode);
    socket.join(roomName);
    socket.emit('ttt:room-joined', { code: result.roomCode });
    io.to(roomName).emit('ttt:player-joined', { socketId: socket.id });
    if (room && room.playerIds.size === 2) {
      room.playerOrder.forEach((id, idx) => {
        io.to(id).emit('ttt:room-ready', { playerIndex: idx, symbol: idx === 0 ? 'X' : 'O' });
      });
    }
  });
  socket.on('ttt:move', (data) => {
    const info = gameRooms.getRoomBySocket(socket.id);
    if (!info || info.prefix !== 'ttt') return;
    const index = typeof data.index === 'number' ? data.index : parseInt(data.index, 10);
    const symbol = data.symbol === 'X' || data.symbol === 'O' ? data.symbol : null;
    if (index < 0 || index > 8 || !symbol) return;
    socket.to(info.key).emit('ttt:opponent-move', { index: index, symbol: symbol });
  });
  socket.on('ttt:restart-request', () => {
    const info = gameRooms.getRoomBySocket(socket.id);
    if (!info || info.prefix !== 'ttt') return;
    io.to(info.key).emit('ttt:restart-request', { socketId: socket.id });
  });

  socket.on('disconnect', () => {
    const left = gameRooms.leaveRoom(socket.id);
    if (left) {
      io.to(left.key).emit(left.prefix === 'mb' ? 'mountain-bike:player-left' : 'ttt:player-left', { socketId: socket.id });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
