import { test } from "node:test";
import assert from "node:assert";
import * as utils from "../utils.js";

test("tensor", async () => {
  const ten = await utils.loadTen();
  const a = ten.tensor([1, 2, 3]);
  assert.deepStrictEqual(a.shape.toArray(), [3]);
  assert.deepStrictEqual(a.stride.toArray(), [1]);
  assert.deepStrictEqual(a.order, 1);
  assert.deepStrictEqual(a.numel, 3);

  assert.deepStrictEqual(Array.from(a.typedArray()), [1, 2, 3]);

  assert.strictEqual(a.get([0]), 1);
  a.set([0], 10);
  assert.strictEqual(a.get([0]), 10);
  
  assert.strictEqual(a.flattenIdx([1]), 1);
  assert.strictEqual(a.get([1]), 2);
  assert.strictEqual(a.flattenIdx([2]), 2);
  assert.strictEqual(a.get([2]), 3);
});

test("empty + zero", async () => {
  const ten = await utils.loadTen();
  
  const a = ten.empty([3, 1, 2]);
  assert.deepStrictEqual(a.shape.toArray(), [3, 1, 2]);
  assert.deepStrictEqual(a.order, 3);
  a.zero_();
  utils.assertCloseToArray(a.toArray(), [
    [[0, 0]],
    [[0, 0]],
    [[0, 0]]
  ]);
});

test("constructors", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([3, 1, 2]);
  utils.assertCloseToArray(a.toArray(), [
    [[0, 0]],
    [[0, 0]],
    [[0, 0]]
  ]);

  const b = ten.ones([3, 1, 2]);
  utils.assertCloseToArray(b.toArray(), [
    [[1, 1]],
    [[1, 1]],
    [[1, 1]]
  ]);
});

test("matrix set", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([2, 3]);
  a.set([1, 2], 10);
  a.set([0, 1], 30);
  assert.deepStrictEqual(a.toArray(), [
    [0, 30, 0],
    [0, 0, 10]
  ]);
});

test("set tensor with leading zero dim", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([0, 2, 3]);
  assert.deepStrictEqual(a.shape.toArray(), [0, 2, 3]);
  assert.deepStrictEqual(a.toArray(), []);
});

test("int32 tensor", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([2, 3], "int32");
  assert.strictEqual(a.dtype, "int32");
  assert.deepStrictEqual(a.toArray(), [
    [0, 0, 0],
    [0, 0, 0]
  ]);

  a.set([0, 0], -1);
  a.set([0, 1], 1);
  a.set([0, 2], -2147483648); // min int32
  a.set([1, 0], 2147483647); // max int32
  assert.strictEqual(a.get([0, 0]), -1);
  assert.strictEqual(a.get([0, 2]), -2147483648);
  assert.strictEqual(a.get([1, 0]), 2147483647);
  assert.deepStrictEqual(a.toArray(), [
    [-1, 1, -2147483648],
    [2147483647, 0, 0]
  ]);

  a.fill_(-1);
  assert.deepStrictEqual(a.toArray(), [
    [-1, -1, -1],
    [-1, -1, -1]
  ]);
});

test("uint32 tensor", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([3], "uint32");
  assert.strictEqual(a.dtype, "uint32");

  a.set([0], 0);
  a.set([1], 1);
  a.set([2], 4294967295); // max uint32 (2^32 - 1)
  assert.deepStrictEqual(a.toArray(), [0, 1, 4294967295]);
});