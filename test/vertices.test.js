const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("set vertices", async () => {
  const ten = await utils.loadTen();
  const vertices = new algovivo.Vertices({ ten });
  expect(vertices.numVertices).toBe(0);

  vertices.set([
    [0, 0],
    [3, 0],
    [2, 4]
  ]);

  expect(vertices.numVertices).toBe(3);
  expect(vertices.pos.toArray()).toBeCloseToArray([
    [0, 0],
    [3, 0],
    [2, 4]
  ]);
});

test("set system vertices", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  expect(system.numVertices).toBe(0);

  system.setVertices([
    [0, 0],
    [3, 0],
    [2, 4]
  ]);

  expect(system.numVertices).toBe(3);
  expect(system.pos.toArray()).toBeCloseToArray([
    [0, 0],
    [3, 0],
    [2, 4]
  ]);
});

test("add vertex", async () => {
  const ten = await utils.loadTen();
  const memoryManager = ten.mgr;

  const vertices = new algovivo.Vertices({ ten, spaceDim: 2 });
  expect(vertices.numVertices).toBe(0);

  expect(memoryManager.numReservedBytes()).toBe(0);

  vertices.addVertex({ pos: [1, 2], vel: [3, 4]});
  expect(vertices.numVertices).toBe(1);
  expect(vertices.pos.toArray()).toBeCloseToArray([[1, 2]]);
  expect(vertices.vel.toArray()).toBeCloseToArray([[3, 4]]);
  expect(memoryManager.numReservedBytes()).not.toBe(0);
  const reservedBytesForOneVertex = memoryManager.numReservedBytes();

  vertices.dispose();
  vertices.addVertex();
  expect(vertices.numVertices).toBe(1);
  expect(vertices.pos.toArray()).toBeCloseToArray([[0, 0]]);
  expect(vertices.vel.toArray()).toBeCloseToArray([[0, 0]]);
  expect(memoryManager.numReservedBytes()).toBe(reservedBytesForOneVertex);

  vertices.addVertex();
  expect(vertices.numVertices).toBe(2);
  expect(memoryManager.numReservedBytes()).toBeGreaterThan(reservedBytesForOneVertex);
  const reservedDataBytesForOneVertex = memoryManager.numReservedBytes() - reservedBytesForOneVertex;
  const reservedMetadataBytesForOneVertex = reservedBytesForOneVertex - reservedDataBytesForOneVertex;

  vertices.addVertex();
  expect(vertices.numVertices).toBe(3);
  expect(memoryManager.numReservedBytes()).toBe(reservedMetadataBytesForOneVertex + 3 * reservedDataBytesForOneVertex);

  vertices.dispose();
  expect(memoryManager.numReservedBytes()).toBe(0);
});