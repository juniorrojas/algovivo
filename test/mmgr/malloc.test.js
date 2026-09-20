import * as algovivo from "algovivo";

test("mallocBytes", () => {
  const totalBytes = 100;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  expect(memoryManager.numFreeSlots()).toBe(1);
  expect(memoryManager.numReservedSlots()).toBe(0);
  expect(memoryManager.numFreeBytes()).toBe(100);
  expect(memoryManager.numReservedBytes()).toBe(0);

  const a = memoryManager.mallocBytes(10);
  expect(a.ptr).toBe(0);

  expect(memoryManager.numFreeSlots()).toBe(1);
  expect(memoryManager.numReservedSlots()).toBe(1);
  expect(memoryManager.numFreeBytes()).toBe(90);
  expect(memoryManager.numReservedBytes()).toBe(10);

  const b = memoryManager.mallocBytes(30);
  expect(b.ptr).toBe(10);

  expect(memoryManager.numFreeSlots()).toBe(1);
  expect(memoryManager.numReservedSlots()).toBe(2);
  expect(memoryManager.numFreeBytes()).toBe(60);
  expect(memoryManager.numReservedBytes()).toBe(40);
});

test("malloc32", () => {
  const totalBytes = 100;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const a = memoryManager.malloc32(10);
  expect(a.ptr).toBe(0);

  expect(memoryManager.numFreeSlots()).toBe(1);
  expect(memoryManager.numReservedSlots()).toBe(1);
  expect(memoryManager.numFreeBytes()).toBe(60);
  expect(memoryManager.numReservedBytes()).toBe(40);
});

test("malloc out of memory", () => {
  const buffer = new ArrayBuffer(3);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);
  expect(() => {
    memoryManager.malloc32(1);
  }).toThrow("no free slot available for 4 bytes, largest free slot has 3 bytes");
});

test("malloc non-integer size", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);
  expect(() => { memoryManager.mallocBytes(undefined); }).toThrow();
  expect(() => { memoryManager.mallocBytes(1.5); }).toThrow();
});

test("malloc negative size", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  expect(() => { memoryManager.mallocBytes(-4); }).toThrow();
  expect(memoryManager.numReservedSlots()).toBe(0);
  expect(memoryManager.numReservedBytes()).toBe(0);
});
