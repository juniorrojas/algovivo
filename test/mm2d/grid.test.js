const mm2d = require("algovivo").mm2d;

test("grid", () => {
  const scene = new mm2d.Scene();
  const grid = new mm2d.background.Grid({
    scene: scene,
    rows: 1,
    cols: 1,
    innerCells: 1
  });
  expect(grid.numVertices).toBe(8);
  expect(grid.numLines).toBe(4);
});