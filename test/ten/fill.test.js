const { mmgrten } = require("algovivo");
const utils = require("../utils");

test("fill", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([2, 3]);

  a.fill_(2);
  expect(a.toArray()).toEqual([
    [2, 2, 2],
    [2, 2, 2]
  ]);

  a.zero_();
  expect(a.toArray()).toEqual([
    [0, 0, 0],
    [0, 0, 0]
  ]);
})
