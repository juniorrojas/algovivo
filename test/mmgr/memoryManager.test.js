import * as algovivo from "algovivo";

test("malloc free with non-numeric heapBase", () => {
  // simulate WebAssembly.Global which has valueOf() but is an object
  const heapBase = { valueOf: () => 16 };
  const buffer = new ArrayBuffer(1024);
  const mgr = new algovivo.mmgrten.mmgr.MemoryManager(buffer, heapBase);

  const ptr = mgr.malloc(32);
  const numericPtr = Number(ptr);
  mgr.free(numericPtr);
});
