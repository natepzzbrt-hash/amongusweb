const walls = [
  { x: 200, y: 200, w: 200, h: 20 },
  { x: 400, y: 300, w: 20, h: 200 }
];

function drawWalls(ctx) {
  ctx.fillStyle = "gray";
  walls.forEach(w => {
    ctx.fillRect(w.x, w.y, w.w, w.h);
  });
}

function collide(x, y) {
  return walls.some(w =>
    x < w.x + w.w &&
    x + 20 > w.x &&
    y < w.y + w.h &&
    y + 20 > w.y
  );
}