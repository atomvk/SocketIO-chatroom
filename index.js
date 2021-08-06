const express = require('express');
const app = express();
const path = require('path')
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

let users = [];

class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.connected = true;
    this.typing = false;
  }
}

class Message {
  constructor(type, sender, recipient, value) {
    this.type = type;
    this.sender = sender.id;
    this.senderName = sender.name;
    this.recipient = recipient;
    this.value = value;
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/views/index.html');
});

app.use(express.static(path.join(__dirname, '/public')));

io.on('connection', (socket) => {

  socket.on('entered', (name) => {
    if (!name) name = 'Anonymous';
    let newUser = new User(socket.id, name);
    users.push(newUser);
    let msg = new Message('notification', newUser, '', newUser.name + ' connected');
    io.emit('current user', newUser);
    io.emit('users', users);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    let oldUser = users.filter(user => socket.id == user.id)[0];
    if (typeof(oldUser) != 'undefined') {
      let msg = new Message('notification', oldUser,'', oldUser.name + ' disconnected');
      io.emit('chat message', msg);
      users = users.filter(user => socket.id != user.id);
    }
  });

  socket.on('chat message', (msg) => {
    let message = new Message(msg.type, msg.sender, msg.recipient, msg.value);
    io.emit('chat message', message);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});