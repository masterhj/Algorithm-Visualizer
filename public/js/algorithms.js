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


  return {};
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Algo;
