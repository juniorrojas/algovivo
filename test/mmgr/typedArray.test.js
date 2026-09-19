import { mmgrten } from "algovivo";

const mmgr = mmgrten.mmgr;

test("typed array", () => {
  const totalBytes = 100;
  const arr = new ArrayBuffer(totalBytes);
  const manager = new mmgr.MemoryManager(arr);

  const a = manager.malloc32(20);

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
