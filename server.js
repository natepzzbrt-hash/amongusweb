const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function createPlayer(id) {
  return {
    id,
    x: Math.random() * 400,
    y: Math.random() * 400,
    color: "#" + Math.floor(Math.random()*16777215).toString(16)
  };
}

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = {};

    rooms[roomId][socket.id] = createPlayer(socket.id);

    io.to(roomId).emit("roomUpdate", rooms[roomId]);
  });

  socket.on("move", ({ roomId, x, y }) => {
    if (!rooms[roomId]) return;
    if (!rooms[roomId][socket.id]) return;

    rooms[roomId][socket.id].x = x;
    rooms[roomId][socket.id].y = y;

    io.to(roomId).emit("roomUpdate", rooms[roomId]);
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      if (rooms[roomId][socket.id]) {
        delete rooms[roomId][socket.id];
        io.to(roomId).emit("roomUpdate", rooms[roomId]);
      }
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
