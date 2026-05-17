# 🕵️ The Mole

A real-time multiplayer social deduction game. One player is secretly the Mole — they don't know the secret word. Everyone gives one-word clues. Vote to find the Mole!

---

## How to Play

1. **One player creates a room** and shares the 4-letter code.
2. **Others join** using that code.
3. Host starts the game (minimum 3 players).
4. Each player secretly sees their role:
   - **Regular players** → see the secret word
   - **The Mole** → sees "YOU ARE THE MOLE" (no word!)
5. Players take turns giving **one-word clues** related to the word.
6. Everyone **votes** for who they think is the Mole.
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

This lets people on the **same WiFi network** play together without any deployment.

### Step 1 — Find your local IP

**Mac:**
```bash
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
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

The server binds to `0.0.0.0` so it's reachable on your LAN.

### Step 3 — Configure the frontend

Edit `frontend/.env`:
```
VITE_SERVER_URL=http://192.168.1.42:3001
```
(Replace with your actual local IP.)

### Step 4 — Start the frontend

```bash
cd frontend
npm run dev
```

Vite exposes on `host: true` so friends can open:
```
http://192.168.1.42:5173
```

Everyone joins from their phone or laptop — no internet needed!

---

## Free Hosting Deployment

### Backend → Render (free tier)

1. Push your project to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service**.
3. Connect your repo, set **Root Directory** to `backend`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variable:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
7. Deploy. Copy the URL (e.g., `https://mole-game.onrender.com`).

> **Note:** Render free tier spins down after 15 min inactivity. First connection may take ~30s to wake up.

### Frontend → Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your repo, set **Root Directory** to `frontend`.
3. Add environment variable:
   ```
   VITE_SERVER_URL=https://mole-game.onrender.com
   ```
4. Deploy. Your game is live!

### Frontend → Netlify (alternative)

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**.
2. Set **Base directory** to `frontend`.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_SERVER_URL=https://your-backend.onrender.com`
6. Deploy.

---

## Project Structure

```
mole-game/
├── backend/
│   ├── src/
│   │   ├── gameState.js      # Room/player state management
│   │   ├── socketHandlers.js # All socket.io event handlers
│   │   └── words.js          # Word list
│   ├── index.js              # Express + Socket.io server entry
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx        # Create/join room screen
│   │   │   ├── Lobby.jsx       # Waiting room with player list
│   │   │   ├── SecretCard.jsx  # Animated role reveal
│   │   │   ├── ClueRound.jsx   # Turn-based clue submission
│   │   │   ├── VotingRound.jsx # Vote on who's the Mole
│   │   │   └── ResultScreen.jsx# Winner reveal + vote tally
│   │   ├── App.jsx             # Root component + socket listeners
│   │   ├── socket.js           # Socket.io client instance
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

---

## Game Flow (Socket Events)

```
client                         server
  |-- create_room ------------>|
  |<-- callback (roomCode) ----|
  |                            |
  |-- join_room -------------->|
  |<-- room_updated (all) -----|
  |                            |
  |-- start_game ------------->|
  |<-- game_started (each) ----|   personalised: word OR mole
  |                            |
  |-- ready_for_clues -------->|   host only
  |<-- clue_phase_started -----|
  |                            |
  |-- submit_clue ------------>|   active player only
  |<-- clue_submitted (all) ---|
  |      ... repeat ...        |
  |<-- voting_phase_started ---|   after last clue
  |                            |
  |-- submit_vote ------------>|
  |<-- vote_updated (all) -----|
  |<-- game_result (all) ------|   after all votes
  |                            |
  |-- play_again ------------->|   host only
  |<-- return_to_lobby (all) --|
```

---

## Word List

Pizza, Beach, Hospital, School, Airport, Cat, Football, Coffee, Library, Mountain, Ocean, Forest, Kitchen, Museum, Cinema, Garden, Bridge, Castle, Desert, Volcano, Submarine, Helicopter, Diamond, Umbrella, Telescope, Guitar, Piano, Compass, Lantern, Hammock, Elephant, Penguin, Cactus, Rainbow, Thunder, Candle, Anchor, Rocket, Jungle, Treasure

Add more words in `backend/src/words.js`.
