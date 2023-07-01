const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("set x and springs", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  system.set({
    x: [
      [0, 0],
      [2, 0],
      [1, 1],
      [3, 7],
      [5, 7]
    ],
    springs: [
      [0, 2],
      [1, 2],
      [3, 4]
    ]
  });
  expect(system.numSprings()).toBe(3);
  const expectedL0 = [1.4142135381698608, 1.4142135381698608, 2];
  expect(system.l0.toArray()).toBeCloseToArray(expectedL0);
});

test("set springs", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  system.set({
    x: [
      [0, 0],
      [2, 0],
      [1, 1],
      [3, 7],
      [5, 7]
    ]
  });
  expect(system.numSprings()).toBe(0);
  
  system.setSprings({
    indices: [
      [0, 2],
      [1, 2],
      [3, 4]
    ]
  });
  expect(system.numSprings()).toBe(3);
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
  expect(system.numSprings()).toBe(2);
  expect(system.l0.toArray()).toBeCloseToArray([10, 15]);
  expect(system.a.toArray()).toBeCloseToArray([1, 1]);
});