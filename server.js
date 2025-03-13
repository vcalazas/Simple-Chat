const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files from public directory
app.use(express.static('public'));

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle user joining
    socket.on('join', (username) => {
        socket.username = username;
        io.emit('system message', `${username} joined the chat`);
    });

    // Handle incoming messages
    socket.on('message', (data) => {
        try {
            // Broadcast the message to all connected clients
            io.emit('message', {
                username: socket.username || 'Anonymous',
                message: data.message,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error handling message:', error);
            socket.emit('error', 'Failed to process message');
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket.username) {
            io.emit('system message', `${socket.username} left the chat`);
        }
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 8000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
