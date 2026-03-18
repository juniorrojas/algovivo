const algovivo = require("algovivo");

test("malloc free with non-numeric heapBase", () => {
  // simulate WebAssembly.Global which has valueOf() but is an object
  const heapBase = { valueOf: () => 16 };
  const buffer = new ArrayBuffer(1024);
  const mgr = new algovivo.mmgrten.mmgr.MemoryManager(buffer, heapBase);

  const ptr = mgr.malloc(32);
  // WASM receives ptr coerced to i32, then passes it back as a number
  const numericPtr = Number(ptr);
  // this is what the WASM free import does
  mgr.free(numericPtr);
});
