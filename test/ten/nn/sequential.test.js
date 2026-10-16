import { test } from "node:test";
import assert from "node:assert";
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
  assert.strictEqual(output.toArray().length, 2);

  assert.notStrictEqual(memoryManager.numReservedBytes(), bytes0);
  model.dispose();
  input.dispose();
  assert.strictEqual(memoryManager.numReservedBytes(), bytes0);
});
