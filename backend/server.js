const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();
const app = express();
// ======================================================
// MIDDLEWARE
app.use(
  cors({
    origin: '*',
    credentials: false,
  })
);

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// ======================================================
// HTTP SERVER

const server = http.createServer(app);
// ======================================================
// SOCKET.IO

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: [
      'GET',
      'POST',
      'DELETE',
    ],
  },

  transports: [
    'websocket',
    'polling',
  ],
});

// Make Socket.IO available inside routes
app.set('socketio', io);

// ======================================================
// SOCKET CONNECTION

io.on('connection', (socket) => {
  console.log(
    `Socket connected: ${socket.id}`
  );

  // Join private chat room
  socket.on('join_room', (roomId) => {
    if (!roomId) return;

    socket.join(roomId);

    console.log(
      `Socket ${socket.id} joined room: ${roomId}`
    );
  });

  // Leave private chat room
  socket.on('leave_room', (roomId) => {
    if (!roomId) return;

    socket.leave(roomId);

    console.log(
      `Socket ${socket.id} left room: ${roomId}`
    );
  });

  socket.on('disconnect', (reason) => {
    console.log(
      `Socket disconnected: ${socket.id}`,
      reason
    );
  });
});

// ======================================================
// ROUTES
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const tweetRoutes = require('./routes/tweetRoutes')
app.use('/api/tweets', tweetRoutes);
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/messages',chatRoutes);

// ======================================================
// HEALTH CHECK

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'XConnect server is running',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    server: 'online',
    socket: true,
  });
});
// ======================================================
// MONGODB
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/pulseDB';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(
      'MongoDB connected successfully'
    );

    const PORT =
      process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      'MongoDB connection failed:',
      error
    );
  });

// ======================================================
// ERROR HANDLING
process.on(
  'unhandledRejection',
  (error) => {
    console.error(
      'Unhandled Promise Rejection:',
      error
    );
  }
);

process.on(
  'uncaughtException',
  (error) => {
    console.error(
      'Uncaught Exception:',
      error
    );
  }
);