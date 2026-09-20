import * as algovivo from "algovivo";

test("malloc free with non-numeric heapBase", () => {
  // simulate WebAssembly.Global which has valueOf() but is an object
  const heapBase = { valueOf: () => 16 };
  const buffer = new ArrayBuffer(1024);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer, heapBase);

  expect(memoryManager.numFreeBytes()).toBe(buffer.byteLength - 16);

  const ptr = memoryManager.malloc(32);
  expect(typeof ptr).toBe("number");
  expect(ptr).toBeGreaterThanOrEqual(16);
  expect(memoryManager.numReservedSlots()).toBe(1);
  expect(memoryManager.numFreeBytes()).toBe(buffer.byteLength - 16 - 32);

  memoryManager.free(Number(ptr));
  expect(memoryManager.numReservedSlots()).toBe(0);
  expect(memoryManager.numFreeBytes()).toBe(buffer.byteLength - 16);
});
