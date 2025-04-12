const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

let messages = []; // In-memory message storage

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/chat', (req, res) => {
  const username = req.body.username;
  if (!username) return res.redirect('/');
  res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', (socket) => {
  socket.on('new user', (username) => {
    socket.username = username;
    socket.emit('load messages', messages);
  });

  socket.on('chat message', (msg) => {
    const messageObj = { user: socket.username, text: msg };
    messages.push(messageObj);
    io.emit('chat message', messageObj);
  });
});

http.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
