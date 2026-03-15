# Rounak Gaming Hub

Full-stack online mini games portal – dark theme, neon UI, auth, leaderboard, 2P online (Tic Tac Toe, Mountain Bike).

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose) – Atlas
- **Real-time:** Socket.io (2P rooms)

## Run

1. **Install & start** (from project root):
   ```bash
   cd gaming-hub
   npm install
   npm start
   ```
   Or from root: `npm start` (runs gaming-hub).

2. **Environment** – in `gaming-hub/`, copy `.env.example` to `.env` and set:
   - `MONGODB_URI` – MongoDB Atlas connection string
   - `JWT_SECRET` – strong random string (30+ chars)
   - `PORT` – optional (default 9000)

3. **Open:** `http://localhost:9000`

## Project Structure

```
Final project/
├── gaming-hub/                 # Main app
│   ├── client/                 # Frontend (served by Express)
│   │   ├── css/style.css
│   │   ├── js/
│   │   │   ├── api.js, auth.js, loading.js, mobile-nav.js
│   │   │   └── games/
│   │   │       ├── tictactoe.js   # + 2P online
│   │   │       ├── snake.js, rps.js, racing.js, shooting.js
│   │   │       ├── adventure.js, tetris.js, countmasters.js
│   │   │       └── submit-score.js
│   │   ├── mountain-bike/      # 3D game (iframe from Games page)
│   │   │   ├── index.html, style.css, main.js, bike.js, terrain.js, multiplayer.js
│   │   ├── index.html, games.html, leaderboard.html, login.html, register.html
│   ├── server/
│   │   ├── config/db.js
│   │   ├── models/User.js, Score.js
│   │   ├── routes/auth.js, score.js
│   │   ├── gameRooms.js        # 2P rooms (TTT + Mountain Bike)
│   │   └── server.js
│   ├── .env, .env.example, .gitignore
│   ├── package.json
│   ├── DEPLOYMENT.md
│   └── render.yaml
├── package.json                # npm start → gaming-hub
└── README.md                   # This file
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register (username, email, password) |
| POST | `/api/login` | Login → JWT + user |
| POST | `/api/score` | Submit score (Bearer token), body: `{ gameName, score }` |
| GET | `/api/leaderboard` | Top scores, optional `?game=GameName` |

## Games

Tic Tac Toe (Solo + 2P Online), Snake, Rock Paper Scissors, Car Racing, Shooting Game, Character Adventure, Tetris, Count Masters, Mountain Bike (3D, Solo + 2P Online).

## Deployment

See **gaming-hub/DEPLOYMENT.md** for Render / Railway steps and env vars.
