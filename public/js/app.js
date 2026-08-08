'use strict';

(function () {

  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const frame = () => new Promise(r => requestAnimationFrame(r));

  const el = {
    modes: $('modes'), deck: $('deck'), legend: $('legend'), readout: $('readout'),
    canvas: $('canvas'), plane: $('plane'), rack: $('rack'), grid: $('grid'),
    blurb: $('blurb'), flash: $('flash'),
    size: $('size'), speed: $('speed'), sizeOut: $('sizeOut'), speedOut: $('speedOut'),
    run: $('run'), runIcon: $('runIcon'), step: $('step'), shuffle: $('shuffle'), reset: $('reset')
  };

  // Milliseconds per step, indexed by the speed slider. Below one frame the
  // loop stops sleeping and batches steps instead.
  const STEP_MS = [320, 190, 115, 68, 40, 24, 14, 8, 4, 1.5];
  const FRAME_MS = 16;
  const GRID_GAP = 2;    // keep in step with .grid { gap }
  const RACK_GAP = 2;    // keep in step with --rack-gap

  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  // Read from the tokens rather than restated here, so motion stays in one place.
  const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  let TRAVEL_MS = 280, SPRING = 'ease-out';

  // Reads + writes an algorithm performs, per emitted operation.
  const ACCESS = { cmp: 2, swap: 4, write: 1, probe: 1 };

  const METRICS = {
    sort: [['cmp', 'Comparisons'], ['writes', 'Writes'], ['access', 'Accesses'],
           ['steps', 'Steps'], ['time', 'Elapsed'], ['cx', 'Time complexity']],
    search: [['target', 'Target'], ['probes', 'Probes'], ['access', 'Accesses'],
             ['steps', 'Steps'], ['time', 'Elapsed'], ['cx', 'Time complexity']],
    path: [['visited', 'Visited'], ['frontier', 'Frontier'], ['path', 'Path'],
           ['steps', 'Steps'], ['time', 'Elapsed'], ['cx', 'Time complexity']]
  };

  const LEGENDS = {
    sort: [['--state-idle', 'Unsorted'], ['--state-compare', 'Comparing'],
           ['--state-move', 'Writing'], ['--state-pivot', 'Pivot'], ['--state-done', 'Sorted']],
    search: [['--state-idle', 'In range'], ['--state-scan', 'Eliminated'],
             ['--state-compare', 'Probing'], ['--state-found', 'Found']],
    path: [['--state-wall', 'Wall'], ['--state-compare', 'Frontier'],
           ['--state-visit', 'Visited'], ['--state-found', 'Path'],
           ['--cool', 'Start'], ['--accent-deep', 'Goal']]
  };

  const state = {
    mode: 'sort',
    algo: Algo.catalog.sort[0],
    values: [], work: [],
    target: null,
    walls: null, start: null, goal: null,
    running: false, paused: false, token: 0
  };

  let bars = [];        // bars[position] -> the element currently shown there
  let cells = [];
  let lit = [];
  let pivot = null;
  let pitch = 0;        // bar width + gap, for FLIP offsets without a layout read
  let gen = null;       // survives across steps so the step control can advance it

  const tally = {};
  let clock = 0, frozen = 0, pausedAt = 0;

  const elapsed = () => (performance.now() - clock - frozen) / 1000;

  /* ------------------------------------------------------------------ chrome */

  function flash(text, kind) {
    el.flash.textContent = text;
    el.flash.className = 'flash is-up' + (kind ? ' is-' + kind : '');
    clearTimeout(flash.timer);
    flash.timer = setTimeout(() => { el.flash.className = 'flash'; }, 2600);
  }

  function buildDeck() {
    el.deck.innerHTML = '';
    for (const algo of Algo.catalog[state.mode]) {
      const item = document.createElement('button');
      item.className = 'seg-item' + (algo.id === state.algo.id ? ' is-on' : '');
      item.setAttribute('role', 'tab');
      item.setAttribute('aria-selected', String(algo.id === state.algo.id));
      item.innerHTML = '<span class="nm"></span><span class="cx"></span>';
      item.querySelector('.nm').textContent = algo.name;
      item.querySelector('.cx').textContent = algo.time;
      item.addEventListener('click', () => choose(algo));
      el.deck.appendChild(item);
    }
  }

  function buildLegend() {
    el.legend.innerHTML = '';
    for (const [varName, text] of LEGENDS[state.mode]) {
      const row = document.createElement('li');
      row.innerHTML = '<span class="sw"></span><span></span>';
      row.querySelector('.sw').style.setProperty('--c', `var(${varName})`);
      row.lastElementChild.textContent = text;
      el.legend.appendChild(row);
    }
  }

  function buildReadout() {
    el.readout.innerHTML = '';
    for (const [key, label] of METRICS[state.mode]) {
      const cell = document.createElement('div');
      cell.className = 'metric';
      cell.dataset.key = key;
      cell.innerHTML = '<span class="metric-k"></span><span class="metric-v">—</span>';
      cell.querySelector('.metric-k').textContent = label;
      el.readout.appendChild(cell);
    }
  }

  function paintReadout() {
    if (state.running) tally.time = elapsed().toFixed(2) + 's';
    for (const cell of el.readout.children) {
      const value = tally[cell.dataset.key];
      const blank = value === undefined || value === null || value === '';
      const out = cell.lastElementChild;
      out.textContent = blank ? '—' : value;
      out.className = 'metric-v' + (blank ? ' is-idle' : '');
    }
  }

  function syncControls() {
    const busy = state.running && !state.paused;
    el.runIcon.setAttribute('href', busy ? '#i-pause' : '#i-play');
    el.run.setAttribute('aria-label', busy ? 'Pause' : 'Run');
    el.run.classList.toggle('is-running', busy);
    el.step.disabled = busy;
    el.shuffle.disabled = state.running;
    el.size.disabled = state.running || state.mode === 'path';
  }

  function setPaused(on) {
    if (on === state.paused || !state.running) return;
    state.paused = on;
    if (on) pausedAt = performance.now();
    else frozen += performance.now() - pausedAt;
    syncControls();
  }


})();
