const algovivo = require("algovivo");
const utils = require("./utils");

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