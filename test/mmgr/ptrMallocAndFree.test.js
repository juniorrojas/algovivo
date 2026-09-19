import { mmgrten } from "algovivo";

const mmgr = mmgrten.mmgr;

test("malloc and free with pointers", () => {
  const arr = new ArrayBuffer(200);
  const mgr = new mmgr.MemoryManager(arr, 1);
  const ptr = mgr.malloc(3);
  expect(ptr).toBe(1);
  expect(mgr.numReservedBytes()).toBe(3);
  mgr.free(ptr);
  expect(mgr.numReservedBytes()).toBe(0);
});
