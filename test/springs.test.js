const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("set pos and springs", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
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

test("set springs", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
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
  
  system.setSprings({
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

  system.setSprings({
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
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  system.setX([
    [0.5, 0.5],
    [1.5, 0.5]
  ]);
  system.setSprings({
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
  system.setSprings({
    indices: [
      [0, 1]
    ],
    l0: [
      2.0
    ],
    keepA: true
  });
  expect(system.a.toArray()).toBeCloseToArray([0.3]);
  system.setSprings({
    indices: [
      [0, 1]
    ],
    l0: [
      2.0
    ]
  });
  expect(system.a.toArray()).toBeCloseToArray([1]);
});