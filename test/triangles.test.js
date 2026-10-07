import * as algovivo from "algovivo";
import * as utils from "./utils.js";

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

  const trianglesArray = system.triangles.indices.toArray();
  expect(trianglesArray).toEqual([
    [0, 1, 2],
    [0, 2, 3]
  ]);

  expect(system.triangles.indices.toArray()).toEqual([
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
test("triangle energy", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  system.set({
    pos: [
      [0, 0],
      [1, 0],
      [0, 1]
    ],
    triangles: [
      [0, 1, 2]
    ]
  });

  const triangleEnergy = (pos) => ten.wasmInstance.exports.triangle_energy(
    system.numTriangles,
    system.triangles.indices.ptr,
    system.rsi.ptr,
    system.triangles.mu.ptr,
    system.triangles.lambda.ptr,
    pos.ptr
  );

  expect(Math.abs(triangleEnergy(system.pos))).toBeLessThan(1e-5);

  const stretchedPos = ten.tensor([
    [0, 0],
    [2, 0],
    [0, 1]
  ]);
  expect(triangleEnergy(stretchedPos)).toBeGreaterThan(1e-3);
  stretchedPos.dispose();
});

test("per-triangle mu and lambda", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  const pos = [[0, 0], [1, 0], [0, 1], [1, 1]];
  const triangles = [[0, 1, 2], [1, 3, 2]];

  system.set({ pos, triangles });
  expect(system.triangles.mu.toArray()).toBeCloseToArray([500, 500]);
  expect(system.triangles.lambda.toArray()).toBeCloseToArray([50, 50]);

  system.set({ pos, triangles, mu: [500, 5000], lambda: 70 });
  expect(system.triangles.mu.toArray()).toBeCloseToArray([500, 5000]);
  expect(system.triangles.lambda.toArray()).toBeCloseToArray([70, 70]);

  system.setTriangles({ rsi: system.triangles.rsi.toArray() });
  expect(system.triangles.mu.toArray()).toBeCloseToArray([500, 5000]);
  expect(system.triangles.lambda.toArray()).toBeCloseToArray([70, 70]);

  system.setTriangles({ rsi: system.triangles.rsi.toArray(), lambda: [80, 90] });
  expect(system.triangles.mu.toArray()).toBeCloseToArray([500, 5000]);
  expect(system.triangles.lambda.toArray()).toBeCloseToArray([80, 90]);

  system.set({ pos, triangles });
  expect(system.triangles.mu.toArray()).toBeCloseToArray([500, 500]);
  expect(system.triangles.lambda.toArray()).toBeCloseToArray([50, 50]);

  expect(() => system.setTriangles({ indices: [[0, 1, 2]], mu: [1, 2] })).toThrow(/one value per triangle/);
});