import * as algovivo from "algovivo";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

let failed = false;
function check(name, ok, detail = "") {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail == "" ? "" : ` ${detail}`}`);
  if (!ok) failed = true;
}

// walk up from a resolvable subpath, since exports need not expose package.json
let pkgDirname = path.dirname(new URL(import.meta.resolve("algovivo/wasm")).pathname);
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
  check(`exports target exists`, exists, target);
}

check("esm import", typeof algovivo.System == "function");
check("cjs require", typeof require("algovivo").System == "function");

const wasmBytes = await readFile(new URL(import.meta.resolve("algovivo/wasm")));
check(
  "wasm subpath is wasm",
  wasmBytes[0] == 0x00 && wasmBytes[1] == 0x61 && wasmBytes[2] == 0x73 && wasmBytes[3] == 0x6d,
  `${wasmBytes.length} bytes`
);

const wasmInstance = await WebAssembly.instantiate(await WebAssembly.compile(wasmBytes), {});
check("js binds to wasm", new algovivo.System({ wasmInstance }).numVertices == 0);

if (failed) process.exit(1);
