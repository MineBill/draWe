var socket;
var infoModal;

var roomID = "";
document.addEventListener('DOMContentLoaded', function() {
  socket = io.connect();

  createMenuHandler();
  createRoomHandler();

  DisplayModal();
});

function createMenuHandler() {
  infoModal = document.getElementById("infoModal");
  var span = document.getElementsByClassName("close")[0];

  span.onclick = function() {
    infoModal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == infoModal) {
      infoModal.style.display = "none";
    }
  }
}

////awd/awd/adw/awd/adw/adw/adw/wda

function createRoomHandler() {
  let joinRoomBtn = document.getElementById("joinRoomBtn");
  let joinRoomInput = document.getElementById("joinRoomInput");

  socket.on('server_roomchanged', function(id) {
    roomID = id;
    console.log("Room Changed.");
  });

  joinRoomBtn.onclick = function() {
    socket.emit('r_joinRoom', joinRoomInput.value);
    // Display an error on join failed
  }
}

function DisplayModal() {
  infoModal.style.display = "block";
  document.getElementById("roomId").innerHTML = `${roomID}`;
}