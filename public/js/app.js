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

  /* -------------------------------------------------------------- grid scene */

  function drawGrid() {
    const room = el.plane.clientWidth;
    const headroom = el.plane.clientHeight;

    let cols = Math.max(15, Math.min(61, Math.floor(room / 24)));
    if (cols % 2 === 0) cols--;

    // Cells are square and sized by the columns, so rows must come from the
    // height that is left — otherwise the end rows land outside the clipped
    // canvas where they cannot be seen or clicked.
    const cell = (room - (cols - 1) * GRID_GAP) / cols;
    let rows = Math.max(9, Math.floor((headroom + GRID_GAP) / (cell + GRID_GAP)));
    if (rows % 2 === 0) rows--;

    let mid = rows >> 1;
    if (mid % 2 === 0) mid++;
    state.start = [mid, 1];
    state.goal = [mid, cols - 2];
    state.walls = Array.from({ length: rows }, () => new Array(cols).fill(false));

    el.grid.innerHTML = '';
    el.grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    cells = [];

    for (let r = 0; r < rows; r++) {
      cells[r] = [];
      for (let c = 0; c < cols; c++) {
        const node = document.createElement('div');
        node.className = 'cell';
        el.grid.appendChild(node);
        cells[r][c] = node;
      }
    }
    paintGrid();
  }

  function paintGrid() {
    const [sr, sc] = state.start, [gr, gc] = state.goal;
    for (let r = 0; r < cells.length; r++) {
      for (let c = 0; c < cells[r].length; c++) {
        let cls = 'cell';
        if (r === sr && c === sc) cls += ' is-start';
        else if (r === gr && c === gc) cls += ' is-goal';
        else if (state.walls[r][c]) cls += ' is-wall';
        cells[r][c].className = cls;
      }
    }
  }

  function clearTrace() {
    for (const row of cells) {
      for (const node of row) node.classList.remove('is-frontier', 'is-visited', 'is-path');
    }
  }

  // Click-drag to draw or erase walls; the first cell decides which.
  function wallPainting() {
    let painting = false;
    let adding = true;

    const at = e => {
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      if (!hit || !hit.classList.contains('cell')) return null;
      for (let r = 0; r < cells.length; r++) {
        const c = cells[r].indexOf(hit);
        if (c >= 0) return [r, c];
      }
      return null;
    };

    const paint = pos => {
      if (!pos) return;
      const [r, c] = pos;
      const isEnd = (r === state.start[0] && c === state.start[1]) ||
                    (r === state.goal[0] && c === state.goal[1]);
      if (isEnd || state.walls[r][c] === adding) return;
      state.walls[r][c] = adding;
      cells[r][c].classList.toggle('is-wall', adding);
    };

    el.grid.addEventListener('pointerdown', e => {
      if (state.running) return;
      const pos = at(e);
      if (!pos) return;
      adding = !state.walls[pos[0]][pos[1]];
      painting = true;
      paint(pos);
      // Capture keeps the drag alive past the grid edge; it is a convenience,
      // so never let it swallow the stroke.
      try { el.grid.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });

    el.grid.addEventListener('pointermove', e => { if (painting) paint(at(e)); });
    const stop = () => { painting = false; };
    el.grid.addEventListener('pointerup', stop);
    el.grid.addEventListener('pointercancel', stop);
  }

  /* -------------------------------------------------------------- step apply */

  function apply(step, travel) {
    tally.steps++;
    if (ACCESS[step.op]) tally.access += ACCESS[step.op];

    switch (step.op) {
      case 'cmp':
        douse();
        light(step.a, 'is-compare');
        light(step.b, 'is-compare');
        tally.cmp++;
        break;

      case 'swap':
        douse();
        swapBars(step.a, step.b, travel);
        light(step.a, 'is-move');
        light(step.b, 'is-move');
        tally.writes += 2;
        break;

      case 'write':
        douse();
        height(step.i);
        light(step.i, 'is-move');
        tally.writes++;
        break;

      case 'pivot':
        if (pivot) pivot.classList.remove('is-pivot');
        pivot = bars[step.i];
        if (pivot) pivot.classList.add('is-pivot');
        break;

      case 'lock':
        if (pivot) { pivot.classList.remove('is-pivot'); pivot = null; }
        if (bars[step.i]) bars[step.i].classList.add('is-done');
        break;

      case 'settle':
        douse();
        if (pivot) { pivot.classList.remove('is-pivot'); pivot = null; }
        for (const bar of bars) bar.classList.add('is-done');
        break;

      case 'probe':
        douse();
        light(step.i, 'is-compare');
        tally.probes++;
        break;

      case 'window':
        windowTo(step.lo, step.hi);
        break;

      case 'hit':
        douse();
        windowTo(0, bars.length - 1);
        if (bars[step.i]) bars[step.i].classList.add('is-found');
        tally.found = step.i;
        break;

      case 'miss':
        douse();
        windowTo(0, bars.length - 1);
        tally.found = null;
        break;

      case 'edge':
        cells[step.r][step.c].classList.add('is-frontier');
        tally.frontier++;
        break;

      case 'seen':
        cells[step.r][step.c].classList.remove('is-frontier');
        cells[step.r][step.c].classList.add('is-visited');
        tally.frontier = Math.max(0, tally.frontier - 1);
        tally.visited++;
        break;

      case 'trail':
        step.cells.forEach(([r, c], i) => {
          const node = cells[r][c];
          node.classList.remove('is-visited', 'is-frontier');
          node.classList.add('is-path');
          if (!calm.matches) {
            node.animate([{ opacity: 0.35 }, { opacity: 1 }],
              { duration: 200, delay: i * 12, easing: 'cubic-bezier(.2,0,0,1)', fill: 'backwards' });
          }
        });
        tally.path = step.cells.length;
        break;
    }
  }

  /* ---------------------------------------------------------------- run loop */

  function resetTally() {
    for (const key of Object.keys(tally)) delete tally[key];
    Object.assign(tally, { steps: 0, access: 0, time: '0.00s', cx: state.algo.time });
    if (state.mode === 'sort') Object.assign(tally, { cmp: 0, writes: 0 });
    else if (state.mode === 'search') Object.assign(tally, { probes: 0, target: state.target });
    else Object.assign(tally, { visited: 0, frontier: 0, path: null });
  }

  // Built once and kept, so the step control can advance the same run.
  function ensureRun() {
    if (gen) return gen;

    if (state.mode === 'path') {
      clearTrace();
      resetTally();
      gen = state.algo.run(state.walls, state.start, state.goal);
    } else {
      state.work = state.values.slice();
      for (const bar of bars) bar.classList.remove('is-done', 'is-found', 'is-scan');
      douse();
      if (state.mode === 'search') {
        if (state.target === null) state.target = state.values[Math.floor(Math.random() * state.values.length)];
        resetTally();
        gen = state.algo.run(state.work, state.target);
      } else {
        resetTally();
        gen = state.algo.run(state.work);
      }
    }

    clock = performance.now();
    frozen = 0;
    pausedAt = 0;
    return gen;
  }

  async function pump(run, mine) {
    for (;;) {
      if (mine !== state.token) return false;
      if (state.paused) { await sleep(70); continue; }

      const ms = STEP_MS[+el.speed.value - 1];
      const burst = ms < FRAME_MS ? Math.max(1, Math.round(FRAME_MS / ms)) : 1;
      // Elements only travel when there is a frame to see it in.
      const travel = burst === 1 && !calm.matches && bars.length <= 90;

      for (let n = 0; n < burst; n++) {
        const next = run.next();
        if (next.done) return true;
        apply(next.value, travel);
        if (mine !== state.token) return false;
      }
      paintReadout();
      await (burst > 1 ? frame() : sleep(ms));
    }
  }

  async function start() {
    if (state.running) { setPaused(!state.paused); return; }

    const mine = ++state.token;
    const run = ensureRun();

    state.running = true;
    state.paused = false;
    syncControls();
    paintReadout();

    const completed = await pump(run, mine);

    if (mine !== state.token) return;    // reset or a newer run took over
    state.running = false;
    state.paused = false;
    tally.time = elapsed().toFixed(2) + 's';
    syncControls();
    paintReadout();
    if (completed) finish();
  }

  function stepOnce() {
    if (state.running) return;
    const run = ensureRun();
    const next = run.next();
    if (next.done) { finish(); return; }
    apply(next.value, !calm.matches && bars.length <= 90);
    tally.time = elapsed().toFixed(2) + 's';
    paintReadout();
  }

  function finish() {
    gen = null;
    if (state.mode !== 'path') state.values = state.work.slice();
    announce();
    record();
  }

  function announce() {
    if (state.mode === 'sort') {
      flash(`${state.algo.name} · ${tally.cmp} comparisons · ${tally.time}`, 'good');
    } else if (state.mode === 'search') {
      const hit = tally.found !== null && tally.found !== undefined;
      flash(hit ? `Found ${state.target} at index ${tally.found} · ${tally.probes} probes`
                : `${state.target} is not in the array`, hit ? 'good' : 'bad');
    } else {
      flash(tally.path ? `Route found · ${tally.path} cells · ${tally.visited} explored`
                       : 'No route to the goal', tally.path ? 'good' : 'bad');
    }
  }

  function record() {
    fetch('api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: state.mode,
        algorithm: state.algo.id,
        size: state.mode === 'path' ? cells.length * cells[0].length : state.values.length,
        comparisons: tally.cmp || tally.probes || tally.visited || 0,
        writes: tally.writes || tally.path || 0,
        elapsed: parseFloat(tally.time) || 0
      })
    }).catch(() => { /* history is a nicety; never let it break the page */ });
  }

  function halt() {
    state.token++;
    state.running = false;
    state.paused = false;
    gen = null;
  }

  /* ----------------------------------------------------------------- rebuild */

  const values = n => Array.from({ length: n }, () => 4 + Math.floor(Math.random() * 97));

  function shuffle() {
    halt();
    if (state.mode === 'path') {
      state.walls = Algo.maze(cells.length, cells[0].length, [state.start, state.goal]);
      clearTrace();
      paintGrid();
    } else {
      state.values = values(+el.size.value);
      if (state.mode === 'search') state.values.sort((a, b) => a - b);
      state.target = null;
      drawBars();
    }
    resetTally();
    syncControls();
    paintReadout();
  }

  function clear() {
    halt();
    if (state.mode !== 'path') { shuffle(); return; }
    state.walls = state.walls.map(row => row.fill(false));
    clearTrace();
    paintGrid();
    resetTally();
    syncControls();
    paintReadout();
  }

  function pickTarget(i) {
    if (state.running) return;
    halt();
    state.target = state.values[i];
    for (const bar of bars) bar.classList.remove('is-found', 'is-scan');
    resetTally();
    paintReadout();
  }

  function choose(algo) {
    halt();
    state.algo = algo;
    for (const item of el.deck.children) {
      const on = item.querySelector('.nm').textContent === algo.name;
      item.classList.toggle('is-on', on);
      item.setAttribute('aria-selected', String(on));
    }
    el.blurb.textContent = algo.blurb;
    if (state.mode === 'path') clearTrace();
    else { for (const bar of bars) bar.classList.remove('is-done', 'is-found', 'is-scan'); douse(); }
    resetTally();
    syncControls();
    paintReadout();
  }

  function setMode(mode) {
    if (mode === state.mode) return;
    halt();
    state.mode = mode;
    state.algo = Algo.catalog[mode][0];
    state.target = null;

    for (const tab of el.modes.children) {
      const on = tab.dataset.mode === mode;
      tab.classList.toggle('is-on', on);
      tab.setAttribute('aria-selected', String(on));
    }

    el.grid.hidden = mode !== 'path';
    el.rack.hidden = mode === 'path';

    buildDeck();
    buildLegend();
    buildReadout();
    el.blurb.textContent = state.algo.blurb;

    if (mode === 'path') {
      drawGrid();
      state.walls = Algo.maze(cells.length, cells[0].length, [state.start, state.goal]);
      paintGrid();
    } else {
      state.values = values(+el.size.value);
      if (mode === 'search') state.values.sort((a, b) => a - b);
      drawBars();
    }
    resetTally();
    syncControls();
    paintReadout();
  }

  /* ------------------------------------------------------------- plane swing */

  let swing = 0, want = 0, spinning = 0;

  function spin() {
    if (spinning) return;
    const tick = () => {
      swing += (want - swing) * 0.12;
      el.plane.style.setProperty('--plane-swing', swing.toFixed(2) + 'deg');
      spinning = Math.abs(want - swing) > 0.03 ? requestAnimationFrame(tick) : 0;
    };
    spinning = requestAnimationFrame(tick);
  }

  el.canvas.addEventListener('pointermove', e => {
    if (calm.matches) return;
    const box = el.canvas.getBoundingClientRect();
    want = ((e.clientX - box.left) / box.width - 0.5) * 12;
    spin();
  });

  el.canvas.addEventListener('pointerleave', () => { want = 0; spin(); });

  /* -------------------------------------------------------------------- wire */

  el.modes.addEventListener('click', e => {
    const tab = e.target.closest('button');
    if (tab) setMode(tab.dataset.mode);
  });

  el.size.addEventListener('input', () => {
    el.sizeOut.textContent = el.size.value;
    if (!state.running) shuffle();
  });

  el.speed.addEventListener('input', () => { el.speedOut.textContent = el.speed.value; });

  el.run.addEventListener('click', start);
  el.step.addEventListener('click', stepOnce);
  el.shuffle.addEventListener('click', shuffle);
  el.reset.addEventListener('click', clear);

  // A hidden tab gets no animation frames, so a run would sit there looking
  // stuck. Pause it deliberately and let the viewer resume.
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPaused(true); });

  document.addEventListener('keydown', e => {
    // The target is not always an Element (it can be the document itself), so
    // feature-test before asking it anything.
    const node = e.target;
    if (node instanceof Element && node.closest('input, select, textarea')) return;
    const key = e.key.toLowerCase();
    if (key === ' ') { e.preventDefault(); start(); }
    else if (key === 'arrowright') { e.preventDefault(); stepOnce(); }
    else if (key === 'r') clear();
    else if (key === 's') shuffle();
  });

  let resizing;
  window.addEventListener('resize', () => {
    clearTimeout(resizing);
    resizing = setTimeout(() => {
      if (state.running) return;
      if (state.mode === 'path') {
        drawGrid();
        state.walls = Algo.maze(cells.length, cells[0].length, [state.start, state.goal]);
        paintGrid();
      } else {
        drawBars();
      }
    }, 220);
  });


})();
