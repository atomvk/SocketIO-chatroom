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
    io.emit('current user', newUser);
    io.emit('users', users);
    io.emit('chat message', new Message('notification', '', '', newUser.name + ' connected'));
  });

  socket.on('disconnect', () => {
    let oldUser = users.filter(user => socket.id == user.id)[0];
    if (typeof(oldUser) != 'undefined') {
      io.emit('chat message', msg = new Message('notification', '','', oldUser.name + ' disconnected'));
      users = users.filter(user => socket.id != user.id);
    }
  });

  socket.on('typing', (value) => {
    let currentUser = users.filter(user => socket.id == user.id)[0];
    currentUser.typing = value;
    sendTypingMessage(users.filter(user => user.typing == true));
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', new Message(msg.type, msg.sender, msg.recipient, msg.value));
  });
});

server.listen(process.env.PORT || 3000);

function sendTypingMessage(typers) {
  if (typers.length > 1) {
    io.emit('chat message', new Message('typing', '', '', typers.length + ' people are typing...'));
  }
  else if (typers.length > 0){
    io.emit('chat message', new Message('typing','', '', typers[0].name + ' is typing...'));
  }
  else{
    io.emit('chat message', new Message('typing','', '',''));
  }
  return;
}
