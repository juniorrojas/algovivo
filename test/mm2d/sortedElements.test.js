const mm2d = require("algovivo").mm2d;

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

  expect(sortedElements.length).toBe(4);

  expect(sortedElements[0].order).toEqual(3);
  expect(sortedElements[0].vertexIds).toEqual([0, 1, 2]);

  expect(sortedElements[1].order).toEqual(1);
  expect(sortedElements[1].id).toEqual(0);

  expect(sortedElements[2].order).toEqual(1);
  expect(sortedElements[2].id).toEqual(1);

  expect(sortedElements[3].order).toEqual(1);
  expect(sortedElements[3].id).toEqual(2);
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

  expect(sortedElements.length).toBe(5);

  expect(sortedElements[0].order).toEqual(3);
  expect(sortedElements[0].vertexIds).toEqual([0, 1, 2]);

  expect(sortedElements[1].order).toEqual(2);
  expect(sortedElements[1].vertexIds).toEqual([0, 2]);

  expect(sortedElements[2].order).toEqual(1);
  expect(sortedElements[2].id).toEqual(0);

  expect(sortedElements[3].order).toEqual(1);
  expect(sortedElements[3].id).toEqual(1);

  expect(sortedElements[4].order).toEqual(1);
  expect(sortedElements[4].id).toEqual(2);
});