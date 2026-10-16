import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";
import * as utils from "./utils.js";

test("set pos and muscles", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  system.set({
    pos: [
      [0, 0],
      [2, 0],
      [1, 1],
      [3, 7],
      [5, 7]
    ],
    muscles: [
      [0, 2],
      [1, 2],
      [3, 4]
    ]
  });
  assert.strictEqual(system.numMuscles, 3);
  const expectedL0 = [1.4142135381698608, 1.4142135381698608, 2];
  utils.assertCloseToArray(system.l0.toArray(), expectedL0);

  assert.deepStrictEqual(system.muscles.indices.toArray(), [
    [0, 2],
    [1, 2],
    [3, 4]
  ]);
});

test("set muscles", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  system.set({
    pos: [
      [0, 0],
      [2, 0],
      [1, 1],
      [3, 7],
      [5, 7]
    ]
  });
  assert.strictEqual(system.numMuscles, 0);
  assert.strictEqual(system.l0, null);
  assert.strictEqual(system.a, null);
  
  system.setMuscles({
    indices: [
      [0, 2],
      [1, 2],
      [3, 4]
    ]
  });
  assert.strictEqual(system.numMuscles, 3);
  const expectedL0 = [1.4142135381698608, 1.4142135381698608, 2];
  utils.assertCloseToArray(system.l0.toArray(), expectedL0);
  utils.assertCloseToArray(system.a.toArray(), [1, 1, 1]);

  system.setMuscles({
    indices: [
      [0, 2],
      [3, 4]
    ],
    l0: [10, 15]
  });
  assert.strictEqual(system.numMuscles, 2);
  utils.assertCloseToArray(system.l0.toArray(), [10, 15]);
  utils.assertCloseToArray(system.a.toArray(), [1, 1]);
});

test("update l0, keep a", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  system.setVertices([
    [0.5, 0.5],
    [1.5, 0.5]
  ]);
  system.setMuscles({
    indices: [
      [0, 1]
    ],
    l0: [
      1.0
    ]
  });
  utils.assertCloseToArray(system.a.toArray(), [1.0]);
  system.a.set([0.3]);
  utils.assertCloseToArray(system.a.toArray(), [0.3]);
  system.setMuscles({
    indices: [
      [0, 1]
    ],
    l0: [
      2.0
    ],
    keepA: true
  });
  utils.assertCloseToArray(system.a.toArray(), [0.3]);
  system.setMuscles({
    indices: [
      [0, 1]
    ],
    l0: [
      2.0
    ]
  });
  utils.assertCloseToArray(system.a.toArray(), [1]);
});

test("add and remove muscles", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  system.setVertices([
    [0, 0],
    [2, 0]
  ]);
  
  assert.strictEqual(system.numMuscles, 0);
  system.setMuscles({
    indices: [
      [0, 1]
    ]
  });
  assert.strictEqual(system.numMuscles, 1);
  system.setMuscles({
    indices: []
  });
  assert.strictEqual(system.numMuscles, 0);
  system.setMuscles({
    indices: [
      [0, 1]
    ]
  });
  assert.strictEqual(system.numMuscles, 1);
});

test("set indices only", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  
  assert.throws(() => {
    system.muscles.set({
      indices: [[0, 1]]
    });
  }, { message: "pos required to compute l0" });
})