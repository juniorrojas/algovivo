const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("set pos and triangles", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
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

  const trianglesArray = system.getTrianglesArray();
  expect(trianglesArray).toEqual([
    [0, 1, 2],
    [0, 2, 3]
  ]);
});

test("set rsi", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
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

  system.setTriangles({
    rsi: [
      [[11, 12],
       [13, 14]],
      [[15, 16],
       [17, 18]]
    ]
  });
  expect(system.rsi.toArray()).toBeCloseToArray([
    [[11, 12],
     [13, 14]],
    [[15, 16],
     [17, 18]]
  ]);

  expect(() => {
    system.setTriangles({
      rsi: [
        [[11, 12],
         [13, 14]]
      ]
    });
  }).toThrow();
});

test("set triangles", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
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

test("set triangles with pos", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  system.set({
    pos: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
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

  system.setTriangles({
    pos: [
      [0, 0],
      [2, 0],
      [1, 1],
      [-0.3, 0.8]
    ],
    indices: [
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