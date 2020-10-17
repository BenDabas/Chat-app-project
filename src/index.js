const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express(); //Create the application
const server = http.createServer(app); //Create new web server
const io = socketio(server); //Config the socketio with the server. Now the server support webSocket

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath)); // To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express. The function signature is: express.static(root, options])

io.on('connection', (socket) => {
    //"connection" is build in event
    //Using socket to communicate with the specific client
    // Listen for client connection
    console.log('New WebSocket connection');

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        socket.emit('message', generateMessage('Admin', 'Welcome !'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`)); //Send event to everyone except the new user(the particular connection ) in this room
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed !');
        }
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('disconnect', () => {
        //"disconnect" is build in event --> its occurred when user disconnect (close the browser....)

        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit(
            'locationMessage',
            generateLocationMessage(
                user.username,
                `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
            )
        );
        callback();
    });
});

server.listen(port, () => {
    //Start the HTTP server
    console.log('Server is up on port ', port);
});
