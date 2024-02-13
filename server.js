npm install cors
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Enable CORS
app.use(cors());

// Connect to MongoDB (make sure MongoDB is running)
mongoose.connect('mongodb://localhost:27017/anonMessages', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Message schema
const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', MessageSchema);

app.use(bodyParser.json());

// Route to save a new message
app.post('/api/messages', async (req, res) => {
  try {
    const { text } = req.body;
    const message = new Message({ text });
    await message.save();

    // Emit new message event to all clients
    io.emit('newMessage');

    res.status(201).json({ message });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Error saving message' });
  }
});

// Route to get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort('-createdAt').exec();
    res.json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});