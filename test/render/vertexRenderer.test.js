import * as algovivo from "../../algovivo/index.js";

test("vertex renderer", () => {
  const system = { numVertices: 4 };
  const vertexRenderer = new algovivo.render.VertexRenderer({ system });
  expect(vertexRenderer.numVertices).toBe(4);
});