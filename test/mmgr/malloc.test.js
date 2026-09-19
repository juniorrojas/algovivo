import { mmgrten } from "algovivo";

const mmgr = mmgrten.mmgr;

test("mallocBytes", () => {
  const totalBytes = 100;
  const arr = new ArrayBuffer(totalBytes);
  const manager = new mmgr.MemoryManager(arr);

  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.numReservedSlots()).toBe(0);
  expect(manager.numFreeBytes()).toBe(100);
  expect(manager.numReservedBytes()).toBe(0);

  const a = manager.mallocBytes(10);
  expect(a.ptr).toBe(0);

  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.numReservedSlots()).toBe(1);
  expect(manager.numFreeBytes()).toBe(90);
  expect(manager.numReservedBytes()).toBe(10);

  const b = manager.mallocBytes(30);
  expect(b.ptr).toBe(10);

  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.numReservedSlots()).toBe(2);
  expect(manager.numFreeBytes()).toBe(60);
  expect(manager.numReservedBytes()).toBe(40);
});

test("malloc32", () => {
  const totalBytes = 100;
  const arr = new ArrayBuffer(totalBytes);
  const manager = new mmgr.MemoryManager(arr);

  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.numReservedSlots()).toBe(0);
  expect(manager.numFreeBytes()).toBe(100);
  expect(manager.numReservedBytes()).toBe(0);

  const a = manager.malloc32(10);
  expect(a.ptr).toBe(0);

  expect(manager.numFreeSlots()).toBe(1);
  expect(manager.numReservedSlots()).toBe(1);
  expect(manager.numFreeBytes()).toBe(60);
  expect(manager.numReservedBytes()).toBe(40);
});

test("OOM", () => {
  const arr = new ArrayBuffer(3);
  const manager = new mmgr.MemoryManager(arr);
  expect(() => { manager.malloc32(1); }).toThrow();
});

test("malloc undefined", () => {
  const totalBytes = 100;
  const arr = new ArrayBuffer(totalBytes);
  const manager = new mmgr.MemoryManager(arr);

  expect(() => { manager.mallocBytes(undefined) }).toThrow();
});
