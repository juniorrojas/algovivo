import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";
import * as utils from "./utils.js";

test("memory", async () => {
  const system = new algovivo.System({
    wasmInstance: await utils.loadWasm()
  });
  const memoryManager = system.ten.memoryManager;

  assert.strictEqual(system.numVertices, 0);
  assert.strictEqual(system.numMuscles, 0);
  assert.strictEqual(system.numTriangles, 0);

  const meshData = {
    pos: [
      [0, 0],
      [1, 0],
      [1, 1]
    ],
    triangles: [
      [0, 1, 2]
    ],
    muscles: [
      [0, 1],
      [2, 1]
    ]
  };

  assert.strictEqual(memoryManager.numReservedBytes(), 0);
  system.set(meshData);
  assert.notStrictEqual(memoryManager.numReservedBytes(), 0);
  const reservedBytes = memoryManager.numReservedBytes();
  assert.strictEqual(system.numVertices, 3);
  assert.strictEqual(system.numTriangles, 1);
  assert.strictEqual(system.numMuscles, 2);
  
  // updating the mesh again with the same data
  // should not allocate any new memory
  system.set(meshData);
  assert.strictEqual(memoryManager.numReservedBytes(), reservedBytes);
  assert.strictEqual(system.numVertices, 3);
  assert.strictEqual(system.numTriangles, 1);
  assert.strictEqual(system.numMuscles, 2);

  // free memory
  system.dispose();
  assert.strictEqual(memoryManager.numReservedBytes(), 0);
  assert.strictEqual(system.numVertices, 0);
  assert.strictEqual(system.numTriangles, 0);
  assert.strictEqual(system.numMuscles, 0);
  
  // reset data
  system.set(meshData);
  assert.strictEqual(memoryManager.numReservedBytes(), reservedBytes);
  assert.strictEqual(system.numVertices, 3);
  assert.strictEqual(system.numTriangles, 1);
  assert.strictEqual(system.numMuscles, 2);
});