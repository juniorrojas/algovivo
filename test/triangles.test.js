const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("set x and triangles", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  system.set({
    x: [
      [0, 0],
      [2, 0],
      [1, 1],
      [-0.3, 0.8]
    ],
    triangles: [
      [0, 1, 2],
      [0, 2, 3]
    ]
  });
  expect(system.numTriangles()).toBe(2);
  console.log(system.rsi.toArray());
  const expectedRsi = [
    [
      [0.5, -0.5],
      [0, 1]
    ],
    [
      [0.7272727489471436, 0.27272728085517883],
      [-0.9090909361839294, 0.90909093618392940]
    ]
  ];
  expect(system.rsi.toArray()).toBeCloseToArray(expectedRsi);
});