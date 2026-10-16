import { test } from "node:test";
import { mmgrten } from "algovivo";
import * as utils from "../utils.js";

test("clamp min max", async () => {
  const ten = await utils.loadTen();

  const a = ten.tensor([
    [1, -3, 0.9],
    [0.5, 0.2, 0.3]
  ]);

  a.clamp_({ min: 0.1, max: 0.4 });
  utils.assertCloseToArray(a.toArray(), [
    [0.4, 0.1, 0.4],
    [0.4, 0.2, 0.3]
  ]);
});

test("clamp min", async () => {
  const ten = await utils.loadTen();

  const a = ten.tensor([
    [1, -3, 0.9],
    [0.5, 0.2, 0.3]
  ]);
  a.clamp_({ min: 0.1 });
  utils.assertCloseToArray(a.toArray(), [
    [1, 0.1, 0.9],
    [0.5, 0.2, 0.3]
  ]);
});

test("clamp max", async () => {
  const ten = await utils.loadTen();

  const a = ten.tensor([
    [1, -3, 0.9],
    [0.5, 0.2, 0.3]
  ]);
  a.clamp_({ max: 0.4 });
  utils.assertCloseToArray(a.toArray(), [
    [0.4, -3, 0.4],
    [0.4, 0.2, 0.3]
  ]);
})