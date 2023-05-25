import algovivo from "algovivo";
import fsp from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadWasm() {
  const wasmFilename = __dirname + "/node_modules/algovivo/build/algovivo.wasm";
  const wasm = await WebAssembly.compile(await fsp.readFile(wasmFilename));
  const wasmInstance = await WebAssembly.instantiate(wasm);
  return wasmInstance;
}

async function main() {
  const wasmInstance = await loadWasm();
  const system = new algovivo.System({ wasmInstance });
  
  const filename = __dirname + "/data/sample.json";
  const meshData = JSON.parse((await fsp.readFile(filename)).toString());
  system.set({
    x: meshData.x,
    springs: meshData.springs,
    triangles: meshData.triangles
  });
  console.log(system.l0.toArray());
  console.log(system.rsi.toArray());
}

main();