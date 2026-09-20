import * as utils from "../../utils.js";

test("sequential", async () => {
  const ten = await utils.loadTen();
  const nn = ten.nn;
  const memoryManager = ten.memoryManager;

  const bytes0 = ten.memoryManager.numReservedBytes();

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

  expect(memoryManager.numReservedBytes()).not.toBe(bytes0);
  model.dispose();
  input.dispose();
  expect(memoryManager.numReservedBytes()).toBe(bytes0);
});
