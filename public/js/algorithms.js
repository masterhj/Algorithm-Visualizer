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


  return {};
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Algo;
