import algovivo from "algovivo";
import fsp from "fs/promises";

async function loadWasm() {
  const wasm = await WebAssembly.compile(await fsp.readFile(__dirname + "/../build/algovivo.wasm"));
  const wasmInstance = await WebAssembly.instantiate(wasm);
  return wasmInstance;
}

async function main() {
  const wasmInstance = await loadWasm();
  const system = new algovivo.System({ wasmInstance });
  console.log(system.numVertices());
}

main();