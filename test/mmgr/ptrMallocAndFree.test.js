import * as algovivo from "algovivo";

test("malloc and free with pointers", () => {
  const buffer = new ArrayBuffer(200);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer, 1);

  const ptr = memoryManager.malloc(3);
  expect(ptr).toBe(1);
  expect(memoryManager.numReservedBytes()).toBe(3);

  memoryManager.free(ptr);
  expect(memoryManager.numReservedBytes()).toBe(0);
});

test("free unknown pointer", () => {
  const buffer = new ArrayBuffer(200);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  expect(() => { memoryManager.free(123); }).toThrow();
});

test("free pointer twice", () => {
  const buffer = new ArrayBuffer(200);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const ptr = memoryManager.malloc(8);
  memoryManager.free(ptr);
  expect(() => { memoryManager.free(ptr); }).toThrow();
});
