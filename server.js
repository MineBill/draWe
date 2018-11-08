// REGION: Init
var express = require('express');
var socket = require('socket.io');
var app = express();
var server = app.listen(3000);

app.use(express.static('public'));
console.log("Initializing server...");
var io = socket(server);
io.sockets.on('connection', newConnection);

// REGION: Data
var rooms = [];

// Triggered when a new connection was received
function newConnection(socket) {
  var room = new Room(socket.id);
  rooms.push(room);
  io.to(`${socket.id}`).emit('server_roomchanged', room.id);

  console.log("New connection: " + socket.id + " \nRoom ID: " + room.id);

  socket.on('cmd_mouse', cmd_MouseEvent);
  socket.on('cmd_drawing', cmd_CreateDrawing)
  socket.on('cmd_clearscreen', cmd_ClearScreen);
  socket.on('r_joinRoom', r_JoinRoom);

  function cmd_MouseEvent(data) {
    room.users.forEach(function(id) {
      socket.broadcast.to(id).emit('mouse', data);
    });
  }

  function cmd_CreateDrawing(data) {
    room.users.forEach(function(id) {
      socket.broadcast.to(id).emit('drawing', data);
    });
    console.log("User: |" + socket.id + "| sent a new drawing to room: |" + room.id + "|");
  }

  function cmd_ClearScreen(data) {
    room.users.forEach(function(id) {
      socket.broadcast.to(id).emit('cmd_clearscreen', data);
    });
  }

  function r_JoinRoom(roomId) {
    for (var i = 0; i < rooms.length; i++) {
      if (rooms[i].id == roomId) {
        room = rooms[i];
        room.users.push(socket.id);
        io.to(`${socket.id}`).emit('server_roomchanged', roomId);
        break;
      } else if (i == rooms.length - 1) {
        console.log("Join request from: |" + socket.id + "| failed because room: |" + roomId + "| does not exist.");
        return;
      }
    }
  }

}

function Room(firstUserId) {
  this.users = [];
  this.users.push(firstUserId);
  this.id = generateId(25);
}

Room.prototype.SearchUser = function(id) {
  for (let i = 0; i < this.users.length; i++) {
    if (this.users[i] == id) {
      return this;
    }
  }
};

function generateId(idlen) {
  let alphabet = "A1aB2bC3cD4dE5eF6fG7gH8hI9iJ0jK[kL]lM{mN}nOoPpQqRrSsTtUuVvWwXxYyZz"
  let id = "";
  for (let i = 0; i < idlen; i++) {
    id += alphabet.charAt(Math.floor(Math.random() * idlen));
  }
  return id;
}