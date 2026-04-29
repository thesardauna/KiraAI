let towers = [];

// Initialize network
function initNetwork() {
  const network = document.getElementById("network");
  network.innerHTML = "";
  towers = [];

  for (let i = 0; i < 15; i++) {
    let load = Math.floor(Math.random() * 50);

    towers.push({
      id: i,
      load: load,
      status: "active"
    });

    const div = document.createElement("div");
    div.classList.add("tower");
    div.id = "tower-" + i;

    network.appendChild(div);
  }

  render();
}

// Render towers
function render() {
  towers.forEach(t => {
    const el = document.getElementById("tower-" + t.id);

    if (t.status === "offline") {
      el.className = "tower offline";
      el.innerText = "OFF";
      return;
    }

    if (t.load < 40) el.className = "tower low";
    else if (t.load < 70) el.className = "tower medium";
    else el.className = "tower high";

    el.innerText = t.load + "%";
  });

  updateQoS();
}

// Increase traffic
function simulateTraffic() {
  towers.forEach(t => {
    if (t.status === "active") {
      t.load += Math.floor(Math.random() * 30);
      if (t.load > 100) t.load = 100;
    }
  });
  render();
}

// Simulate tower failure
function failTower() {
  let index = Math.floor(Math.random() * towers.length);
  towers[index].status = "offline";
  render();
}

// Optimization logic (AI simulation)
function optimizeNetwork() {
  let activeTowers = towers.filter(t => t.status === "active");

  let overloaded = activeTowers.filter(t => t.load > 70);
  let underused = activeTowers.filter(t => t.load < 40);

  overloaded.forEach(o => {
    if (underused.length > 0) {
      let u = underused[Math.floor(Math.random() * underused.length)];

      let shift = 20;
      o.load -= shift;
      u.load += shift;
    }
  });

  render();
}

// QoS calculation
function updateQoS() {
  let active = towers.filter(t => t.status === "active");

  let avgLoad =
    active.reduce((sum, t) => sum + t.load, 0) / active.length;

  let qos = 100 - avgLoad;

  document.getElementById("qos").innerText = qos.toFixed(1);

  let status = "Good";
  if (qos < 60) status = "Moderate";
  if (qos < 40) status = "Poor";

  document.getElementById("status").innerText = status;
}

// Start
initNetwork();
