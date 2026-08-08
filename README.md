# Algorithm Visualizer

Fourteen algorithms — sorting, searching and pathfinding — drawn step by step on a
3D stage you can turn with the mouse.

![sorting](https://i.ibb.co/y86B7Wk/main-prj.png)

## Running it

```bash
npm install
npm start          # http://localhost:3001
```

That is the whole setup. MySQL is optional: without it the visualizer works exactly
the same, it just stops keeping a history of runs. To enable that history, copy
`.env.example` to `.env`, fill in your credentials, and create the database:

```sql
CREATE DATABASE algorithm_visualizer;
```

The `runs` table is created on first connect.

## How it works

The interesting decision is that **no algorithm in this project touches the DOM**.
Each one is a generator that mutates its input and yields a note about what
changed:

```js
function* bubble(a) {
  for (let end = a.length - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      yield { op: 'cmp', a: i, b: i + 1 };
      if (a[i] > a[i + 1]) {
        swap(a, i, i + 1);
        yield { op: 'swap', a: i, b: i + 1 };
      }
    }
    yield { op: 'lock', i: end };
  }
}
```

`app.js` owns the only loop that pulls on those generators, and it decides how fast
to pull. That split buys a lot for free:

- **Pausing** is just not calling `next()`. There is no cooperative `isRunning`
  flag threaded through every inner loop.
- **Resetting** abandons the generator. A run that was interrupted can never
  reach the code that reports a result or writes to the database.
- **Speed changes** apply immediately, because the delay is read per step rather
  than captured when the run began. Above a certain speed the loop stops sleeping
  and batches steps into animation frames instead.
- The algorithms are **testable without a browser**, which is what `npm test`
  does — it checks that every sort actually sorts, that every search finds what is
  there and admits what is not, that generated mazes are always solvable, and that
  BFS, Dijkstra and A\* agree on the shortest route while DFS never beats it.

## The 3D

Bars are real extruded prisms rather than pictures of them. Each bar is one
element; its `::before` and `::after` are folded backwards with `rotateX(90deg)`
and `rotateY(90deg)` to become the top and side faces. The stage holds the
`perspective` and the rack inside it carries the rotation, so tilting the whole
scene is two custom properties updated on pointer move and eased in a rAF loop.

## Layout

```
public/
  index.html          markup
  css/style.css       everything visual
  js/algorithms.js    the 14 algorithms + maze generation, no DOM
  js/app.js           rendering, the step loop, input
config/db.js          pool + schema, degrades to offline
routes/api.js         /api/runs, /api/stats, /api/health
server.js
test/algorithms.test.js
```

Only `public/` is served, so server sources and `.env` are not reachable over HTTP.

## API

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/runs` | Records a finished run. `202 {persisted:false}` when MySQL is down. |
| `GET` | `/api/runs?algorithm=&limit=` | Recent runs, newest first. |
| `GET` | `/api/stats` | Per-algorithm averages and best/worst times. |
| `GET` | `/api/health` | Liveness plus database state. |

## Controls

Space runs and pauses, `r` resets, `g` reshuffles. In searching mode, click a bar
to choose the target. In pathfinding, drag across the grid to draw or erase walls.
