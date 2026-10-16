import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";

test("vertex renderer", () => {
  const system = { numVertices: 4 };
  const vertexRenderer = new algovivo.render.VertexRenderer({ system });
  assert.strictEqual(vertexRenderer.numVertices, 4);
});