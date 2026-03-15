const express = require('express');
const jwt = require('jsonwebtoken');
const Score = require('../models/Score');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gaming-hub-secret-key';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/score - submit score (requires auth)
router.post('/score', authMiddleware, async (req, res) => {
  try {
    const { gameName, score } = req.body;
    if (!gameName || typeof score !== 'number') {
      return res.status(400).json({ error: 'gameName and score (number) are required' });
    }
    const record = await Score.create({
      userId: req.userId,
      gameName: String(gameName).trim(),
      score: Math.floor(score)
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save score' });
  }
});

// GET /api/leaderboard - top scores (optional ?game=GameName)
router.get('/leaderboard', async (req, res) => {
  try {
    const game = req.query.game;
    const match = game ? { gameName: { $regex: new RegExp(`^${game}$`, 'i') } } : {};
    const top = await Score.aggregate([
      { $match: match },
      { $sort: { score: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          rank: { $literal: 0 },
          username: '$user.username',
          gameName: 1,
          score: 1,
          date: 1
        }
      }
    ]);
    top.forEach((row, i) => { row.rank = i + 1; });
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
