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
  const expectedL0 = [1.4142135381698608, 1.4142135381698608, 2];
  expect(system.l0.toArray()).toBeCloseToArray(expectedL0);
});