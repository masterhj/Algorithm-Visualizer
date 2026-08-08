'use strict';

/*
 * Every algorithm here is a generator: it mutates the data it was handed and
 * yields a note about what just changed. Nothing in this file touches the DOM,
 * which is what makes stepping, pausing and scrubbing possible at all.
 *
 *   sorting     cmp(a,b)  swap(a,b)  write(i,v)  pivot(i)  lock(i)  settle
 *   searching   probe(i)  window(lo,hi)  hit(i)  miss
 *   grid        edge(r,c)  seen(r,c)  trail(cells)  miss
 */

const Algo = (function () {

  const swap = (a, i, j) => { const t = a[i]; a[i] = a[j]; a[j] = t; };

  /* ---------------------------------------------------------------- sorting */

  function* bubble(a) {
    for (let end = a.length - 1; end > 0; end--) {
      let moved = false;
      for (let i = 0; i < end; i++) {
        yield { op: 'cmp', a: i, b: i + 1 };
        if (a[i] > a[i + 1]) {
          swap(a, i, i + 1);
          yield { op: 'swap', a: i, b: i + 1 };
          moved = true;
        }
      }
      yield { op: 'lock', i: end };
      if (!moved) break;
    }
    yield { op: 'settle' };
  }

  function* insertion(a) {
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0) {
        yield { op: 'cmp', a: j, b: i };
        if (a[j] <= key) break;
        a[j + 1] = a[j];
        yield { op: 'write', i: j + 1, v: a[j] };
        j--;
      }
      a[j + 1] = key;
      yield { op: 'write', i: j + 1, v: key };
    }
    yield { op: 'settle' };
  }

  function* selection(a) {
    for (let i = 0; i < a.length - 1; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++) {
        yield { op: 'cmp', a: min, b: j };
        if (a[j] < a[min]) min = j;
      }
      if (min !== i) {
        swap(a, i, min);
        yield { op: 'swap', a: i, b: min };
      }
      yield { op: 'lock', i };
    }
    yield { op: 'settle' };
  }

  function* quick(a) {
    yield* qsort(a, 0, a.length - 1);
    yield { op: 'settle' };
  }

  function* qsort(a, lo, hi) {
    if (lo > hi) return;
    if (lo === hi) { yield { op: 'lock', i: lo }; return; }
    const p = yield* partition(a, lo, hi);
    yield { op: 'lock', i: p };
    yield* qsort(a, lo, p - 1);
    yield* qsort(a, p + 1, hi);
  }

  function* partition(a, lo, hi) {
    const pivot = a[hi];
    yield { op: 'pivot', i: hi };
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      yield { op: 'cmp', a: j, b: hi };
      if (a[j] < pivot) {
        i++;
        if (i !== j) {
          swap(a, i, j);
          yield { op: 'swap', a: i, b: j };
        }
      }
    }
    if (i + 1 !== hi) {
      swap(a, i + 1, hi);
      yield { op: 'swap', a: i + 1, b: hi };
    }
    return i + 1;
  }

  function* merge(a) {
    yield* msort(a, 0, a.length - 1);
    yield { op: 'settle' };
  }

  function* msort(a, lo, hi) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    yield* msort(a, lo, mid);
    yield* msort(a, mid + 1, hi);

    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;

    while (i < left.length && j < right.length) {
      yield { op: 'cmp', a: lo + i, b: mid + 1 + j };
      a[k] = left[i] <= right[j] ? left[i++] : right[j++];
      yield { op: 'write', i: k, v: a[k] };
      k++;
    }
    while (i < left.length) { a[k] = left[i++]; yield { op: 'write', i: k, v: a[k] }; k++; }
    while (j < right.length) { a[k] = right[j++]; yield { op: 'write', i: k, v: a[k] }; k++; }
  }

  function* heap(a) {
    const n = a.length;
    for (let i = (n >> 1) - 1; i >= 0; i--) yield* sift(a, n, i);
    for (let end = n - 1; end > 0; end--) {
      swap(a, 0, end);
      yield { op: 'swap', a: 0, b: end };
      yield { op: 'lock', i: end };
      yield* sift(a, end, 0);
    }
    yield { op: 'settle' };
  }

  function* sift(a, n, i) {
    for (;;) {
      let big = i;
      const l = 2 * i + 1, r = l + 1;
      if (l < n) { yield { op: 'cmp', a: l, b: big }; if (a[l] > a[big]) big = l; }
      if (r < n) { yield { op: 'cmp', a: r, b: big }; if (a[r] > a[big]) big = r; }
      if (big === i) return;
      swap(a, i, big);
      yield { op: 'swap', a: i, b: big };
      i = big;
    }
  }

  /* -------------------------------------------------------------- searching */
  /* All four assume `a` is sorted ascending — the caller guarantees it. */

  function* linear(a, t) {
    for (let i = 0; i < a.length; i++) {
      yield { op: 'probe', i };
      if (a[i] === t) return yield { op: 'hit', i };
    }
    yield { op: 'miss' };
  }

  function* binary(a, t) {
    let lo = 0, hi = a.length - 1;
    while (lo <= hi) {
      yield { op: 'window', lo, hi };
      const mid = (lo + hi) >> 1;
      yield { op: 'probe', i: mid };
      if (a[mid] === t) return yield { op: 'hit', i: mid };
      if (a[mid] < t) lo = mid + 1; else hi = mid - 1;
    }
    yield { op: 'miss' };
  }

  function* jump(a, t) {
    const n = a.length;
    const stride = Math.max(1, Math.floor(Math.sqrt(n)));
    let lo = 0, hi = Math.min(stride, n) - 1;

    while (hi < n - 1 && a[hi] < t) {
      yield { op: 'probe', i: hi };
      lo = hi + 1;
      hi = Math.min(hi + stride, n - 1);
    }
    yield { op: 'window', lo, hi };
    for (let i = lo; i <= hi; i++) {
      yield { op: 'probe', i };
      if (a[i] === t) return yield { op: 'hit', i };
      if (a[i] > t) break;
    }
    yield { op: 'miss' };
  }

  function* interpolation(a, t) {
    let lo = 0, hi = a.length - 1;
    while (lo <= hi && t >= a[lo] && t <= a[hi]) {
      yield { op: 'window', lo, hi };
      // Flat span means the guess would divide by zero; fall back to the edge.
      const span = a[hi] - a[lo];
      const pos = span === 0 ? lo : lo + Math.floor((t - a[lo]) * (hi - lo) / span);
      yield { op: 'probe', i: pos };
      if (a[pos] === t) return yield { op: 'hit', i: pos };
      if (a[pos] < t) lo = pos + 1; else hi = pos - 1;
    }
    yield { op: 'miss' };
  }

  /* ------------------------------------------------------------ pathfinding */

  class Heap {
    constructor() { this.a = []; }
    get size() { return this.a.length; }
    push(node) {
      const a = this.a;
      a.push(node);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (a[p].f <= a[i].f) break;
        [a[p], a[i]] = [a[i], a[p]];
        i = p;
      }
    }
    pop() {
      const a = this.a, top = a[0], last = a.pop();
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < a.length && a[l].f < a[m].f) m = l;
          if (r < a.length && a[r].f < a[m].f) m = r;
          if (m === i) break;
          [a[m], a[i]] = [a[i], a[m]];
          i = m;
        }
      }
      return top;
    }
  }

  function around(r, c, rows, cols) {
    const out = [];
    if (r > 0) out.push([r - 1, c]);
    if (r < rows - 1) out.push([r + 1, c]);
    if (c > 0) out.push([r, c - 1]);
    if (c < cols - 1) out.push([r, c + 1]);
    return out;
  }

  function trace(prev, goal, cols) {
    const cells = [];
    let k = goal[0] * cols + goal[1];
    while (k !== undefined) {
      cells.unshift([Math.floor(k / cols), k % cols]);
      k = prev.get(k);
    }
    return cells;
  }

  function* bfs(walls, start, goal) {
    const rows = walls.length, cols = walls[0].length;
    const prev = new Map();
    const seen = new Set([start[0] * cols + start[1]]);
    const queue = [start];
    yield { op: 'edge', r: start[0], c: start[1] };

    while (queue.length) {
      const [r, c] = queue.shift();
      yield { op: 'seen', r, c };
      if (r === goal[0] && c === goal[1]) return yield { op: 'trail', cells: trace(prev, goal, cols) };

      for (const [nr, nc] of around(r, c, rows, cols)) {
        const k = nr * cols + nc;
        if (walls[nr][nc] || seen.has(k)) continue;
        seen.add(k);
        prev.set(k, r * cols + c);
        queue.push([nr, nc]);
        yield { op: 'edge', r: nr, c: nc };
      }
    }
    yield { op: 'miss' };
  }

  function* dfs(walls, start, goal) {
    const rows = walls.length, cols = walls[0].length;
    const prev = new Map();
    const seen = new Set([start[0] * cols + start[1]]);
    const stack = [start];
    yield { op: 'edge', r: start[0], c: start[1] };

    while (stack.length) {
      const [r, c] = stack.pop();
      yield { op: 'seen', r, c };
      if (r === goal[0] && c === goal[1]) return yield { op: 'trail', cells: trace(prev, goal, cols) };

      for (const [nr, nc] of around(r, c, rows, cols)) {
        const k = nr * cols + nc;
        if (walls[nr][nc] || seen.has(k)) continue;
        // Claim the cell the moment it is discovered, so each one keeps exactly
        // one parent and the reconstructed trail is always a real walk.
        seen.add(k);
        prev.set(k, r * cols + c);
        stack.push([nr, nc]);
        yield { op: 'edge', r: nr, c: nc };
      }
    }
    yield { op: 'miss' };
  }

  function* weighted(walls, start, goal, heuristic) {
    const rows = walls.length, cols = walls[0].length;
    const dist = new Map([[start[0] * cols + start[1], 0]]);
    const prev = new Map();
    const settled = new Set();
    const open = new Heap();
    open.push({ r: start[0], c: start[1], f: heuristic(start[0], start[1]) });
    yield { op: 'edge', r: start[0], c: start[1] };

    while (open.size) {
      const cur = open.pop();
      const k = cur.r * cols + cur.c;
      if (settled.has(k)) continue;           // stale entry from an earlier, worse path
      settled.add(k);
      yield { op: 'seen', r: cur.r, c: cur.c };
      if (cur.r === goal[0] && cur.c === goal[1]) return yield { op: 'trail', cells: trace(prev, goal, cols) };

      for (const [nr, nc] of around(cur.r, cur.c, rows, cols)) {
        const nk = nr * cols + nc;
        if (walls[nr][nc] || settled.has(nk)) continue;
        const step = dist.get(k) + 1;
        if (step >= (dist.has(nk) ? dist.get(nk) : Infinity)) continue;
        dist.set(nk, step);
        prev.set(nk, k);
        open.push({ r: nr, c: nc, f: step + heuristic(nr, nc) });
        yield { op: 'edge', r: nr, c: nc };
      }
    }
    yield { op: 'miss' };
  }

  const dijkstra = (walls, start, goal) => weighted(walls, start, goal, () => 0);

  const astar = (walls, start, goal) =>
    weighted(walls, start, goal, (r, c) => Math.abs(r - goal[0]) + Math.abs(c - goal[1]));

  /* Recursive division: split the region with a wall, punch one gap in it, then
     repeat on both sides.
     Walls only ever land on even rows/columns and gaps only on odd ones. That
     parity is what keeps the maze connected — without it a later perpendicular
     wall can run straight through an earlier gap and seal a region off. */
  function maze(rows, cols, keepClear) {
    const walls = Array.from({ length: rows }, () => new Array(cols).fill(false));
    carve(0, rows - 1, 0, cols - 1);

    for (const [r, c] of keepClear) {
      walls[r][c] = false;
      for (const [nr, nc] of around(r, c, rows, cols)) walls[nr][nc] = false;
    }
    return walls;

    // Lowest value in [lo, hi] matching `parity`, chosen at random; -1 if none.
    function slot(lo, hi, parity) {
      const first = lo % 2 === parity ? lo : lo + 1;
      if (first > hi) return -1;
      return first + 2 * Math.floor(Math.random() * (Math.floor((hi - first) / 2) + 1));
    }

    function carve(r1, r2, c1, c2) {
      const h = r2 - r1 + 1, w = c2 - c1 + 1;
      if (h < 3 || w < 3) return;

      if (h > w || (h === w && Math.random() < 0.5)) {
        const row = slot(r1 + 1, r2 - 1, 0);
        const gap = slot(c1, c2, 1);
        if (row < 0 || gap < 0) return;
        for (let c = c1; c <= c2; c++) if (c !== gap) walls[row][c] = true;
        carve(r1, row - 1, c1, c2);
        carve(row + 1, r2, c1, c2);
      } else {
        const col = slot(c1 + 1, c2 - 1, 0);
        const gap = slot(r1, r2, 1);
        if (col < 0 || gap < 0) return;
        for (let r = r1; r <= r2; r++) if (r !== gap) walls[r][col] = true;
        carve(r1, r2, c1, col - 1);
        carve(r1, r2, col + 1, c2);
      }
    }
  }

  /* --------------------------------------------------------------- catalogue */

  const catalog = {
    sort: [
      { id: 'bubble', name: 'Bubble Sort', run: bubble, time: 'O(n²)', space: 'O(1)',
        blurb: 'Walks the list trading neighbours that sit in the wrong order. Cheap to write, painful to watch — a full pass only guarantees one more value lands home.' },
      { id: 'insertion', name: 'Insertion Sort', run: insertion, time: 'O(n²)', space: 'O(1)',
        blurb: 'Grows a sorted region on the left, sliding each new value backwards until it fits. Genuinely quick on data that is already nearly in order.' },
      { id: 'selection', name: 'Selection Sort', run: selection, time: 'O(n²)', space: 'O(1)',
        blurb: 'Hunts down the smallest value left and drops it into place. Always makes n²/2 comparisons, but never more than n swaps — useful when writes are expensive.' },
      { id: 'quick', name: 'Quick Sort', run: quick, time: 'O(n log n)', space: 'O(log n)',
        blurb: 'Picks a pivot, herds smaller values left and larger right, then recurses on both halves. Fastest in practice; collapses to n² when the pivots keep landing badly.' },
      { id: 'merge', name: 'Merge Sort', run: merge, time: 'O(n log n)', space: 'O(n)',
        blurb: 'Splits all the way down to single elements, then stitches sorted runs back together. Dependably n log n, paid for with a scratch buffer.' },
      { id: 'heap', name: 'Heap Sort', run: heap, time: 'O(n log n)', space: 'O(1)',
        blurb: 'Rearranges the array into a max-heap, then repeatedly swaps the root to the back and re-sifts. n log n with no extra memory at all.' }
    ],
    search: [
      { id: 'linear', name: 'Linear Search', run: linear, time: 'O(n)', space: 'O(1)',
        blurb: 'Checks every slot from the left. Makes no assumptions about the data and asks nothing of it — it is simply slow.' },
      { id: 'binary', name: 'Binary Search', run: binary, time: 'O(log n)', space: 'O(1)',
        blurb: 'Halves the live window with every probe. Needs sorted input, and finds anything in a hundred values inside seven looks.' },
      { id: 'jump', name: 'Jump Search', run: jump, time: 'O(√n)', space: 'O(1)',
        blurb: 'Strides ahead in √n blocks until it overshoots the target, then scans back through that single block.' },
      { id: 'interpolation', name: 'Interpolation Search', run: interpolation, time: 'O(log log n)', space: 'O(1)',
        blurb: 'Guesses where the value ought to sit based on how far it falls between the two ends. Near instant on evenly spread data, no better than linear on clustered data.' }
    ],
    path: [
      { id: 'bfs', name: 'Breadth-First', run: bfs, time: 'O(V + E)', space: 'O(V)',
        blurb: 'Expands in even rings from the start, so the first moment it touches the goal it is already holding the shortest route.' },
      { id: 'dfs', name: 'Depth-First', run: dfs, time: 'O(V + E)', space: 'O(V)',
        blurb: 'Commits hard to one direction until it hits a dead end, then backs up and tries again. Finds a path; rarely finds a good one.' },
      { id: 'dijkstra', name: "Dijkstra's", run: dijkstra, time: 'O(E log V)', space: 'O(V)',
        blurb: 'Always expands whichever cell is currently closest to the start. On an even grid it traces the same rings as BFS — the priority queue is what makes it survive weights.' },
      { id: 'astar', name: 'A* Search', run: astar, time: 'O(E log V)', space: 'O(V)',
        blurb: 'Dijkstra handed a hint: cells are ranked by distance travelled plus the straight-line guess still to go, so it aims at the goal instead of flooding towards it.' }
    ]
  };

  return { catalog, maze };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Algo;
