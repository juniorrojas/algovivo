const mm2d = require("algovivo").mm2d;

test("grid", () => {
  const scene = new mm2d.Scene();
  const grid = new mm2d.background.Grid({
    scene: scene,
    rows: 1,
    cols: 1,
    innerCells: 1
  });
  expect(grid.numLines).toBe(4);
  expect(grid.numVertices).toBe(8);
  
  grid.set({
    rows: 1,
    cols: 1,
    innerCells: 1
  });
  expect(grid.numLines).toBe(4);
  expect(grid.numVertices).toBe(8);

  grid.set({
    rows: 2,
    cols: 3,
    innerCells: 2
  });
  expect(grid.numLines).toBe(12);
  expect(grid.numVertices).toBe(24);
});