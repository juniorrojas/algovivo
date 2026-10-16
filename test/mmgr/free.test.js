import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";

test("free adjacent slots", () => {
  const totalBytes = 100;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  assert.strictEqual(memoryManager.numFreeSlots(), 1);
  assert.strictEqual(memoryManager.numReservedSlots(), 0);
  assert.strictEqual(memoryManager.numFreeBytes(), 100);
  assert.strictEqual(memoryManager.numReservedBytes(), 0);

  const a = memoryManager.mallocBytes(10);
  const b = memoryManager.mallocBytes(20);
  const c = memoryManager.mallocBytes(30);

  assert.strictEqual(memoryManager.numFreeSlots(), 1);
  assert.strictEqual(memoryManager.numReservedSlots(), 3);
  assert.strictEqual(memoryManager.numFreeBytes(), 40);
  assert.strictEqual(memoryManager.numReservedBytes(), 60);

  // freeing a slot surrounded by reserved slots
  // leaves a separate free slot behind
  b.free();

  assert.strictEqual(memoryManager.numFreeSlots(), 2);
  assert.strictEqual(memoryManager.numReservedSlots(), 2);
  assert.strictEqual(memoryManager.numFreeBytes(), 60);
  assert.strictEqual(memoryManager.numReservedBytes(), 40);

  // freeing a slot adjacent to free slots
  // merges them into a single free slot
  c.free();

  assert.strictEqual(memoryManager.numFreeSlots(), 1);
  assert.strictEqual(memoryManager.numReservedSlots(), 1);
  assert.strictEqual(memoryManager.numFreeBytes(), 90);
  assert.strictEqual(memoryManager.numReservedBytes(), 10);

  a.free();

  assert.strictEqual(memoryManager.numFreeSlots(), 1);
  assert.strictEqual(memoryManager.numReservedSlots(), 0);
  assert.strictEqual(memoryManager.numFreeBytes(), 100);
  assert.strictEqual(memoryManager.numReservedBytes(), 0);
});
