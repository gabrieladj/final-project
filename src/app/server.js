const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('chat message', (message) => {
    console.log('Message:', message);
    io.emit('chat message', message);
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
