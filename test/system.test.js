import * as algovivo from "../algovivo/index.js";
import * as utils from "./utils.js";

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("set pos", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  expect(system.numVertices).toBe(0);
  expect(system.numMuscles).toBe(0);
  expect(system.numTriangles).toBe(0);

  system.set({
    pos: [
      [1, 2]
    ]
  });

  expect(system.numVertices).toBe(1);
  expect(system.pos.toArray()).toBeCloseToArray([[1, 2]]);
  expect(system.vel.toArray()).toBeCloseToArray([[0, 0]]);
});

test("step with no vertices", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  expect(system.numVertices).toBe(0);
  expect(system.numMuscles).toBe(0);
  expect(system.numTriangles).toBe(0);
  system.step();
  expect(system.numVertices).toBe(0);
  expect(system.numMuscles).toBe(0);
  expect(system.numTriangles).toBe(0);
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
  expect(p[0][0]).toEqual(1);
  expect(p[0][1]).toEqual(3);
  expect(p[1][0]).toEqual(5);
  expect(p[1][1]).toBeLessThan(6);
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

  expect(system.l0.toArray()).toBeCloseToArray([5.0]);
  expect(system.rsi.toArray()).toBeCloseToArray([[[1, 0], [0, 1]]]);
});