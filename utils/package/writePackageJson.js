import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const libName = process.env.LIB_NAME ?? "algovivo";
const buildDirname = process.env.BUILD_DIRNAME ?? "build";

const outPath = process.argv[2];
if (outPath == null) throw new Error("out path required");

const pkg = {
  name: libName,
  type: "module",
  exports: {
    ".": {
      import: `./${buildDirname}/${libName}.js`,
      require: `./${buildDirname}/${libName}.cjs`
    },
    "./wasm": `./${buildDirname}/${libName}.wasm`
  }
};

const contents = `${JSON.stringify(pkg, null, 2)}\n`;
await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, contents);
console.log(contents);
