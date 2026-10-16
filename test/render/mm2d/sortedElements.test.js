import { test } from "node:test";
import assert from "node:assert";
import { mm2d } from "algovivo";

test("sorted triangles", () => {
  const triangles = [
    [0, 1, 2]
  ];

  const sortedVertexIds = [
    0, 1, 2
  ];

  const sortedElements = mm2d.sorted.makeSortedElements({
    triangles,
    sortedVertexIds,
    edges: []
  });

  assert.strictEqual(sortedElements.length, 4);

  assert.deepStrictEqual(sortedElements[0].order, 3);
  assert.deepStrictEqual(sortedElements[0].vertexIds, [0, 1, 2]);

  assert.deepStrictEqual(sortedElements[1].order, 1);
  assert.deepStrictEqual(sortedElements[1].id, 0);

  assert.deepStrictEqual(sortedElements[2].order, 1);
  assert.deepStrictEqual(sortedElements[2].id, 1);

  assert.deepStrictEqual(sortedElements[3].order, 1);
  assert.deepStrictEqual(sortedElements[3].id, 2);
});

test("sorted triangles and edges", () => {
  const triangles = [
    [0, 1, 2]
  ];

  const edges = [
    [0, 2]
  ];

  const sortedVertexIds = [
    0, 1, 2
  ];

  const sortedElements = mm2d.sorted.makeSortedElements({
    sortedVertexIds: sortedVertexIds,
    triangles: triangles,
    edges: edges
  });

  assert.strictEqual(sortedElements.length, 5);

  assert.deepStrictEqual(sortedElements[0].order, 3);
  assert.deepStrictEqual(sortedElements[0].vertexIds, [0, 1, 2]);

  assert.deepStrictEqual(sortedElements[1].order, 2);
  assert.deepStrictEqual(sortedElements[1].vertexIds, [0, 2]);

  assert.deepStrictEqual(sortedElements[2].order, 1);
  assert.deepStrictEqual(sortedElements[2].id, 0);

  assert.deepStrictEqual(sortedElements[3].order, 1);
  assert.deepStrictEqual(sortedElements[3].id, 1);

  assert.deepStrictEqual(sortedElements[4].order, 1);
  assert.deepStrictEqual(sortedElements[4].id, 2);
});