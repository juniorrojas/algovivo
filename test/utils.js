import fsp from "fs/promises";
import fs from "fs";
import path from "path";
import assert from "node:assert";
import { fileURLToPath } from "url";
import * as algovivo from "algovivo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function assertCloseToArray(a, b, tolerance = 1e-3) {
  if ((typeof a == "number") && (typeof b == "number")) {
    assert.ok(Math.abs(a - b) <= tolerance, `not close enough, ${a} != ${b}`);
    return;
  }

  assert.ok(Array.isArray(a) && Array.isArray(b), `expected two arrays, found ${typeof a} and ${typeof b}`);
  assert.strictEqual(a.length, b.length, `length mismatch, ${a.length} != ${b.length}`);

  for (let i = 0; i < a.length; i++) {
    assertCloseToArray(a[i], b[i], tolerance);
  }
}

async function loadWasm(args = {}) {
  const wasm = await WebAssembly.compile(await fsp.readFile(__dirname + "/../build/algovivo.wasm"));
  const wasmInstance = await WebAssembly.instantiate(wasm, args);
  return wasmInstance;
}

async function loadTen() {
  const ten = new algovivo.mmgrten.Engine();
  const wasmInstance = await loadWasm();
  ten.init({ wasmInstance });
  return ten;
}

function fileExists(filename) {
  return new Promise((resolve, reject) => {
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (err) resolve(false);
      else resolve(true);
    });
  });
}

async function cleandir(dirname) {
  if (!await fileExists(dirname)) {
    await fsp.mkdir(dirname);
  } else {
    fs.rmSync(dirname, { recursive: true });
    await fsp.mkdir(dirname);
  }
}

export {
  loadWasm,
  loadTen,
  assertCloseToArray,
  cleandir
};
