const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const cors = require('cors'); 
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // update this in production
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('text-to-speech', async ({ text, voice = 'nova' }) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://api.openai.com/v1/audio/speech',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        data: {
          model: 'tts-1',
          input: text,
          voice: voice,
        },
      });
      console.log('working')

      const base64Audio = Buffer.from(response.data, 'binary').toString('base64');

      // Send back to client as base64 string
      socket.emit('audio-data', { audio: base64Audio });
    } catch (error) {
      console.error('TTS error:', error.message);
      socket.emit('tts-error', 'Failed to generate audio');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(8000, () => {
  console.log('Server listening on http://localhost:8000');
});
