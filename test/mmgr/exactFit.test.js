import * as algovivo from "algovivo";

test("exact fit leaves no empty free slot", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  memoryManager.mallocBytes(100);

  expect(memoryManager.numFreeBytes()).toBe(0);
  expect(memoryManager.numFreeSlots()).toBe(0);
});

test("refilling holes leaves no empty free slots", () => {
  const buffer = new ArrayBuffer(200);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const slots = [];
  for (let i = 0; i < 10; i++) slots.push(memoryManager.mallocBytes(20));
  for (let i = 0; i < 10; i += 2) slots[i].free();
  for (let i = 0; i < 10; i += 2) memoryManager.mallocBytes(20);

  expect(memoryManager.numFreeBytes()).toBe(0);
  expect(memoryManager.numFreeSlots()).toBe(0);
  expect(memoryManager.slots.size).toBe(10);
});

test("nothing is reserved past the end of the buffer", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  memoryManager.mallocBytes(100);

  // with no empty free slot left, a 0-byte request has nothing to match
  expect(() => { memoryManager.mallocBytes(0); }).toThrow();
});
