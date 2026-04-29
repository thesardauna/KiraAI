/**
 * Kira AI – Network Digital Twin Engine
 * Cognitive QoS Optimizer | script.js
 *
 * Architecture:
 *  - KiraConfig   : constants and tunable parameters
 *  - KiraState    : single source of truth for app state
 *  - CityService  : city data and dropdown management
 *  - TowerService : tower generation, mutation, rendering
 *  - QoSService   : scoring, status classification, UI updates
 *  - SimControls  : public simulation actions (traffic, failure, optimize)
 *  - App          : bootstrap and event wiring
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════ */
const KiraConfig = Object.freeze({
  TOWER_COUNT:        15,
  INITIAL_MAX_LOAD:   60,   // max random load on city init
  TRAFFIC_MAX_SPIKE:  25,   // max load added per Increase Traffic call
  OPTIMIZE_SHIFT:     20,   // load units moved from overloaded → underused
  LOAD_LOW_THRESHOLD: 40,   // below → low (green)
  LOAD_HIGH_THRESHOLD:70,   // above → high (red)
  QOS_GOOD:           60,   // above → "Good"
  QOS_MODERATE:       40,   // above → "Moderate", else "Poor"
});

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */
const CITIES = Object.freeze([
  {
    name: "Abuja",
    description: "Federal capital region with dense government and commuter traffic."
  },
  {
    name: "Lagos",
    description: "Nigeria's busiest telecom city with very high user density."
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
  },
]);

/* ═══════════════════════════════════════════════════════════
   STATE  (single mutable source of truth)
   ═══════════════════════════════════════════════════════════ */
const KiraState = {
  currentCityIndex: 0,
  towers: [],           // Array<{ id, load, status: 'active'|'offline' }>
};

/* ═══════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════ */

/** Returns a random integer in [0, max). */
const randInt = (max) => Math.floor(Math.random() * max);

/** Clamps a number between min and max (inclusive). */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/* ═══════════════════════════════════════════════════════════
   CITY SERVICE
   ═══════════════════════════════════════════════════════════ */
const CityService = {
  /**
   * Populates the city <select> dropdown and sets the initial selection.
   */
  initDropdown() {
    const select = document.getElementById('citySelect');
    const fragment = document.createDocumentFragment();

    CITIES.forEach((city, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = city.name;
      fragment.appendChild(option);
    });

    select.innerHTML = '';
    select.appendChild(fragment);
    select.value = KiraState.currentCityIndex;
  },

  /**
   * Returns the currently active city object.
   * @returns {{ name: string, description: string }}
   */
  getCurrent() {
    return CITIES[KiraState.currentCityIndex];
  },

  /**
   * Reads the dropdown and updates state, then re-initialises the network.
   */
  switch() {
    const select = document.getElementById('citySelect');
    KiraState.currentCityIndex = parseInt(select.value, 10);
    TowerService.init();
  },
};

/* ═══════════════════════════════════════════════════════════
   TOWER SERVICE
   ═══════════════════════════════════════════════════════════ */
const TowerService = {
  /**
   * Builds tower state, renders city info, and mounts tower DOM nodes.
   */
  init() {
    const city = CityService.getCurrent();

    // Update city info panel
    document.getElementById('cityName').textContent        = city.name;
    document.getElementById('cityDescription').textContent = city.description;

    // Reset towers state
    KiraState.towers = Array.from({ length: KiraConfig.TOWER_COUNT }, (_, i) => ({
      id:     i,
      load:   randInt(KiraConfig.INITIAL_MAX_LOAD),
      status: 'active',
    }));

    // Rebuild DOM
    const networkEl = document.getElementById('network');
    const fragment  = document.createDocumentFragment();
    networkEl.innerHTML = '';

    KiraState.towers.forEach((tower) => {
      const div = document.createElement('div');
      div.classList.add('tower');
      div.id = `tower-${tower.id}`;
      div.setAttribute('role', 'listitem');
      fragment.appendChild(div);
    });

    networkEl.appendChild(fragment);
    this.render();
  },

  /**
   * Syncs all tower DOM elements with current state.
   */
  render() {
    const { LOAD_LOW_THRESHOLD, LOAD_HIGH_THRESHOLD } = KiraConfig;

    KiraState.towers.forEach((tower) => {
      const el = document.getElementById(`tower-${tower.id}`);
      if (!el) return;

      if (tower.status === 'offline') {
        el.className       = 'tower offline';
        el.textContent     = '';
        el.dataset.label   = `Tower ${tower.id + 1}`;
        el.dataset.load    = 'OFF';
        el.setAttribute('aria-label', `Tower ${tower.id + 1}: offline`);
        return;
      }

      let loadClass;
      if      (tower.load < LOAD_LOW_THRESHOLD)  loadClass = 'low';
      else if (tower.load < LOAD_HIGH_THRESHOLD) loadClass = 'medium';
      else                                        loadClass = 'high';

      el.className     = `tower ${loadClass}`;
      el.dataset.label = `Tower ${tower.id + 1}`;
      el.dataset.load  = `${tower.load}%`;
      el.setAttribute('aria-label', `Tower ${tower.id + 1}: ${tower.load}% load, ${loadClass}`);
    });

    QoSService.update();
  },

  /**
   * Returns only active towers.
   * @returns {Array}
   */
  getActive() {
    return KiraState.towers.filter((t) => t.status === 'active');
  },
};

/* ═══════════════════════════════════════════════════════════
   QoS SERVICE
   ═══════════════════════════════════════════════════════════ */
const QoSService = {
  /**
   * Recalculates QoS from current tower state and updates the UI.
   */
  update() {
    const active = TowerService.getActive();
    const qosEl   = document.getElementById('qos');
    const statusEl = document.getElementById('status');
    const statusDot   = document.getElementById('statusDot');
    const statusLabel = document.getElementById('statusLabel');

    if (active.length === 0) {
      qosEl.textContent    = '0.0';
      statusEl.textContent = 'Down';
      this._applyStatusClass(statusEl, 'down');
      if (statusDot) statusDot.className = 'status-dot down';
      if (statusLabel) statusLabel.textContent = 'Network Down';
      return;
    }

    const avgLoad = active.reduce((sum, t) => sum + t.load, 0) / active.length;
    const qos     = 100 - avgLoad;

    qosEl.textContent = qos.toFixed(1);

    let statusText, statusClass, headerStatus;

    if (qos >= KiraConfig.QOS_GOOD) {
      statusText   = 'Good';
      statusClass  = 'good';
      headerStatus = 'System Optimal';
    } else if (qos >= KiraConfig.QOS_MODERATE) {
      statusText   = 'Moderate';
      statusClass  = 'moderate';
      headerStatus = 'Under Load';
    } else {
      statusText   = 'Poor';
      statusClass  = 'poor';
      headerStatus = 'Critical Load';
    }

    statusEl.textContent = statusText;
    this._applyStatusClass(statusEl, statusClass);
    if (statusDot)   statusDot.className   = `status-dot ${statusClass}`;
    if (statusLabel) statusLabel.textContent = headerStatus;
  },

  /**
   * Removes old status modifier classes and applies the new one.
   * @param {HTMLElement} el
   * @param {string} statusClass
   */
  _applyStatusClass(el, statusClass) {
    el.classList.remove('good', 'moderate', 'poor', 'down');
    el.classList.add(statusClass);
  },
};

/* ═══════════════════════════════════════════════════════════
   SIMULATION CONTROLS  (called directly by HTML onclick)
   ═══════════════════════════════════════════════════════════ */
const SimControls = {
  /**
   * Increases load on all active towers by a random spike amount.
   */
  simulateTraffic() {
    TowerService.getActive().forEach((tower) => {
      tower.load = clamp(
        tower.load + randInt(KiraConfig.TRAFFIC_MAX_SPIKE) + 1,
        0,
        100
      );
    });
    TowerService.render();
  },

  /**
   * Randomly takes one active tower offline.
   */
  failTower() {
    const active = TowerService.getActive();
    if (active.length === 0) return;

    const target = active[randInt(active.length)];
    target.status = 'offline';
    TowerService.render();
  },

  /**
   * Redistributes load from overloaded towers to underused ones.
   */
  optimizeNetwork() {
    const active     = TowerService.getActive();
    const overloaded = active.filter((t) => t.load >= KiraConfig.LOAD_HIGH_THRESHOLD);
    const underused  = active.filter((t) => t.load <  KiraConfig.LOAD_LOW_THRESHOLD);

    if (overloaded.length === 0 || underused.length === 0) {
      TowerService.render(); // still refresh QoS display
      return;
    }

    overloaded.forEach((o) => {
      const u     = underused[randInt(underused.length)];
      const shift = KiraConfig.OPTIMIZE_SHIFT;

      o.load = clamp(o.load - shift, 0, 100);
      u.load = clamp(u.load + shift, 0, 100);
    });

    TowerService.render();
  },
};

/* ═══════════════════════════════════════════════════════════
   GLOBAL BINDINGS  (referenced by HTML onchange / onclick)
   ═══════════════════════════════════════════════════════════ */
function switchCity()       { CityService.switch();               }
function simulateTraffic()  { SimControls.simulateTraffic();      }
function failTower()        { SimControls.failTower();            }
function optimizeNetwork()  { SimControls.optimizeNetwork();      }

/* ═══════════════════════════════════════════════════════════
   APP  – Bootstrap
   ═══════════════════════════════════════════════════════════ */
const App = {
  init() {
    CityService.initDropdown();
    TowerService.init();
  },
};

// Wait for DOM to be ready before initialising
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
