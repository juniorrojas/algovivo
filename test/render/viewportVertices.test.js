const algovivo = require("algovivo");
const utils = require("../utils");

test("viewport vertices", () => {
  const system = { numVertices: 4 };
  const viewportVertices = new algovivo.render.ViewportVertices({ system });
  expect(viewportVertices.numVertices).toBe(4);
});