import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket = io(URL, {
  autoConnect: false,
  // Match the server transport order — polling first, then upgrade to WebSocket
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1500,
  timeout: 10000,
});
