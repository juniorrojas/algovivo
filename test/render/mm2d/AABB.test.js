import { test } from "node:test";
import assert from "node:assert";
import { mm2d } from "algovivo";

test("aabb", () => {
  const aabb = new mm2d.math.AABB({
    x0: 20,
    y0: 15,
    width: 10,
    height: 40,
  });
  assert.deepStrictEqual(aabb.x0, 20);
  assert.deepStrictEqual(aabb.x1, 30);
  assert.deepStrictEqual(aabb.width, 10);
  assert.deepStrictEqual(aabb.height, 40);
  assert.deepStrictEqual(aabb.y0, 15);
  assert.deepStrictEqual(aabb.y1, 55);
  assert.deepStrictEqual(aabb.center, [25, 35]);
});