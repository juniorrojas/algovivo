const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

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
  expect(system.numMuscles).toBe(3);
  const expectedL0 = [1.4142135381698608, 1.4142135381698608, 2];
  expect(system.l0.toArray()).toBeCloseToArray(expectedL0);
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
  expect(system.numMuscles).toBe(0);
  expect(system.l0).toBeNull();
  expect(system.a).toBeNull();
  
  system.setMuscles({
    indices: [
      [0, 2],
      [1, 2],
      [3, 4]
    ]
  });
  expect(system.numMuscles).toBe(3);
  const expectedL0 = [1.4142135381698608, 1.4142135381698608, 2];
  expect(system.l0.toArray()).toBeCloseToArray(expectedL0);
  expect(system.a.toArray()).toBeCloseToArray([1, 1, 1]);

  system.setMuscles({
    indices: [
      [0, 2],
      [3, 4]
    ],
    l0: [10, 15]
  });
  expect(system.numMuscles).toBe(2);
  expect(system.l0.toArray()).toBeCloseToArray([10, 15]);
  expect(system.a.toArray()).toBeCloseToArray([1, 1]);
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
  expect(system.a.toArray()).toBeCloseToArray([1.0]);
  system.a.set([0.3]);
  expect(system.a.toArray()).toBeCloseToArray([0.3]);
  system.setMuscles({
    indices: [
      [0, 1]
    ],
    l0: [
      2.0
    ],
    keepA: true
  });
  expect(system.a.toArray()).toBeCloseToArray([0.3]);
  system.setMuscles({
    indices: [
      [0, 1]
    ],
    l0: [
      2.0
    ]
  });
  expect(system.a.toArray()).toBeCloseToArray([1]);
});