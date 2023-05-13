const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("set x", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  expect(system.numVertices()).toBe(0);
  expect(system.numSprings()).toBe(0);
  expect(system.numTriangles()).toBe(0);

  system.set({
    x: [
      [0, 0]
    ]
  });

  expect(system.numVertices()).toBe(1);
});

test("set x and springs", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  system.set({
    x: [
      [0, 0],
      [2, 0],
      [1, 1]
    ],
    springs: [
      [0, 2],
      [1, 2]
    ]
  });
  expect(system.l0.toArray()).toBeCloseToArray([1.4142135381698608, 1.4142135381698608]);
});