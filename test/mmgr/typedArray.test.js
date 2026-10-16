import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";

test("typed array", () => {
  const totalBytes = 100;
  const buffer = new ArrayBuffer(totalBytes);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const a = memoryManager.malloc32(20);

  const f32a = a.f32();
  assert.ok(f32a instanceof Float32Array);
  assert.strictEqual(f32a.length, 20);

  const i32a = a.i32();
  assert.ok(i32a instanceof Int32Array);
  assert.strictEqual(i32a.length, 20);

  const u32a = a.u32();
  assert.ok(u32a instanceof Uint32Array);
  assert.strictEqual(u32a.length, 20);
});

test("typed array with misaligned size", () => {
  const buffer = new ArrayBuffer(100);
  const memoryManager = new algovivo.mmgrten.mmgr.MemoryManager(buffer);

  const a = memoryManager.mallocBytes(3);
  assert.throws(() => { a.f32(); });
});
