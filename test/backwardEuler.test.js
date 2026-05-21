import * as algovivo from "algovivo";
import * as utils from "./utils.js";

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("update vel", async () => {
  const ten = await utils.loadTen();

  const numVertices = 3;
  const spaceDim = 2;
  
  const pos0 = ten.tensor([
    [1, 2],
    [3, 4],
    [5, 6]
  ]);
  const pos1 = ten.tensor([
    [2, 10],
    [5, 3],
    [1, 16]
  ]);
  const vel1 = ten.zeros([numVertices, spaceDim]);
  const dt = 2;

  ten.wasmInstance.exports.backward_euler_update_vel(
    numVertices, spaceDim,
    pos0.ptr, 0,
    pos1.ptr, vel1.ptr,
    dt
  );
  expect(vel1.toArray()).toBeCloseToArray([
    [0.5, 4],
    [1, -0.5],
    [-2, 5]
  ]);
});

test("optim init", async () => {
  const ten = await utils.loadTen();

  const numVertices = 3;
  const spaceDim = 2;
  
  const pos0 = ten.tensor([
    [1, 2],
    [3, 4],
    [5, 6]
  ]);
  const vel0 = ten.tensor([
    [0.5, 4],
    [1, -0.5],
    [-2, 5]
  ]);
  const pos = ten.zeros([numVertices, spaceDim]);
  const dt = 2;

  ten.wasmInstance.exports.optim_init(
    spaceDim, dt, numVertices,
    pos0.ptr, vel0.ptr,
    pos.ptr,
    0, 0
  );
  expect(pos.toArray()).toBeCloseToArray([
    [2, 10],
    [5, 3],
    [1, 16]
  ]);
});

test("optim init with fixed vertices", async () => {
  const ten = await utils.loadTen();

  const numVertices = 3;
  const spaceDim = 2;

  const pos0 = ten.tensor([
    [1, 2],
    [3, 4],
    [5, 6]
  ]);
  const vel0 = ten.tensor([
    [0.5, 4],
    [1, -0.5],
    [-2, 5]
  ]);
  const pos = ten.zeros([numVertices, spaceDim]);
  const dt = 2;

  // pin vertices 0 and 2: they must stay at pos0, vertex 1 follows inertia
  const fixedVertexIds = ten.zeros([2], "int32");
  fixedVertexIds.typedArray().set([0, 2]);

  ten.wasmInstance.exports.optim_init(
    spaceDim, dt, numVertices,
    pos0.ptr, vel0.ptr,
    pos.ptr,
    2, fixedVertexIds.ptr
  );
  expect(pos.toArray()).toBeCloseToArray([
    [1, 2],
    [5, 3],
    [5, 6]
  ]);
});