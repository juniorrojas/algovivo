import { test } from "node:test";
import assert from "node:assert";
import * as utils from "../utils.js";

test("fill", async () => {
  const ten = await utils.loadTen();

  const a = ten.zeros([2, 3]);

  a.fill_(2);
  assert.deepStrictEqual(a.toArray(), [
    [2, 2, 2],
    [2, 2, 2]
  ]);

  a.zero_();
  assert.deepStrictEqual(a.toArray(), [
    [0, 0, 0],
    [0, 0, 0]
  ]);
})
