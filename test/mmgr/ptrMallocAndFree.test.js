import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";

test("malloc and free with pointers", () => {
  const buffer = new ArrayBuffer(200);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer, 1);

  const ptr = memoryManager.malloc(3);
  assert.strictEqual(ptr, 1);
  assert.strictEqual(memoryManager.numReservedBytes(), 3);

  memoryManager.free(ptr);
  assert.strictEqual(memoryManager.numReservedBytes(), 0);
});

test("free unknown pointer", () => {
  const buffer = new ArrayBuffer(200);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  assert.throws(() => { memoryManager.free(123); });
});

test("free pointer twice", () => {
  const buffer = new ArrayBuffer(200);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const ptr = memoryManager.malloc(8);
  memoryManager.free(ptr);
  assert.throws(() => { memoryManager.free(ptr); });
});
