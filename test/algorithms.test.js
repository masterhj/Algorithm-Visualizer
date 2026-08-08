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

test('generated mazes stay fully connected', () => {
  for (const [rows, cols] of [[5, 5], [9, 13], [17, 41], [21, 55]]) {
    const start = [1, 1];
    const goal = [rows - 2, cols - 2];
    for (let trial = 0; trial < 15; trial++) {
      const walls = maze(rows, cols, [start, goal]);
      const steps = drain(catalog.path[0].run(walls, start, goal));
      assert.ok(steps.some(s => s.op === 'trail'), `${rows}x${cols} maze sealed the goal off`);
    }
  }
});

test('every route is a legal walk and the optimal ones agree', () => {
  const rows = 17, cols = 41, start = [1, 1], goal = [rows - 2, cols - 2];

  for (let trial = 0; trial < 15; trial++) {
    const walls = maze(rows, cols, [start, goal]);
    const length = {};

    for (const algo of catalog.path) {
      const trail = drain(algo.run(walls, start, goal)).find(s => s.op === 'trail');
      assert.ok(trail, `${algo.id} found no route through a connected maze`);

      const cells = trail.cells;
      assert.deepEqual(cells[0], start, `${algo.id} did not begin at the start`);
      assert.deepEqual(cells[cells.length - 1], goal, `${algo.id} did not end at the goal`);

      for (let i = 1; i < cells.length; i++) {
        const hop = Math.abs(cells[i][0] - cells[i - 1][0]) + Math.abs(cells[i][1] - cells[i - 1][1]);
        assert.equal(hop, 1, `${algo.id} teleported at step ${i}`);
        assert.ok(!walls[cells[i][0]][cells[i][1]], `${algo.id} walked through a wall`);
      }
      length[algo.id] = cells.length;
    }

    assert.equal(length.dijkstra, length.bfs, 'Dijkstra disagreed with BFS on the shortest route');
    assert.equal(length.astar, length.bfs, 'A* disagreed with BFS on the shortest route');
    assert.ok(length.dfs >= length.bfs, 'DFS beat the shortest possible route');
  }
});

test('a walled-off goal is reported rather than searched forever', () => {
  const rows = 11, cols = 11, start = [5, 1], goal = [5, 9];
  const walls = Array.from({ length: rows }, () => new Array(cols).fill(false));
  for (let r = 0; r < rows; r++) walls[r][5] = true;

  for (const algo of catalog.path) {
    const steps = drain(algo.run(walls, start, goal));
    assert.ok(steps.some(s => s.op === 'miss'), `${algo.id} did not report an unreachable goal`);
  }
});

