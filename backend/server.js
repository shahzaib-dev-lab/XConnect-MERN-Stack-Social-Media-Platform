const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());
// Chat Routes ko /api/messages path par mount karein
const chatRoutes = require('./routes/chatRoutes'); // Path check karein
app.use('/api/messages', chatRoutes);

// Database connection & Server Listen
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pulseDB')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('DB Error:', err));
app.get('/', (req, res) => {
  res.send('Pulse API Backend is running successfully!');
});
app.listen(5000, () => console.log('Server running on port 5000'));
