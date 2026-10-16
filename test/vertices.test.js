import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";
import * as utils from "./utils.js";

test("set vertices", async () => {
  const ten = await utils.loadTen();
  const vertices = new algovivo.Vertices({ ten });
  assert.strictEqual(vertices.numVertices, 0);

  vertices.set([
    [0, 0],
    [3, 0],
    [2, 4]
  ]);

  assert.strictEqual(vertices.numVertices, 3);
  utils.assertCloseToArray(vertices.pos.toArray(), [
    [0, 0],
    [3, 0],
    [2, 4]
  ]);
});

test("set system vertices", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  assert.strictEqual(system.numVertices, 0);

  system.setVertices([
    [0, 0],
    [3, 0],
    [2, 4]
  ]);

  assert.strictEqual(system.numVertices, 3);
  utils.assertCloseToArray(system.pos.toArray(), [
    [0, 0],
    [3, 0],
    [2, 4]
  ]);
});

test("fix vertices", async () => {
  const ten = await utils.loadTen();
  const vertices = new algovivo.Vertices({ ten });
  vertices.set([
    [0, 0],
    [1, 0],
    [2, 0]
  ]);

  assert.strictEqual(vertices.numFixedVertices, 0);
  assert.deepStrictEqual(vertices.fixedVertexIds, []);
  assert.strictEqual(vertices.fixedVertexId, -1);

  vertices.fixVertex(1);
  assert.strictEqual(vertices.numFixedVertices, 1);
  assert.deepStrictEqual(vertices.fixedVertexIds, [1]);
  assert.strictEqual(vertices.fixedVertexId, 1);

  vertices.fixVertices([0, 2]);
  assert.strictEqual(vertices.numFixedVertices, 2);
  assert.deepStrictEqual(vertices.fixedVertexIds, [0, 2]);
  assert.strictEqual(vertices.fixedVertexId, 0);

  vertices.freeVertices();
  assert.strictEqual(vertices.numFixedVertices, 0);
  assert.deepStrictEqual(vertices.fixedVertexIds, []);
  assert.strictEqual(vertices.fixedVertexId, -1);

  vertices.dispose();
});

test("add vertex", async () => {
  const ten = await utils.loadTen();
  const memoryManager = ten.memoryManager;

  const vertices = new algovivo.Vertices({ ten, spaceDim: 2 });
  assert.strictEqual(vertices.numVertices, 0);

  assert.strictEqual(memoryManager.numReservedBytes(), 0);

  vertices.addVertex({ pos: [1, 2], vel: [3, 4]});
  assert.strictEqual(vertices.numVertices, 1);
  utils.assertCloseToArray(vertices.pos.toArray(), [[1, 2]]);
  utils.assertCloseToArray(vertices.vel.toArray(), [[3, 4]]);
  assert.notStrictEqual(memoryManager.numReservedBytes(), 0);
  const reservedBytesForOneVertex = memoryManager.numReservedBytes();

  vertices.setVertexPos(0, [11, 22]);
  utils.assertCloseToArray(vertices.pos.toArray(), [[11, 22]]);

  vertices.dispose();
  vertices.addVertex();
  assert.strictEqual(vertices.numVertices, 1);
  utils.assertCloseToArray(vertices.pos.toArray(), [[0, 0]]);
  utils.assertCloseToArray(vertices.vel.toArray(), [[0, 0]]);
  assert.strictEqual(memoryManager.numReservedBytes(), reservedBytesForOneVertex);

  vertices.addVertex();
  assert.strictEqual(vertices.numVertices, 2);
  assert.ok(memoryManager.numReservedBytes() > reservedBytesForOneVertex);
  const reservedDataBytesForOneVertex = memoryManager.numReservedBytes() - reservedBytesForOneVertex;
  const reservedMetadataBytesForOneVertex = reservedBytesForOneVertex - reservedDataBytesForOneVertex;

  vertices.addVertex();
  assert.strictEqual(vertices.numVertices, 3);
  assert.strictEqual(memoryManager.numReservedBytes(), reservedMetadataBytesForOneVertex + 3 * reservedDataBytesForOneVertex);

  vertices.dispose();
  assert.strictEqual(memoryManager.numReservedBytes(), 0);
});