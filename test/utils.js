const fsp = require("fs/promises");
const fs = require("fs");
const algovivo = require("algovivo");

function toBeCloseToArray(a, b, tolerance = 1e-3) {
  if ((typeof a == "number") && (typeof b == "number")) {
    if (Math.abs(a - b) <= tolerance) {
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
    const r = toBeCloseToArray(a[i], b[i], tolerance);
    if (!r.pass) return r;
  }

  return {
    pass: true
  };
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

module.exports = {
  loadWasm,
  loadTen,
  toBeCloseToArray,
  cleandir
};