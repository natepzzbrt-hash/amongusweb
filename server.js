const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let room = {
  players: {},
  meeting: false,
  votes: {},
  impostor: null,
  sabotage: false
};

function assignRoles() {
  const ids = Object.keys(room.players);
  if (!ids.length) return;

  const imp = ids[Math.floor(Math.random() * ids.length)];
  room.impostor = imp;

  ids.forEach(id => {
    room.players[id].role = id === imp ? "impostor" : "crewmate";
    room.players[id].alive = true;
    room.players[id].tasks = 0;
  });
}

io.on("connection", (socket) => {

  room.players[socket.id] = {
    x: 100,
    y: 100,
    name: "Player",
    alive: true,
    role: "crewmate",
    tasks: 0
  };

  assignRoles();

  socket.emit("state", room);

  socket.on("move", (data) => {
    if (room.players[socket.id]) {
      room.players[socket.id].x = data.x;
      room.players[socket.id].y = data.y;
    }
    io.emit("state", room);
  });

  socket.on("task", () => {
    let p = room.players[socket.id];
    if (p && p.role === "crewmate") {
      p.tasks++;
    }
    io.emit("state", room);
  });

  socket.on("kill", (target) => {
    let p = room.players[socket.id];
    if (p?.role !== "impostor") return;

    if (room.players[target]) {
      room.players[target].alive = false;
    }

    io.emit("state", room);
  });

  socket.on("report", () => {
    room.meeting = true;
    room.votes = {};
    io.emit("state", room);
  });

  socket.on("vote", (target) => {
    room.votes[socket.id] = target;

    let allVoted = Object.keys(room.votes).length === Object.keys(room.players).length;

    if (allVoted) {
      let counts = {};
      Object.values(room.votes).forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });

      let kicked = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
      );

      if (room.players[kicked]) {
        room.players[kicked].alive = false;
      }

      room.meeting = false;
      room.votes = {};
    }

    io.emit("state", room);
  });

  socket.on("sabotage", () => {
    room.sabotage = true;
    io.emit("state", room);
  });

  socket.on("disconnect", () => {
    delete room.players[socket.id];
    io.emit("state", room);
  });

});

server.listen(process.env.PORT || 3000);