import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";
import * as utils from "../utils.js";

test("hit test", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  
  system.set({
    pos: [
      [0, 0],
      [1, 2]
    ]
  });

  const viewport = new algovivo.SystemViewport({ system, headless: true });
  assert.strictEqual(viewport.hitTestVertex([0, 0]), 0);
  assert.strictEqual(viewport.hitTestVertex([1, 2]), 1);
  assert.strictEqual(viewport.hitTestVertex([10, 20]), null);
  assert.strictEqual(viewport.hitTestVertex([1, 2], 100), 1);
});

test("vertex drag fixes and frees a vertex", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });

  system.set({
    pos: [
      [5, 6],
      [11, 12]
    ]
  });

  system.vel.set([
    [1, 2],
    [3, 4]
  ]);

  const viewport = new algovivo.SystemViewport({ system, headless: true });
  assert.deepStrictEqual(system.vertices.fixedVertexIds, []);

  // dragging a free vertex pins it and zeroes its velocity
  viewport.beginVertexDrag(1);
  assert.deepStrictEqual(system.vertices.fixedVertexIds, [1]);
  utils.assertCloseToArray(system.pos.toArray(), [[5, 6], [11, 12]]);
  utils.assertCloseToArray(system.vel.toArray(), [[1, 2], [0, 0]]);

  // releasing the drag frees it again
  viewport.endVertexDrag();
  assert.deepStrictEqual(system.vertices.fixedVertexIds, []);
});

test("vertex drag preserves pre-fixed vertices", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });

  system.set({
    pos: [
      [0, 0],
      [1, 0],
      [2, 0]
    ]
  });

  // vertices 0 and 2 are pinned programmatically
  system.vertices.fixVertices([0, 2]);

  const viewport = new algovivo.SystemViewport({ system, headless: true });

  // dragging a free vertex adds it without disturbing the pinned ones
  viewport.beginVertexDrag(1);
  assert.deepStrictEqual(system.vertices.fixedVertexIds.sort(), [0, 1, 2]);

  // releasing frees only the dragged vertex; pre-pinned ones stay
  viewport.endVertexDrag();
  assert.deepStrictEqual(system.vertices.fixedVertexIds.sort(), [0, 2]);

  // dragging an already-pinned vertex leaves it pinned after release
  viewport.beginVertexDrag(0);
  assert.deepStrictEqual(system.vertices.fixedVertexIds.sort(), [0, 2]);
  viewport.endVertexDrag();
  assert.deepStrictEqual(system.vertices.fixedVertexIds.sort(), [0, 2]);
});