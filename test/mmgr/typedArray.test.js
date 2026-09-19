import * as algovivo from "algovivo";

test("typed array", () => {
  const totalBytes = 100;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const a = memoryManager.malloc32(20);

  const f32a = a.f32();
  expect(f32a).toBeInstanceOf(Float32Array);
  expect(f32a.length).toBe(20);

  const i32a = a.i32();
  expect(i32a).toBeInstanceOf(Int32Array);
  expect(i32a.length).toBe(20);

  const u32a = a.u32();
  expect(u32a).toBeInstanceOf(Uint32Array);
  expect(u32a.length).toBe(20);
});

test("typed array with misaligned size", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const a = memoryManager.mallocBytes(3);
  expect(() => { a.f32(); }).toThrow();
});
