import { mmgrten } from "algovivo";

const mmgr = mmgrten.mmgr;

test("free", () => {
  const totalBytes = 100;
  const arr = new ArrayBuffer(totalBytes);
  const manager = new mmgr.MemoryManager(arr);

  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.numReservedSlots()).toBe(0);
  expect(manager.numFreeBytes()).toBe(100);
  expect(manager.numReservedBytes()).toBe(0);

  const a = manager.mallocBytes(10);
  const b = manager.mallocBytes(20);
  const c = manager.mallocBytes(30);

  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.numReservedSlots()).toBe(3);
  expect(manager.numFreeBytes()).toBe(40);
  expect(manager.numReservedBytes()).toBe(60);

  b.free();

  expect(manager.numFreeSlots()).toBe(2);
  expect(manager.numReservedSlots()).toBe(2);
  expect(manager.numFreeBytes()).toBe(60);
  expect(manager.numReservedBytes()).toBe(40);

  c.free();

  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.numReservedSlots()).toBe(1);
  expect(manager.numFreeBytes()).toBe(90);
  expect(manager.numReservedBytes()).toBe(10);

  a.free();

  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.numReservedSlots()).toBe(0);
  expect(manager.numFreeBytes()).toBe(100);
  expect(manager.numReservedBytes()).toBe(0);
});
