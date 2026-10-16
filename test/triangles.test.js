import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";
import * as utils from "./utils.js";

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
  assert.strictEqual(system.numTriangles, 2);
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
  utils.assertCloseToArray(system.rsi.toArray(), expectedRsi);

  const trianglesArray = system.triangles.indices.toArray();
  assert.deepStrictEqual(trianglesArray, [
    [0, 1, 2],
    [0, 2, 3]
  ]);

  assert.deepStrictEqual(system.triangles.indices.toArray(), [
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
  assert.strictEqual(system.numTriangles, 2);
  const expectedRsi = [
    [[1, 2],
     [3, 4]],
    [[5, 6],
     [7, 8]],
  ];
  utils.assertCloseToArray(system.rsi.toArray(), expectedRsi);

  system.setTriangles({
    rsi: [
      [[11, 12],
       [13, 14]],
      [[15, 16],
       [17, 18]]
    ]
  });
  utils.assertCloseToArray(system.rsi.toArray(), [
    [[11, 12],
     [13, 14]],
    [[15, 16],
     [17, 18]]
  ]);

  assert.throws(() => {
    system.setTriangles({
      rsi: [
        [[11, 12],
         [13, 14]]
      ]
    });
  });
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
  assert.strictEqual(system.numTriangles, 0);

  system.setTriangles({
    indices: [
      [0, 1, 2],
      [0, 2, 3]
    ]
  });
  assert.strictEqual(system.numTriangles, 2);
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
  assert.strictEqual(system.numTriangles, 0);

  system.setTriangles({
    indices: [
      [0, 1, 2],
      [0, 2, 3]
    ]
  });
  assert.strictEqual(system.numTriangles, 2);

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

  assert.strictEqual(system.numTriangles, 2);
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
  utils.assertCloseToArray(system.rsi.toArray(), expectedRsi);
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

  assert.ok(Math.abs(triangleEnergy(system.pos)) < 1e-5);

  const stretchedPos = ten.tensor([
    [0, 0],
    [2, 0],
    [0, 1]
  ]);
  assert.ok(triangleEnergy(stretchedPos) > 1e-3);
  stretchedPos.dispose();
});

test("per-triangle mu and lambda", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  const pos = [[0, 0], [1, 0], [0, 1], [1, 1]];
  const triangles = [[0, 1, 2], [1, 3, 2]];

  system.set({ pos, triangles });
  utils.assertCloseToArray(system.triangles.mu.toArray(), [500, 500]);
  utils.assertCloseToArray(system.triangles.lambda.toArray(), [50, 50]);

  system.set({ pos, triangles, mu: [500, 5000], lambda: 70 });
  utils.assertCloseToArray(system.triangles.mu.toArray(), [500, 5000]);
  utils.assertCloseToArray(system.triangles.lambda.toArray(), [70, 70]);

  system.setTriangles({ rsi: system.triangles.rsi.toArray() });
  utils.assertCloseToArray(system.triangles.mu.toArray(), [500, 5000]);
  utils.assertCloseToArray(system.triangles.lambda.toArray(), [70, 70]);

  system.setTriangles({ rsi: system.triangles.rsi.toArray(), lambda: [80, 90] });
  utils.assertCloseToArray(system.triangles.mu.toArray(), [500, 5000]);
  utils.assertCloseToArray(system.triangles.lambda.toArray(), [80, 90]);

  system.set({ pos, triangles });
  utils.assertCloseToArray(system.triangles.mu.toArray(), [500, 500]);
  utils.assertCloseToArray(system.triangles.lambda.toArray(), [50, 50]);

  assert.throws(() => system.setTriangles({ indices: [[0, 1, 2]], mu: [1, 2] }), /one value per triangle/);
});