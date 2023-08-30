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

test("step empty", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  expect(system.numVertices()).toBe(0);
  expect(system.numSprings()).toBe(0);
  expect(system.numTriangles()).toBe(0);
  system.step();
  expect(system.numVertices()).toBe(0);
  expect(system.numSprings()).toBe(0);
  expect(system.numTriangles()).toBe(0);
});