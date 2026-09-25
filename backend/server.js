const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express(); 

// ======================================================
// MIDDLEWARE
app.use(compression());

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ======================================================
// HTTP SERVER & SOCKET.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://xconnect-mern-stack-project.netlify.app',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
  },
  transports: ['polling', 'websocket'],
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_room', (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    if (!roomId) return;
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id}`, reason);
  });
});

// Self-ping to prevent Railway cold starts
setInterval(() => {
  http.get('https://xconnect-mern-stack-social-media-platform-production.up.railway.app/api/health');
}, 14 * 60 * 1000);

// ======================================================
// ROUTES
const authRoutes = require('./routes/authRoutes');
const tweetRoutes = require('./routes/tweetRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/messages', chatRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'XConnect server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, server: 'online', socket: true });
});

// ======================================================
// MONGODB CONNECTION & SERVER START
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });