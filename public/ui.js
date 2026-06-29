const ui = document.getElementById("ui");

function renderUI(state, socket, me) {
  ui.innerHTML = "";

  if (state.meeting) {
    ui.innerHTML += "<h3>MEETING</h3>";

    Object.keys(state.players).forEach(id => {
      let btn = document.createElement("button");
      btn.innerText = "Vote " + id.slice(0, 4);
      btn.onclick = () => socket.emit("vote", id);
      ui.appendChild(btn);
    });

    return;
  }

  // TASK BUTTON
  let taskBtn = document.createElement("button");
  taskBtn.innerText = "Task";
  taskBtn.onclick = () => socket.emit("task");
  ui.appendChild(taskBtn);

  // REPORT
  let reportBtn = document.createElement("button");
  reportBtn.innerText = "Report";
  reportBtn.onclick = () => socket.emit("report");
  ui.appendChild(reportBtn);

  // SABOTAGE (impostor only)
  if (me.role === "impostor") {
    let sabBtn = document.createElement("button");
    sabBtn.innerText = "Sabotage";
    sabBtn.onclick = () => socket.emit("sabotage");
    ui.appendChild(sabBtn);
  }
}