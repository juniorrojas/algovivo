const { mmgrten } = require("algovivo");
const utils = require("../utils");

test("get/set", async () => {
  const ten = await mmgrten.engine({
    wasmInstance: await utils.loadWasm()
  });
  const a = ten.intTuple([1, 4, 8]);
  expect(a.get(0)).toBe(1);
  expect(a.get(1)).toBe(4);
  expect(a.get(2)).toBe(8);
  expect(a.toString()).toBe("1,4,8");
  a.set(1, 6);
  expect(a.get(1)).toBe(6);
  expect(a.toString()).toBe("1,6,8");
});

test("flatten idx", async () => {
  const ten = await mmgrten.engine({
    wasmInstance: await utils.loadWasm()
  });
  const order = 1;
  const idx = ten.intTuple([1]);
  const stride = ten.intTuple([1]);
  const flatIdx = ten.wasmInstance.exports.flatten_idx(order, idx.slot.ptr, stride.slot.ptr);
  expect(flatIdx).toBe(1);
});