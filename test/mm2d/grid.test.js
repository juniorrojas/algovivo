const mm2d = require("algovivo").mm2d;

test("grid", () => {
  const scene = new mm2d.Scene();
  const grid = new mm2d.background.Grid({
    scene: scene
  });
});