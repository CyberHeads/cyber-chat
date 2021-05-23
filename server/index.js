const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser,removeUser,getUser,getUsersInRoom } = require ('./users.js')

const PORT = process.env.PORT || 5000;

const router = require('./router');
const { Socket } = require('dgram');

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connect', (socket) => {
    
    socket.on('join', ({ name,room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if(error) return Callback (error);

        socket.emit ('message' , { user:'admin', text: `${user.name}, welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user:'admin', text: `${user.name}, has joined` });

        socket.join(user.room);

        callback();
    });

    socket.on('sendMessage', (message, callback)  =>{
        const user = getUser (socket.id);

        io.to(user.room).emit('message', {user: user.name, text: message});

        callback();
    })

    socket.on('disconnect', () => {
        console.log('user had left!!')
    });
    
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));