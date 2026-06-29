const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let state = {};
let me = { x: 100, y: 100 };

socket.on("state", (data) => {
  state = data;
});

document.addEventListener("keydown", (e) => {
  let nx = me.x;
  let ny = me.y;

  if (e.key === "w") ny -= 5;
  if (e.key === "s") ny += 5;
  if (e.key === "a") nx -= 5;
  if (e.key === "d") nx += 5;

  if (!collide(nx, ny)) {
    me.x = nx;
    me.y = ny;
  }

  socket.emit("move", me);
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawWalls(ctx);

  for (let id in state.players) {
    let p = state.players[id];
    if (!p.alive) continue;

    ctx.fillStyle = p.role === "impostor" ? "red" : "white";
    ctx.fillRect(p.x, p.y, 20, 20);
  }

  renderUI(state, socket, me);

  requestAnimationFrame(draw);
}

draw();