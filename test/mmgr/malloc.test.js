import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";

test("mallocBytes", () => {
  const totalBytes = 100;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  assert.strictEqual(memoryManager.numFreeSlots(), 1);
  assert.strictEqual(memoryManager.numReservedSlots(), 0);
  assert.strictEqual(memoryManager.numFreeBytes(), 100);
  assert.strictEqual(memoryManager.numReservedBytes(), 0);

  const a = memoryManager.mallocBytes(10);
  assert.strictEqual(a.ptr, 0);

  assert.strictEqual(memoryManager.numFreeSlots(), 1);
  assert.strictEqual(memoryManager.numReservedSlots(), 1);
  assert.strictEqual(memoryManager.numFreeBytes(), 90);
  assert.strictEqual(memoryManager.numReservedBytes(), 10);

  const b = memoryManager.mallocBytes(30);
  assert.strictEqual(b.ptr, 10);

  assert.strictEqual(memoryManager.numFreeSlots(), 1);
  assert.strictEqual(memoryManager.numReservedSlots(), 2);
  assert.strictEqual(memoryManager.numFreeBytes(), 60);
  assert.strictEqual(memoryManager.numReservedBytes(), 40);
});

test("malloc32", () => {
  const totalBytes = 100;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const a = memoryManager.malloc32(10);
  assert.strictEqual(a.ptr, 0);

  assert.strictEqual(memoryManager.numFreeSlots(), 1);
  assert.strictEqual(memoryManager.numReservedSlots(), 1);
  assert.strictEqual(memoryManager.numFreeBytes(), 60);
  assert.strictEqual(memoryManager.numReservedBytes(), 40);
});

test("malloc out of memory", () => {
  const buffer = new ArrayBuffer(3);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);
  assert.throws(() => {
    memoryManager.malloc32(1);
  }, { message: "no free slot available for 4 bytes, largest free slot has 3 bytes" });
});

test("malloc non-integer size", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);
  assert.throws(() => { memoryManager.mallocBytes(undefined); });
  assert.throws(() => { memoryManager.mallocBytes(1.5); });
});

test("malloc negative size", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  assert.throws(() => { memoryManager.mallocBytes(-4); });
  assert.strictEqual(memoryManager.numReservedSlots(), 0);
  assert.strictEqual(memoryManager.numReservedBytes(), 0);
});
