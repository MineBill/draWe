var myDrawings = [];
var sharedDrawings = [];
var config;

var canvas;

function setup() {
  console.log("Client loaded.");
  config = new Config();
  canvas = createCanvas(window.innerWidth - 75, window.innerHeight - 20);
  background(config.bgcolor);
  socket.on('clt_drawing', client_DrawingReceived);
  socket.on('clt_mouse', client_MouseReceived);
  socket.on('clt_clearscreen', client_ClearScreen);
  socket.on('server_roomchanged', server_RoomJoined);

  // Creates the reset button
  let btn = createImg('icons/trashcan.png').style('border-radius', '2px');
  btn.mousePressed(clearScreen);
  btn.style('background-color', 'rgb(131,131,131)');
  btn.style('width', '50px');
  btn.style('height', '50px');
  btn.position(width + 17, height / 2);

  // Menu UI Button
  let roomBtn = createImg('icons/menuList.png').style('border-radius', '2px');
  roomBtn.mousePressed(DisplayModal);
  roomBtn.style('background-color', 'rgb(131,131,131)');
  roomBtn.style('width', '50px');
  roomBtn.style('height', '50px');
  roomBtn.position(width + 17, 15);
}

function clearScreen() {
  background(config.bgcolor);
  socket.emit('cmd_clearscreen');
}

// Draw drawing
function mouseDragged() {
  myDrawings[myDrawings.length - 1].points.push(createVector(mouseX, mouseY));

  let drawing = myDrawings[myDrawings.length - 1];
  let pA = drawing.points[drawing.points.length - 2];
  let pB = drawing.points[drawing.points.length - 1];

  strokeWeight(config.size);
  stroke(config.color);
  line(pA.x, pA.y, pB.x, pB.y);

  sendMouse('mouse');
}

function mousePressed() {
  let draw = new Drawing(mouseX, mouseY, config.size, config.color);
  myDrawings.push(draw);

  sendMouse('drawing');
}

function windowResized() {
  resizeCanvas(window.innerWidth - 75, window.innerHeight - 20);
}

// Draw received drawings
function client_MouseReceived(data) {
  //sharedDrawings[sharedDrawings.length - 1].points.push(createVector(data.x,data.y));
  let drawings = getDrawingsById(data.id);
  drawings[drawings.length - 1].points.push(createVector(data.x, data.y));

  let drawing = drawings[drawings.length - 1];
  let pA = drawing.points[drawing.points.length - 2];
  let pB = drawing.points[drawing.points.length - 1];

  console.log(pA + "," + pB);

  stroke(data.color);
  strokeWeight(data.size);
  line(pA.x, pA.y, pB.x, pB.y);
}

function client_DrawingReceived(data) {
  let newDrawing = new Drawing(data.x, data.y, data.size, data.color);
  let drawings = getDrawingsById(data.id);
  drawings.push(newDrawing);
}

function client_ClearScreen() {
  background(config.bgcolor);
}

function server_RoomJoined(roomId) {
  connectedRoomId = roomId;
  DisplayModal();
}

//REGION:  Events
function sendMouse(msg) {
  var data = {
    x: mouseX,
    y: mouseY,
    size: config.size,
    color: config.color,
    id: socket.id
  }

  socket.emit(msg, data);
}

function getDrawingsById(id) {
  for (let i = 0; i < sharedDrawings.length; i++) {
    if (sharedDrawings[i].id == id) {
      return sharedDrawings[i].drawings;
    }
  }
  let newClient = new ClientDrawingPack(id);
  sharedDrawings.push(newClient);
  return newClient.drawings;
}

function createUI() {

}

function resizeUI() {

}

//REGION: Classes
class Drawing {
  constructor(x, y, size, color) {
    this.firstPoint = createVector(x, y);
    this.points = [];
    this.points.push(this.firstPoint);
    this.size = size;
    this.color = color;
  }
}

class ClientDrawingPack {
  constructor(id) {
    this.id = id;
    this.drawings = [];
  }
}

class Config {
  constructor() {
    this.size = 5;
    this.color = 0;
    this.bgcolor = 250;
  }
}