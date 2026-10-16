import { test } from "node:test";
import assert from "node:assert";
import * as utils from "../utils.js";

test("get/set", async () => {
  const ten = await utils.loadTen();
  const a = ten.intTuple([1, 4, 8]);
  assert.strictEqual(a.get(0), 1);
  assert.strictEqual(a.get(1), 4);
  assert.strictEqual(a.get(2), 8);
  assert.strictEqual(a.toString(), "1,4,8");
  a.set(1, 6);
  assert.strictEqual(a.get(1), 6);
  assert.strictEqual(a.toString(), "1,6,8");
});

test("flatten idx", async () => {
  const ten = await utils.loadTen();
  const order = 1;
  const idx = ten.intTuple([1]);
  const stride = ten.intTuple([1]);
  const flatIdx = ten.wasmInstance.exports.flatten_idx(order, idx.slot.ptr, stride.slot.ptr);
  assert.strictEqual(flatIdx, 1);
});