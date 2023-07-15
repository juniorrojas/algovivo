const mm2d = require("algovivo").mm2d;

test("basic", () => {
  const aabb = new mm2d.math.AABB({
    x0: 20,
    y0: 15,
    width: 10,
    height: 40,
  });
  expect(aabb.x0).toEqual(20);
  expect(aabb.x1).toEqual(30);
  expect(aabb.width).toEqual(10);
  expect(aabb.height).toEqual(40);
  expect(aabb.y0).toEqual(15);
  expect(aabb.y1).toEqual(55);
  expect(aabb.center).toEqual([25, 35]);
});