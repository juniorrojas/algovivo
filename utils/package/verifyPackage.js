import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

let failed = false;
function check(name, ok, detail = "") {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail == "" ? "" : ` ${detail}`}`);
  if (!ok) failed = true;
}

async function tryLoad(name, fn) {
  try {
    const value = await fn();
    check(name, true);
    return value;
  } catch (err) {
    check(name, false, err.message);
    return null;
  }
}

let wasmUrl = null;
try {
  wasmUrl = import.meta.resolve("algovivo/wasm");
} catch (err) {
  check("algovivo/wasm resolves", false, err.message);
  process.exit(1);
}

// package.json is not in exports, so walk up from the resolved .wasm path
let pkgDirname = path.dirname(fileURLToPath(wasmUrl));
while (!existsSync(path.join(pkgDirname, "package.json"))) {
  const parent = path.dirname(pkgDirname);
  if (parent == pkgDirname) throw new Error("package.json not found");
  pkgDirname = parent;
}
const pkg = JSON.parse(await readFile(path.join(pkgDirname, "package.json"), "utf8"));

check("name", pkg.name == "algovivo", pkg.name);
check("type", pkg.type == "module", pkg.type);

const targets = [];
function collectTargets(node) {
  if (typeof node == "string") targets.push(node);
  else if (node != null) Object.values(node).forEach(collectTargets);
}
collectTargets(pkg.exports);
check("exports not empty", targets.length > 0, `${targets.length} targets`);

for (const target of targets) {
  let exists = false;
  try {
    exists = (await stat(path.join(pkgDirname, target))).isFile();
  } catch {}
  check(`exports target exists ${target}`, exists);
}

const esm = await tryLoad("esm import", async () => {
  const lib = await import("algovivo");
  if (typeof lib.System != "function") throw new Error("System not exported");
  return lib;
});

await tryLoad("cjs require", () => {
  const lib = require("algovivo");
  if (typeof lib.System != "function") throw new Error("System not exported");
  return lib;
});

const wasmBytes = await readFile(fileURLToPath(wasmUrl));
check(
  "algovivo/wasm is a .wasm file",
  wasmBytes[0] == 0x00 && wasmBytes[1] == 0x61 && wasmBytes[2] == 0x73 && wasmBytes[3] == 0x6d,
  `${wasmBytes.length} bytes`
);

await tryLoad("js binds to .wasm", async () => {
  const wasmInstance = await WebAssembly.instantiate(await WebAssembly.compile(wasmBytes), {});
  const system = new esm.System({ wasmInstance });
  if (system.numVertices != 0) throw new Error(`numVertices ${system.numVertices}`);
  return system;
});

if (failed) process.exit(1);
