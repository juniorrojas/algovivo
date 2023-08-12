const { mmgrten } = require("algovivo");
const utils = require("../utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("clamp min max", async () => {
  const ten = await mmgrten.engine({
    wasmInstance: await utils.loadWasm()
  });

  const a = ten.tensor([
    [1, -3, 0.9],
    [0.5, 0.2, 0.3]
  ]);

  a.clamp_({ min: 0.1, max: 0.4 });
  expect(a.toArray()).toBeCloseToArray([
    [0.4, 0.1, 0.4],
    [0.4, 0.2, 0.3]
  ]);
});

test("clamp min", async () => {
  const ten = await mmgrten.engine({
    wasmInstance: await utils.loadWasm()
  });

  const a = ten.tensor([
    [1, -3, 0.9],
    [0.5, 0.2, 0.3]
  ]);
  a.clamp_({ min: 0.1 });
  expect(a.toArray()).toBeCloseToArray([
    [1, 0.1, 0.9],
    [0.5, 0.2, 0.3]
  ]);
});

test("clamp max", async () => {
  const ten = await mmgrten.engine({
    wasmInstance: await utils.loadWasm()
  });

  const a = ten.tensor([
    [1, -3, 0.9],
    [0.5, 0.2, 0.3]
  ]);
  a.clamp_({ max: 0.4 });
  expect(a.toArray()).toBeCloseToArray([
    [0.4, -3, 0.4],
    [0.4, 0.2, 0.3]
  ]);
})