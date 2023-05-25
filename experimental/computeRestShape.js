import algovivo from "algovivo";
import fsp from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";
import argparse from "argparse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadWasm() {
  const wasmFilename = __dirname + "/node_modules/algovivo/build/algovivo.wasm";
  const wasm = await WebAssembly.compile(await fsp.readFile(wasmFilename));
  const wasmInstance = await WebAssembly.instantiate(wasm);
  return wasmInstance;
}

async function main() {
  const argParser = argparse.ArgumentParser();
  argParser.addArgument("input");
  const args = argParser.parseArgs();

  const wasmInstance = await loadWasm();
  const system = new algovivo.System({ wasmInstance });

  // const filename = __dirname + "/data/sample.json";
  const filename = args.input;

  const meshData = JSON.parse((await fsp.readFile(filename)).toString());
  system.set({
    x: meshData.x,
    springs: meshData.springs,
    triangles: meshData.triangles
  });
  console.log(`vertices: ${system.numVertices()}`);
  console.log(`springs: ${system.numSprings()}`);
  console.log(`triangles: ${system.numTriangles()}`);
  meshData.l0 = system.l0.toArray();
  meshData.rsi = system.rsi.toArray();
  const outputFilename = __dirname + "/mesh.out.json";
  await fsp.writeFile(outputFilename, JSON.stringify(meshData));
  console.log(`saved to ${outputFilename}`);
}

main();