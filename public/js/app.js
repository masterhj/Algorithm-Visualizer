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

  /* --------------------------------------------------------------- bar scene */

  function drawBars() {
    el.rack.innerHTML = '';
    bars = [];
    const n = state.values.length;

    for (let i = 0; i < n; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = state.values[i] + '%';
      const tag = document.createElement('span');
      tag.className = 'bar-tag';
      tag.textContent = state.values[i];
      bar.appendChild(tag);
      if (state.mode === 'search') bar.addEventListener('click', () => pickTarget(i));
      el.rack.appendChild(bar);
      bars.push(bar);

      if (!calm.matches) {
        bar.animate(
          [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
          { duration: 220, delay: i * parseFloat(token('--stagger') || 14), easing: 'cubic-bezier(.2,0,0,1)', fill: 'backwards' }
        );
      }
    }

    el.rack.classList.toggle('is-sparse', n <= 32);
    el.rack.classList.toggle('is-pickable', state.mode === 'search');

    const gap = n > 90 ? 1 : RACK_GAP;
    el.rack.style.setProperty('--rack-gap', gap + 'px');

    const width = (el.rack.clientWidth - gap * (n - 1)) / n;
    pitch = width + gap;
    // Extrusion tracks bar width, or a dense array reads as a solid slab.
    el.rack.style.setProperty('--extrude', Math.max(2, Math.min(12, width * 0.42)).toFixed(1) + 'px');
  }

  function height(i) {
    bars[i].style.height = state.work[i] + '%';
    const tag = bars[i].firstChild;
    if (tag) tag.textContent = state.work[i];
  }

  // FLIP: the two elements exchange places in the DOM, then are inverted by the
  // distance they just jumped and released, so they physically travel. Offsets
  // come from the known pitch rather than getBoundingClientRect, which keeps a
  // swap off the layout path entirely.
  function swapBars(i, j, travel) {
    const a = bars[i], b = bars[j];
    const marker = document.createComment('');
    a.replaceWith(marker);
    b.replaceWith(a);
    marker.replaceWith(b);
    bars[i] = b;
    bars[j] = a;

    if (!travel) return;
    const dx = (j - i) * pitch;
    const opts = { duration: TRAVEL_MS, easing: SPRING, composite: 'add' };
    a.animate([{ transform: `translateX(${-dx}px)` }, { transform: 'translateX(0px)' }], opts);
    b.animate([{ transform: `translateX(${dx}px)` }, { transform: 'translateX(0px)' }], opts);
  }

  function douse() {
    for (const bar of lit) bar.classList.remove('is-compare', 'is-move');
    lit = [];
  }

  function light(i, cls) {
    const bar = bars[i];
    if (!bar) return;
    bar.classList.add(cls);
    lit.push(bar);
  }

  function windowTo(lo, hi) {
    for (let i = 0; i < bars.length; i++) bars[i].classList.toggle('is-scan', i < lo || i > hi);
  }


})();
