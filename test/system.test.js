import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";
import * as utils from "./utils.js";

test("set pos", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  assert.strictEqual(system.numVertices, 0);
  assert.strictEqual(system.numMuscles, 0);
  assert.strictEqual(system.numTriangles, 0);

  system.set({
    pos: [
      [1, 2]
    ]
  });

  assert.strictEqual(system.numVertices, 1);
  utils.assertCloseToArray(system.pos.toArray(), [[1, 2]]);
  utils.assertCloseToArray(system.vel.toArray(), [[0, 0]]);
});

test("step with no vertices", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  assert.strictEqual(system.numVertices, 0);
  assert.strictEqual(system.numMuscles, 0);
  assert.strictEqual(system.numTriangles, 0);
  system.step();
  assert.strictEqual(system.numVertices, 0);
  assert.strictEqual(system.numMuscles, 0);
  assert.strictEqual(system.numTriangles, 0);
});

test("step with fixed vertex", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  system.set({
    pos: [
      [1, 3],
      [5, 6]
    ]
  });
  system.vertices.fixVertex(0);
  system.step();
  const p = system.pos.toArray();
  assert.deepStrictEqual(p[0][0], 1);
  assert.deepStrictEqual(p[0][1], 3);
  assert.deepStrictEqual(p[1][0], 5);
  assert.ok(p[1][1] < 6);
});

test("step with multiple fixed vertices", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  system.set({
    pos: [
      [0, 1],
      [1, 1.5],
      [3, 6]
    ]
  });
  system.vertices.fixVertices([0, 1]);
  assert.strictEqual(system.vertices.numFixedVertices, 2);
  assert.deepStrictEqual(system.vertices.fixedVertexIds, [0, 1]);

  // pinned vertices must hold position exactly over many steps,
  // while the free vertex falls under gravity
  for (let i = 0; i < 300; i++) {
    system.step();
  }

  const p = system.pos.toArray();
  assert.deepStrictEqual(p[0], [0, 1]);
  assert.deepStrictEqual(p[1], [1, 1.5]);
  assert.ok(p[2][1] < 6);
});

test("set l0 and rsi", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  system.set({
    pos: [
      [0, 0],
      [2, 0],
      [1, 1]
    ],
    muscles: [[0, 1]],
    l0: [5.0],
    triangles: [[0, 1, 2]],
    rsi: [[[1, 0], [0, 1]]]
  });

  utils.assertCloseToArray(system.l0.toArray(), [5.0]);
  utils.assertCloseToArray(system.rsi.toArray(), [[[1, 0], [0, 1]]]);
});