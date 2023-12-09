const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("set pos and triangles", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  system.set({
    pos: [
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
  expect(system.numTriangles).toBe(2);
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

test("set rsi", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  system.set({
    pos: [
      [0, 0],
      [2, 0],
      [1, 1],
      [-0.3, 0.8]
    ],
    triangles: [
      [0, 1, 2],
      [0, 2, 3]
    ],
    trianglesRsi: [
      [[1, 2],
       [3, 4]],
      [[5, 6],
       [7, 8]],
    ]
  });
  expect(system.numTriangles).toBe(2);
  const expectedRsi = [
    [[1, 2],
     [3, 4]],
    [[5, 6],
     [7, 8]],
  ];
  expect(system.rsi.toArray()).toBeCloseToArray(expectedRsi);
});

test("set triangles", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  system.set({
    pos: [
      [0, 0],
      [2, 0],
      [1, 1],
      [-0.3, 0.8]
    ]
  });
  expect(system.numTriangles).toBe(0);

  system.setTriangles({
    indices: [
      [0, 1, 2],
      [0, 2, 3]
    ]
  });
  expect(system.numTriangles).toBe(2);
});