import * as algovivo from "algovivo";

test("reserve free slot", () => {
  const totalBytes = 100;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  expect(memoryManager.numReservedSlots()).toBe(0);
  expect(memoryManager.numFreeSlots()).toBe(1);
  expect(memoryManager.numReservedBytes()).toBe(0);
  expect(memoryManager.numFreeBytes()).toBe(100);

  const freeSlot = memoryManager.slots.first.data;
  expect(freeSlot).toBeInstanceOf(algovivo.mmgrten.mmgr.FreeSlot);
  expect(freeSlot.freeNode).not.toBeNull();

  const reservedSlot = freeSlot.reserve(10);
  expect(reservedSlot).toBeInstanceOf(algovivo.mmgrten.mmgr.ReservedSlot);

  expect(memoryManager.numReservedSlots()).toBe(1);
  expect(memoryManager.numFreeSlots()).toBe(1);
  expect(memoryManager.slots.first.data).toBe(reservedSlot);
  expect(memoryManager.numReservedBytes()).toBe(10);
  expect(memoryManager.numFreeBytes()).toBe(90);
});

test("reserve more bytes than available", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const freeSlot = memoryManager.slots.first.data;
  expect(() => { freeSlot.reserve(101); }).toThrow();
});

test("removed slot releases its nodes", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const a = memoryManager.mallocBytes(10);
  expect(a.node).not.toBeNull();
  expect(a.reservedNode).not.toBeNull();

  a.free();
  expect(a.node).toBeNull();
  expect(a.reservedNode).toBeNull();
});
