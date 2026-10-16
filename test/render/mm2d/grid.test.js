import { test } from "node:test";
import assert from "node:assert";
import { mm2d } from "algovivo";

test("grid", () => {
  const scene = new mm2d.Scene();
  const grid = new mm2d.background.Grid({
    scene: scene,
    rows: 1,
    cols: 1,
    innerCells: 1
  });
  assert.strictEqual(grid.numLines, 4);
  assert.strictEqual(grid.numVertices, 8);
  
  grid.set({
    rows: 1,
    cols: 1,
    innerCells: 1
  });
  assert.strictEqual(grid.numLines, 4);
  assert.strictEqual(grid.numVertices, 8);

  grid.set({
    rows: 2,
    cols: 3,
    innerCells: 2
  });
  assert.strictEqual(grid.numLines, 12);
  assert.strictEqual(grid.numVertices, 24);
});