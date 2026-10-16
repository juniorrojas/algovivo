import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";

test("malloc free with non-numeric heapBase", () => {
  // simulate WebAssembly.Global which has valueOf() but is an object
  const heapBase = { valueOf: () => 16 };
  const buffer = new ArrayBuffer(1024);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer, heapBase);

  assert.strictEqual(memoryManager.numFreeBytes(), buffer.byteLength - 16);

  const ptr = memoryManager.malloc(32);
  assert.strictEqual(typeof ptr, "number");
  assert.ok(ptr >= 16);
  assert.strictEqual(memoryManager.numReservedSlots(), 1);
  assert.strictEqual(memoryManager.numFreeBytes(), buffer.byteLength - 16 - 32);

  memoryManager.free(Number(ptr));
  assert.strictEqual(memoryManager.numReservedSlots(), 0);
  assert.strictEqual(memoryManager.numFreeBytes(), buffer.byteLength - 16);
});
