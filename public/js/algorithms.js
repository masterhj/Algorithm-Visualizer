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


  return {};
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Algo;
