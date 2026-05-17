# 🕵️ The Mole

A real-time multiplayer social deduction game. One player is secretly the Mole — they don't know the secret word. Everyone gives one-word clues. Vote to find the Mole!

---

## How to Play

1. **One player creates a room** and shares the 4-letter code.
2. **Others join** using that code.
3. Host picks how many clue cycles (1–10) and starts the game (minimum 3 players).
4. Each player secretly sees their role:
   - **Regular players** → see the secret word
   - **The Mole** → sees "YOU ARE THE MOLE" (no word!)
5. Players take turns giving **one-word clues** each cycle.
6. After all cycles complete, everyone **votes** for who they think is the Mole.
7. **Players win** if they identify the Mole. **Mole wins** if they don't.

---

## Quick Start — Local Dev

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server starts on `http://localhost:3001`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# .env already points to localhost:3001 — no changes needed
npm run dev
```

Frontend starts on `http://localhost:5173`.

Open two or more browser tabs to test multiplayer locally.

---

## LAN Play (Same WiFi — Play with Friends Nearby)

### Step 1 — Find your local IP

**Mac:**
```bash
ipconfig getifaddr en0
```

**Windows:**
```bash
ipconfig
# look for IPv4 Address under your WiFi adapter
```

You'll get something like `192.168.1.42`.

### Step 2 — Start the backend

```bash
cd backend
npm run dev
```

### Step 3 — Configure the frontend

Edit `frontend/.env`:
```
VITE_SERVER_URL=http://192.168.1.42:3001
```

### Step 4 — Start the frontend

```bash
cd frontend
npm run dev
```

Friends open `http://192.168.1.42:5173` on their phone or laptop. No internet needed!

---

## Free Hosting Deployment

### Backend → Render (free tier)

1. Push your project to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service**.
3. Connect your repo, set **Root Directory** to `backend`.
4. Build command: `npm install` · Start command: `npm start`
5. Add environment variable: `FRONTEND_URL=https://your-frontend.vercel.app`
6. Deploy. Copy the URL (e.g. `https://mole-game.onrender.com`).

> Render free tier sleeps after 15 min inactivity. First load takes ~30s to wake.

### Frontend → Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your repo, set **Root Directory** to `frontend`.
3. Add environment variable: `VITE_SERVER_URL=https://mole-game.onrender.com`
4. Deploy. Your game is live!

---

## Project Structure

```
mole-game/
├── backend/
│   ├── src/
│   │   ├── gameState.js      # Room/player state + sanitizeRoom
│   │   ├── socketHandlers.js # All socket.io event handlers
│   │   └── words.js          # Word list (add more here)
│   ├── index.js              # Express + Socket.io entry
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx         # Create/join room
│   │   │   ├── Lobby.jsx        # Player list + cycle picker
│   │   │   ├── SecretCard.jsx   # Animated role reveal
│   │   │   ├── ClueRound.jsx    # Multi-cycle clue submission
│   │   │   ├── VotingRound.jsx  # Vote on who's the Mole
│   │   │   └── ResultScreen.jsx # Winner reveal + vote tally
│   │   ├── App.jsx              # Phase state machine + socket listeners
│   │   └── socket.js            # Socket.io client singleton
│   └── .env.example
└── README.md
```

---

## Word List

Pizza, Beach, Hospital, School, Airport, Cat, Football, Coffee, Library, Mountain, Ocean, Forest, Kitchen, Museum, Cinema, Garden, Bridge, Castle, Desert, Volcano, Submarine, Helicopter, Diamond, Umbrella, Telescope, Guitar, Piano, Compass, Lantern, Hammock, Elephant, Penguin, Cactus, Rainbow, Thunder, Candle, Anchor, Rocket, Jungle, Treasure

Add more in `backend/src/words.js`.
