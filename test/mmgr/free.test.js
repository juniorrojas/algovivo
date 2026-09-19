import * as algovivo from "algovivo";

test("free adjacent slots", () => {
  const totalBytes = 100;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  expect(memoryManager.numFreeSlots()).toBe(1);
  expect(memoryManager.numReservedSlots()).toBe(0);
  expect(memoryManager.numFreeBytes()).toBe(100);
  expect(memoryManager.numReservedBytes()).toBe(0);

  const a = memoryManager.mallocBytes(10);
  const b = memoryManager.mallocBytes(20);
  const c = memoryManager.mallocBytes(30);

  expect(memoryManager.numFreeSlots()).toBe(1);
  expect(memoryManager.numReservedSlots()).toBe(3);
  expect(memoryManager.numFreeBytes()).toBe(40);
  expect(memoryManager.numReservedBytes()).toBe(60);

  // freeing a slot surrounded by reserved slots
  // leaves a separate free slot behind
  b.free();

  expect(memoryManager.numFreeSlots()).toBe(2);
  expect(memoryManager.numReservedSlots()).toBe(2);
  expect(memoryManager.numFreeBytes()).toBe(60);
  expect(memoryManager.numReservedBytes()).toBe(40);

  // freeing a slot adjacent to free slots
  // merges them into a single free slot
  c.free();

  expect(memoryManager.numFreeSlots()).toBe(1);
  expect(memoryManager.numReservedSlots()).toBe(1);
  expect(memoryManager.numFreeBytes()).toBe(90);
  expect(memoryManager.numReservedBytes()).toBe(10);

  a.free();

  expect(memoryManager.numFreeSlots()).toBe(1);
  expect(memoryManager.numReservedSlots()).toBe(0);
  expect(memoryManager.numFreeBytes()).toBe(100);
  expect(memoryManager.numReservedBytes()).toBe(0);
});
