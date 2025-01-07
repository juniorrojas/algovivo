const algovivo = require("algovivo");

test("vertex renderer", () => {
  const system = { numVertices: 4 };
  const viewportVertices = new algovivo.render.VertexRenderer({ system });
  expect(viewportVertices.numVertices).toBe(4);
});