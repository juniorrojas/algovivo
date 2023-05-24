const { mmgrten } = require("algovivo");
const utils = require("../../utils");

test("linear", async () => {
  const ten = await mmgrten.engine({
    wasmInstance: await utils.loadWasm()
  });
  const mgr = ten.mgr;

  const bytes0 = ten.mgr.numReservedBytes();

  const inputSize = 3;
  const outputSize = 2;
  const linear = ten.nn.Linear(inputSize, outputSize);
  linear.weight.set([
    [1, 2, 5],
    [6, 7, 9]
  ]);
  linear.bias.set([
    3,
    5
  ]);
  const input = ten.tensor([
    2,
    4,
    3
  ]);

  const output = linear.forward(input);
  expect(output.toArray()).toEqual([
    28,
    72
  ]);

  expect(mgr.numReservedBytes()).not.toBe(bytes0);
  linear.dispose();
  input.dispose();
  expect(mgr.numReservedBytes()).toBe(bytes0);
});