const cities = [
  {
    name: "Abuja",
    description: "Federal capital region with dense government and commuter traffic."
  },
  {
    name: "Lagos",
    description: "Nigeria’s busiest telecom city with very high user density."
  },
  {
    name: "Kano",
    description: "Major commercial hub with strong daytime network demand."
  },
  {
    name: "Port Harcourt",
    description: "Oil and business center with growing urban network load."
  },
  {
    name: "Enugu",
    description: "Fast-growing southeastern city with mixed residential traffic."
  },
  {
    name: "Ibadan",
    description: "Large metropolitan area with spread-out but heavy usage zones."
  },
  {
    name: "Kaduna",
    description: "Industrial and transport hub with periodic traffic spikes."
  },
  {
    name: "Jos",
    description: "Highland city with moderate load and variable signal patterns."
  },
  {
    name: "Maiduguri",
    description: "Strategic northeastern city with infrastructure-sensitive coverage."
  },
  {
    name: "Benin City",
    description: "Urban center with steady commercial and residential demand."
  }
];

let currentCityIndex = 0;
let towers = [];

function initCityDropdown() {
  const select = document.getElementById("citySelect");
  select.innerHTML = "";

  cities.forEach((city, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = city.name;
    select.appendChild(option);
  });

  select.value = currentCityIndex;
}

function switchCity() {
  currentCityIndex = parseInt(document.getElementById("citySelect").value);
  initNetwork();
}

function initNetwork() {
  const city = cities[currentCityIndex];
  document.getElementById("cityName").innerText = city.name;
  document.getElementById("cityDescription").innerText = city.description;

  const network = document.getElementById("network");
  network.innerHTML = "";
  towers = [];

  for (let i = 0; i < 15; i++) {
    let load = Math.floor(Math.random() * 60);

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

function render() {
  towers.forEach(t => {
    const el = document.getElementById("tower-" + t.id);
    if (!el) return;

    if (t.status === "offline") {
      el.className = "tower offline";
      el.innerText = `Tower ${t.id + 1}\nOFF`;
      return;
    }

    if (t.load < 40) el.className = "tower low";
    else if (t.load < 70) el.className = "tower medium";
    else el.className = "tower high";

    el.innerText = `Tower ${t.id + 1}\n${t.load}%`;
  });

  updateQoS();
}

function simulateTraffic() {
  towers.forEach(t => {
    if (t.status === "active") {
      t.load += Math.floor(Math.random() * 25);
      if (t.load > 100) t.load = 100;
    }
  });
  render();
}

function failTower() {
  const activeTowers = towers.filter(t => t.status === "active");
  if (activeTowers.length === 0) return;

  const randomActive = activeTowers[Math.floor(Math.random() * activeTowers.length)];
  randomActive.status = "offline";
  render();
}

function optimizeNetwork() {
  const activeTowers = towers.filter(t => t.status === "active");
  const overloaded = activeTowers.filter(t => t.load > 70);
  const underused = activeTowers.filter(t => t.load < 40);

  overloaded.forEach(o => {
    if (underused.length > 0) {
      const u = underused[Math.floor(Math.random() * underused.length)];
      const shift = 20;

      o.load -= shift;
      u.load += shift;

      if (o.load < 0) o.load = 0;
      if (u.load > 100) u.load = 100;
    }
  });

  render();
}

function updateQoS() {
  const active = towers.filter(t => t.status === "active");

  if (active.length === 0) {
    document.getElementById("qos").innerText = "0.0";
    document.getElementById("status").innerText = "Down";
    return;
  }

  const avgLoad = active.reduce((sum, t) => sum + t.load, 0) / active.length;
  const qos = 100 - avgLoad;

  document.getElementById("qos").innerText = qos.toFixed(1);

  let status = "Good";
  if (qos < 60) status = "Moderate";
  if (qos < 40) status = "Poor";

  document.getElementById("status").innerText = status;
}

initCityDropdown();
initNetwork();
