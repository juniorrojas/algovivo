const utils = require("../../utils");

test("sequential", async () => {
  const ten = await utils.loadTen();
  const nn = ten.nn;
  const mgr = ten.mgr;

  const bytes0 = ten.mgr.numReservedBytes();

  const inputSize = 3;
  const outputSize = 2;

  const model = nn.Sequential(
    nn.Linear(inputSize, 32),
    nn.ReLU(),
    nn.Linear(32, outputSize),
    nn.Tanh()
  );

  const input = ten.tensor([
    2,
    4,
    3
  ]);
  
  const output = model.forward(input);
  expect(output.toArray().length).toBe(2);

  expect(mgr.numReservedBytes()).not.toBe(bytes0);
  model.dispose();
  input.dispose();
  expect(mgr.numReservedBytes()).toBe(bytes0);
});
