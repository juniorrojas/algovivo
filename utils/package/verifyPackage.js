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

async function attempt(fn) {
  try {
    return { value: await fn() };
  } catch (err) {
    return { error: err.message };
  }
}

// walk up from a resolvable subpath, since exports need not expose package.json
const wasmUrl = await attempt(() => import.meta.resolve("algovivo/wasm"));
if (wasmUrl.error != null) {
  check("wasm subpath resolves", false, wasmUrl.error);
  process.exit(1);
}
let pkgDirname = path.dirname(fileURLToPath(wasmUrl.value));
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

const esm = await attempt(() => import("algovivo"));
check("esm import", typeof esm.value?.System == "function", esm.error ?? "");

const cjs = await attempt(() => require("algovivo"));
check("cjs require", typeof cjs.value?.System == "function", cjs.error ?? "");

const wasmBytes = await attempt(() => readFile(fileURLToPath(wasmUrl.value)));
check(
  "wasm subpath is wasm",
  wasmBytes.value != null &&
    wasmBytes.value[0] == 0x00 && wasmBytes.value[1] == 0x61 &&
    wasmBytes.value[2] == 0x73 && wasmBytes.value[3] == 0x6d,
  wasmBytes.error ?? `${wasmBytes.value.length} bytes`
);

const binding = await attempt(async () => {
  if (esm.value == null || wasmBytes.value == null) throw new Error("skipped, prior check failed");
  const wasmInstance = await WebAssembly.instantiate(await WebAssembly.compile(wasmBytes.value), {});
  return new esm.value.System({ wasmInstance }).numVertices;
});
check("js binds to wasm", binding.value === 0, binding.error ?? "");

if (failed) process.exit(1);
