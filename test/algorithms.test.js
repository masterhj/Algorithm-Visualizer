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

test('sorting never touches an index outside the array', () => {
  for (const algo of catalog.sort) {
    const work = rand(60);
    for (const step of algo.run(work)) {
      for (const i of [step.a, step.b, step.i]) {
        if (i === undefined) continue;
        assert.ok(i >= 0 && i < work.length, `${algo.id} addressed index ${i}`);
      }
    }
  }
});

test('searching finds present values and reports absent ones', () => {
  for (const algo of catalog.search) {
    for (const n of [1, 2, 3, 9, 64, 101]) {
      for (let trial = 0; trial < 30; trial++) {
        const data = rand(n).sort(asc);
        const present = trial % 2 === 0;
        const target = present ? data[Math.floor(Math.random() * n)] : 999;
        const steps = drain(algo.run(data.slice(), target));
        const hit = steps.find(s => s.op === 'hit');
        const miss = steps.some(s => s.op === 'miss');

        if (present) {
          assert.ok(hit, `${algo.id} missed a value that was present`);
          assert.equal(data[hit.i], target, `${algo.id} pointed at the wrong slot`);
          assert.ok(!miss, `${algo.id} reported both a hit and a miss`);
        } else {
          assert.ok(miss && !hit, `${algo.id} claimed to find an absent value`);
        }
      }
    }
  }
});

