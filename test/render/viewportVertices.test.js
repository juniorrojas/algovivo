const algovivo = require("algovivo");

test("viewport vertices", () => {
  const system = { numVertices: 4 };
  const viewportVertices = new algovivo.render.ViewportVertices({ system });
  expect(viewportVertices.numVertices).toBe(4);
});