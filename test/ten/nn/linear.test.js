import { test } from "node:test";
import assert from "node:assert";
import * as utils from "../../utils.js";

test("linear", async () => {
  const ten = await utils.loadTen();
  const memoryManager = ten.memoryManager;

  const bytes0 = ten.memoryManager.numReservedBytes();

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
  assert.deepStrictEqual(output.toArray(), [
    28,
    72
  ]);

  assert.notStrictEqual(memoryManager.numReservedBytes(), bytes0);
  linear.dispose();
  input.dispose();
  assert.strictEqual(memoryManager.numReservedBytes(), bytes0);
});