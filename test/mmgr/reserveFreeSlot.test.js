import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";

test("reserve free slot", () => {
  const totalBytes = 100;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  assert.strictEqual(memoryManager.numReservedSlots(), 0);
  assert.strictEqual(memoryManager.numFreeSlots(), 1);
  assert.strictEqual(memoryManager.numReservedBytes(), 0);
  assert.strictEqual(memoryManager.numFreeBytes(), 100);

  const freeSlot = memoryManager.slots.first.data;
  assert.ok(freeSlot instanceof algovivo.mmgrten.mmgr.FreeSlot);
  assert.notStrictEqual(freeSlot.freeNode, null);

  const reservedSlot = freeSlot.reserve(10);
  assert.ok(reservedSlot instanceof algovivo.mmgrten.mmgr.ReservedSlot);

  assert.strictEqual(memoryManager.numReservedSlots(), 1);
  assert.strictEqual(memoryManager.numFreeSlots(), 1);
  assert.strictEqual(memoryManager.slots.first.data, reservedSlot);
  assert.strictEqual(memoryManager.numReservedBytes(), 10);
  assert.strictEqual(memoryManager.numFreeBytes(), 90);
});

test("reserve more bytes than available", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const freeSlot = memoryManager.slots.first.data;
  assert.throws(() => { freeSlot.reserve(101); });
});

test("removed slot releases its nodes", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const a = memoryManager.mallocBytes(10);
  assert.notStrictEqual(a.node, null);
  assert.notStrictEqual(a.reservedNode, null);

  a.free();
  assert.strictEqual(a.node, null);
  assert.strictEqual(a.reservedNode, null);
});
