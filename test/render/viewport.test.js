import * as algovivo from "algovivo";
import * as utils from "../utils.js";

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

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
  expect(viewport.hitTestVertex([0, 0])).toBe(0);
  expect(viewport.hitTestVertex([1, 2])).toBe(1);
  expect(viewport.hitTestVertex([10, 20])).toBeNull();
  expect(viewport.hitTestVertex([1, 2], 100)).toBe(1);
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
  expect(system.vertices.fixedVertexIds).toEqual([]);

  // dragging a free vertex pins it and zeroes its velocity
  viewport.beginVertexDrag(1);
  expect(system.vertices.fixedVertexIds).toEqual([1]);
  expect(system.pos.toArray()).toBeCloseToArray([[5, 6], [11, 12]]);
  expect(system.vel.toArray()).toBeCloseToArray([[1, 2], [0, 0]]);

  // releasing the drag frees it again
  viewport.endVertexDrag();
  expect(system.vertices.fixedVertexIds).toEqual([]);
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
  expect(system.vertices.fixedVertexIds.sort()).toEqual([0, 1, 2]);

  // releasing frees only the dragged vertex; pre-pinned ones stay
  viewport.endVertexDrag();
  expect(system.vertices.fixedVertexIds.sort()).toEqual([0, 2]);

  // dragging an already-pinned vertex leaves it pinned after release
  viewport.beginVertexDrag(0);
  expect(system.vertices.fixedVertexIds.sort()).toEqual([0, 2]);
  viewport.endVertexDrag();
  expect(system.vertices.fixedVertexIds.sort()).toEqual([0, 2]);
});