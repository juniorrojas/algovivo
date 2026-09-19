import { mmgrten } from "algovivo";

const mmgr = mmgrten.mmgr;

test("reserve free slot", () => {
  const totalBytes = 100;
  const arr = new ArrayBuffer(totalBytes);
  const manager = new mmgr.MemoryManager(arr);

  expect(manager.numReservedSlots()).toBe(0);
  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.numReservedBytes()).toBe(0);
  expect(manager.numFreeBytes()).toBe(100);

  let freeSlot, reservedSlot;

  freeSlot = manager.slots.first.data;

  expect(freeSlot).toBeInstanceOf(mmgr.FreeSlot);
  expect(freeSlot.freeNode).not.toBeNull();

  reservedSlot = freeSlot.reserve(10);

  expect(manager.numReservedSlots()).toBe(1);
  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.slots.first.data).toBe(reservedSlot);
  expect(manager.numReservedBytes()).toBe(10);
  expect(manager.numFreeBytes()).toBe(90);
});
