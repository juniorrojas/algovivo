import fsp from "fs/promises";

export async function loadWasm(args = {}) {
  const wasm = await WebAssembly.compile(await fsp.readFile(__dirname + "/../public/algovivo.wasm"));
  const wasmInstance = await WebAssembly.instantiate(wasm, args);
  return wasmInstance;
}