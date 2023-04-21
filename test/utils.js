const fsp = require("fs/promises");

function toBeCloseToArray(a, b) {
  if ((typeof a == "number") && (typeof b == "number")) {
    if (Math.abs(a - b) <= 1e-3) {
      return {
        pass: true,
      };
    }
    return {
      pass: false,
      message: () => `not close enough, ${a} != ${b}`
    };
  }

  if (!Array.isArray(a) || !Array.isArray(b)) {
    return {
      pass: false,
      message: () => `expected two arrays, found ${typeof a} and ${typeof b}`
    };
  }

  if (a.length != b.length) {
    return {
      pass: false,
      message: () => `length mismatch, ${a.length} != ${b.length}`
    };
  }

  for (let i = 0; i < a.length; i++) {
    const r = toBeCloseToArray(a[i], b[i]);
    if (!r.pass) return r;
  }

  return {
    pass: true
  };
}

async function loadWasm() {
  const wasm = await WebAssembly.compile(await fsp.readFile(__dirname + "/../build/algovivo.wasm"));
  const wasmInstance = await WebAssembly.instantiate(wasm);
  return wasmInstance;
}

module.exports = {
  loadWasm,
  toBeCloseToArray
};