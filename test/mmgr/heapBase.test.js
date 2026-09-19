import { mmgrten } from "algovivo";

const mmgr = mmgrten.mmgr;

function setData(slot, data) {
  const arr = slot.u32();
  data.forEach((elem, i) => {
    arr[i] = elem;
  });
}

test("heap base", () => {
  const totalBytes = 15 * 4;
  const arr = new ArrayBuffer(totalBytes);
  const memoryManager = new mmgr.MemoryManager(arr, 2 * 4);

  expect(memoryManager.numFreeBytes()).toBe(13 * 4);
  expect(memoryManager.numReservedBytes()).toBe(0);

  const arrU32 = new Uint32Array(arr, 0, totalBytes / 4);

  const a = memoryManager.malloc32(3);

  expect(memoryManager.numFreeBytes()).toBe(10 * 4);
  expect(memoryManager.numReservedBytes()).toBe(3 * 4);

  setData(a, [1, 2, 3]);
  expect(Array.from(arrU32)).toEqual([
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
  expect(Array.from(arrU32)).toEqual([
    0, 0, 1, 2, 3,
    11, 12, 0, 0, 0,
    0, 0, 0, 0, 0
  ]);
});
