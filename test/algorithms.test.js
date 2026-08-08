'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { catalog, maze } = require('../public/js/algorithms.js');

const drain = (gen, cap = 5e5) => {
  const seen = [];
  for (const step of gen) {
    if (seen.length > cap) throw new Error('generator did not terminate');
    seen.push(step);
  }
  return seen;
};

const rand = n => Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 100));
const asc = (a, b) => a - b;

test('sorting leaves the array ordered', () => {
  for (const algo of catalog.sort) {
    for (const n of [0, 1, 2, 3, 7, 40, 150]) {
      for (let trial = 0; trial < 12; trial++) {
        const input = rand(n);
        const work = input.slice();
        drain(algo.run(work));
        assert.deepEqual(work, input.slice().sort(asc), `${algo.id} on ${n} values`);
      }
    }
    // Shapes that trip up naive pivots and early-exit guards.
    for (const input of [[1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [7, 7, 7, 7], [2, 1]]) {
      const work = input.slice();
      drain(algo.run(work));
      assert.deepEqual(work, input.slice().sort(asc), `${algo.id} on ${input}`);
    }
  }
});

