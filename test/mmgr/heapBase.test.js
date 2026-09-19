import * as algovivo from "algovivo";

function setData(slot, data) {
  const arr = slot.u32();
  data.forEach((elem, i) => {
    arr[i] = elem;
  });
}

test("heap base", () => {
  const totalBytes = 15 * 4;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer, 2 * 4);

  expect(memoryManager.numFreeBytes()).toBe(13 * 4);
  expect(memoryManager.numReservedBytes()).toBe(0);

  const bufferU32 = new Uint32Array(buffer, 0, totalBytes / 4);

  const a = memoryManager.malloc32(3);

  expect(memoryManager.numFreeBytes()).toBe(10 * 4);
  expect(memoryManager.numReservedBytes()).toBe(3 * 4);

  // allocations start at the heap base,
  // leaving the memory before it untouched
  setData(a, [1, 2, 3]);
  expect(Array.from(bufferU32)).toEqual([
    0, 0, 1, 2, 3,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0
  ]);

  expect(() => { memoryManager.malloc32(11); }).toThrow();

  let b = memoryManager.malloc32(10);
  expect(memoryManager.numFreeBytes()).toBe(0);
  expect(memoryManager.numReservedBytes()).toBe(13 * 4);
  b.free();
  b = memoryManager.malloc32(2);

  setData(b, [11, 12]);
  expect(Array.from(bufferU32)).toEqual([
    0, 0, 1, 2, 3,
    11, 12, 0, 0, 0,
    0, 0, 0, 0, 0
  ]);
});
