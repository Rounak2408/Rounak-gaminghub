# Rounak Gaming Hub – Deployment Guide

Deploy karne ke liye ye steps follow karo. **MongoDB Atlas** pehle se use ho raha hai, ab sirf app ko host karna hai.

---

## 1. Deployment se pehle (ek baar)

### 1.1 MongoDB Atlas
- Database already **rounak-gaming-hub** pe hai.
- **Network Access:** Atlas → Network Access → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0) add karo taaki hosted server connect kar sake.
- **Connection string** same use karo:  
  `mongodb+srv://gaminghub:gaming123@cluster0.sm74pcq.mongodb.net/rounak-gaming-hub?retryWrites=true&w=majority`

### 1.2 Code GitHub par daalo
```bash
cd "c:\Users\rounak\Desktop\Final project\gaming-hub"
git init
git add .
git commit -m "Initial commit - Rounak Gaming Hub"
# GitHub pe new repo banao, phir:
git remote add origin https://github.com/YOUR_USERNAME/rounak-gaming-hub.git
git branch -M main
git push -u origin main
```
**.env file commit mat karo** (already .gitignore me hai). Production me env vars hosting site pe daaloge.

### 1.3 Production ke liye JWT Secret
- Strong secret banao (e.g. https://randomkeygen.com se).
- Isko deployment platform pe **JWT_SECRET** env variable me daalna hai.

---

## 2. Option A: Render.com pe deploy (recommended, free tier)

1. **Render.com** pe jao → Sign up / Login.
2. **New** → **Web Service**.
3. **Connect repository:** GitHub repo **rounak-gaming-hub** connect karo.
4. **Settings:**
   - **Name:** rounak-gaming-hub (ya jo naam chaho)
   - **Root Directory:** (blank)
   - **Runtime:** Node
   - **Build Command:** `npm install` (ya blank – Render auto run karega)
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. **Environment Variables** (Render dashboard → Environment):
   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | `mongodb+srv://gaminghub:gaming123@cluster0.sm74pcq.mongodb.net/rounak-gaming-hub?retryWrites=true&w=majority` |
   | `JWT_SECRET` | apna strong random string (e.g. 32+ chars) |
   | `PORT` | Render khud set karta hai, optional |

6. **Create Web Service** → deploy start ho jayega.
7. Deploy complete hone ke baad URL milega: `https://rounak-gaming-hub.onrender.com` (ya jo name diya).

---

## 3. Option B: Railway.app pe deploy

1. **Railway.app** → Login (GitHub se).
2. **New Project** → **Deploy from GitHub repo** → **rounak-gaming-hub** choose karo.
3. **Variables** tab me add karo:
   - `MONGODB_URI` = (apna Atlas URI)
   - `JWT_SECRET` = (strong secret)
4. **Settings** → **Root Directory** blank, **Build Command:** `npm install`, **Start Command:** `npm start`.
5. **Generate Domain** → public URL mil jayega.

---

## 4. Deploy ke baad check

1. **URL open karo** (Render/Railway ka).
2. **Register** → naya user banao.
3. **Login** → username dikhna chahiye.
4. **Games** → koi game khelo → Game Over → **Submit score**.
5. **Leaderboard** → apna score dikhna chahiye.
6. **Tic Tac Toe 2P Online** / **Mountain Bike 2P** → dono same URL se test karo (do tabs ya do devices).

---

## 5. Important notes

- **Free tier** pe server sleep ho sakta hai (e.g. Render); pehli request thodi slow ho sakti hai.
- **MONGODB_URI** aur **JWT_SECRET** kabhi GitHub pe push mat karo; sirf hosting site ke **Environment Variables** me daalo.
- Agar **custom domain** chahiye (e.g. www.rounakgaminghub.com) to Render/Railway dashboard me **Custom Domain** add karke DNS settings bataye gaye steps follow karo.

---

## Short checklist

| Step | Done? |
|------|--------|
| MongoDB Atlas – Allow Access from Anywhere (0.0.0.0/0) | ☐ |
| Code GitHub pe push (without .env) | ☐ |
| Render ya Railway pe repo connect | ☐ |
| MONGODB_URI, JWT_SECRET env vars set | ☐ |
| Deploy run karke URL open karke test | ☐ |
