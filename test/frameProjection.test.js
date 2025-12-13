const algovivo = require("algovivo");
const mmgrten = algovivo.mmgrten;
const { loadWasm, loadTen } = require("./utils");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("dot2d", async () => {
  const wasmInstance = await loadWasm();
  const r = wasmInstance.exports.dot2d(
    1, 2,
    3, 4
  );
  expect(r).toBe(11);
});

test("frame_projection simple", async () => {
  const ten = await loadTen();

  const numVertices = 2;
  const spaceDim = 2;
  
  const x = ten.tensor([
    [0, 0],
    [1, 0]
  ]);

  const projectedX = ten.zeros([numVertices, spaceDim]);

  const centerId = 0;
  const forwardId = 1;
  
  ten.wasmInstance.exports.frame_projection(
    numVertices,
    x.ptr,
    centerId,
    forwardId,
    x.ptr,
    projectedX.ptr,
    false
  );

  expect(projectedX.toArray()).toEqual([
    [0, 0],
    [1, 0]
  ]);
});

test("frame_projection", async () => {
  const ten = await loadTen();

  const x = ten.tensor([
    [-1.3, 2.7],
    [2.3, 0.9],
    [1, 1.3]
  ]);

  const numVertices = x.shape.get(0);
  const spaceDim = x.shape.get(1);

  const projectedX = ten.zeros([numVertices, spaceDim]);

  const centerId = 1;
  const forwardId = 2;

  const subtractPositon = true;
  const clockwise = true;

  ten.wasmInstance.exports.frame_projection(
    numVertices,
    x.ptr,
    centerId,
    forwardId,
    x.ptr,
    projectedX.ptr,
    subtractPositon,
    clockwise
  );

  const result = projectedX.toArray();
  console.log(result);

  expect(result).toBeCloseToArray([
    [3.9701590538024902, 0.6616933345794678],
    [0, 0],
    [1.3601469993591309, 2.9802322387695312e-8]
  ]);
  
  x.dispose();
  projectedX.dispose();
});

test("make_policy_input", async () => {
  const ten = mmgrten.engine({
    wasmInstance: await loadWasm()
  });

  const numVertices = 3;
  const spaceDim = 2;

  const x = ten.tensor([
    [1, 2],
    [3, 4],
    [5, 6]
  ]);

  const v = ten.tensor([
    [7, 8],
    [9, 10],
    [11, 12]
  ]);

  const policyInput = ten.zeros([spaceDim * numVertices * 2]);

  ten.wasmInstance.exports.cat_pos_vel(
    numVertices,
    x.ptr,
    v.ptr,
    policyInput.ptr
  );

  expect(policyInput.toArray()).toEqual([
    1, 2, 3, 4, 5, 6,
    7, 8, 9, 10, 11, 12
  ]);
});