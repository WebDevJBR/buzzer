const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


var singleton = {
    buzzedIn: false,
    userName: '',
}

io.on('connection', (socket) => {
    console.log('New Websocket connection!');

    // User joins game room
    socket.on('join', ({userName, gameId}, callback) => {
        console.log(userName);
        socket.join(gameId);
        socket.broadcast.to(gameId).emit('userJoined', {userName, gameId});
    });

    // Host joins game room
    socket.on('hostGame', (gameId, callback) => {
        socket.join(gameId);
        callback("Joined: " + gameId);
    });

    // Buzz in
    socket.on('buzzIn', (data, callback) => {
        console.log(data);
        if (!singleton.buzzedIn) {
            singleton.buzzedIn = true;
            socket.broadcast.to(data.gameId).emit('toggleBuzzers', true);
            socket.broadcast.to(data.gameId).emit('gameBuzz', data.userName);
        }
    });

    // Unlock buzzers
    socket.on('unlockBuzzers', (data, callback) => {
        singleton.buzzedIn = false;
        socket.to(data.gameId).emit('toggleBuzzers', false);
    });

    socket.on('disconnect', (data) => {
        console.log('dc..');
    })
});


// Launch
const port = 4000;
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})