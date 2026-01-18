const { mmgrten } = require("algovivo");
const utils = require("../utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("tensor", async () => {
  const ten = await utils.loadTen();
  const a = ten.tensor([1, 2, 3]);
  expect(a.shape.toArray()).toEqual([3]);
  expect(a.stride.toArray()).toEqual([1]);
  expect(a.order).toEqual(1);
  expect(a.numel).toEqual(3);

  expect(Array.from(a.typedArray())).toEqual([1, 2, 3]);

  expect(a.get([0])).toBe(1);
  a.set([0], 10);
  expect(a.get([0])).toBe(10);
  
  expect(a.flattenIdx([1])).toBe(1);
  expect(a.get([1])).toBe(2);
  expect(a.flattenIdx([2])).toBe(2);
  expect(a.get([2])).toBe(3);
});

test("empty + zero", async () => {
  const ten = await utils.loadTen();
  
  const a = ten.empty([3, 1, 2]);
  expect(a.shape.toArray()).toEqual([3, 1, 2]);
  expect(a.order).toEqual(3);
  a.zero_();
  expect(a.toArray()).toBeCloseToArray([
    [[0, 0]],
    [[0, 0]],
    [[0, 0]]
  ]);
});

test("constructors", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([3, 1, 2]);
  expect(a.toArray()).toBeCloseToArray([
    [[0, 0]],
    [[0, 0]],
    [[0, 0]]
  ]);

  const b = ten.ones([3, 1, 2]);
  expect(b.toArray()).toBeCloseToArray([
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
  expect(a.toArray()).toEqual([
    [0, 30, 0],
    [0, 0, 10]
  ]);
});

test("set tensor with leading zero dim", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([0, 2, 3]);
  expect(a.shape.toArray()).toEqual([0, 2, 3]);
  expect(a.toArray()).toEqual([]);
});

test("int32 tensor", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([2, 3], "int32");
  expect(a.dtype).toBe("int32");
  expect(a.toArray()).toEqual([
    [0, 0, 0],
    [0, 0, 0]
  ]);

  a.set([0, 0], -1);
  a.set([0, 1], 1);
  a.set([0, 2], -2147483648); // min int32
  a.set([1, 0], 2147483647); // max int32
  expect(a.get([0, 0])).toBe(-1);
  expect(a.get([0, 2])).toBe(-2147483648);
  expect(a.get([1, 0])).toBe(2147483647);
  expect(a.toArray()).toEqual([
    [-1, 1, -2147483648],
    [2147483647, 0, 0]
  ]);

  a.fill_(-1);
  expect(a.toArray()).toEqual([
    [-1, -1, -1],
    [-1, -1, -1]
  ]);
});

test("uint32 tensor", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([3], "uint32");
  expect(a.dtype).toBe("uint32");

  a.set([0], 0);
  a.set([1], 1);
  a.set([2], 4294967295); // max uint32 (2^32 - 1)
  expect(a.toArray()).toEqual([0, 1, 4294967295]);
});