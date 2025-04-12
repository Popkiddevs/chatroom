const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};
const messages = []; // In-memory storage for messages

app.use(express.static('public')); // Serve static files from the 'public' directory

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    let username;

    socket.on('login', (data) => {
        username = data.username;
        users[socket.id] = username;
        console.log(`${username} connected`);

        // Send existing messages to the newly connected user
        socket.emit('load_messages', messages);

        // Broadcast to all other users that a new user has joined
        socket.broadcast.emit('user_joined', `${username} joined the chat`);

        // Send updated user list (optional, but can be useful)
        io.emit('user_list', Object.values(users));
    });

    socket.on('chat_message', (message) => {
        const newMessage = { username: username, text: message };
        messages.push(newMessage);
        io.emit('new_message', newMessage); // Broadcast the new message to everyone
    });

    socket.on('disconnect', () => {
        if (username) {
            delete users[socket.id];
            console.log(`${username} disconnected`);
            socket.broadcast.emit('user_left', `${username} left the chat`);
            io.emit('user_list', Object.values(users));
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
