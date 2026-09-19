import * as algovivo from "algovivo";

test("malloc free with non-numeric heapBase", () => {
  // simulate WebAssembly.Global which has valueOf() but is an object
  const heapBase = { valueOf: () => 16 };
  const buffer = new ArrayBuffer(1024);
  const mgr = new algovivo.mmgrten.mmgr.MemoryManager(buffer, heapBase);

  expect(mgr.numFreeBytes()).toBe(buffer.byteLength - 16);

  const ptr = mgr.malloc(32);
  expect(typeof ptr).toBe("number");
  expect(ptr).toBeGreaterThanOrEqual(16);
  expect(mgr.numReservedSlots()).toBe(1);
  expect(mgr.numFreeBytes()).toBe(buffer.byteLength - 16 - 32);

  mgr.free(Number(ptr));
  expect(mgr.numReservedSlots()).toBe(0);
  expect(mgr.numFreeBytes()).toBe(buffer.byteLength - 16);
});
