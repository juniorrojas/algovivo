const algovivo = require("algovivo");
const mmgrten = algovivo.mmgrten;
const { loadWasm } = require("./utils");

test("dot2d", async () => {
  const wasmInstance = await loadWasm();
  const r = wasmInstance.exports.dot2d(
    1, 2,
    3, 4
  );
  expect(r).toBe(11);
});

test("framenorm_projection", async () => {
  const ten = await mmgrten.engine({
    wasmInstance: await loadWasm()
  });

  const numVertices = 2;
  const spaceDim = 2;
  
  const x = ten.tensor([
    [0, 0],
    [1, 0]
  ]);

  const projectedX = ten.zeros([numVertices, spaceDim]);

  const centerId = 0;
  const forwardId = 1;
  
  ten.wasmInstance.exports.framenorm_projection(
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

  ten.wasmInstance.exports.make_policy_input(
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