import terser from "@rollup/plugin-terser";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function listFiles(dirname) {
  return fs.readdirSync(dirname, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(dirname, entry.name);
    return entry.isDirectory() ? listFiles(filename) : [filename];
  });
}

function emitReleaseJson() {
  return {
    name: "emit-release-json",
    writeBundle() {
      const filenames = [
        "public/main.build.js",
        "public/algovivo.wasm",
        ...listFiles("public/data")
      ].sort();
      const hash = crypto.createHash("sha256");
      filenames.forEach((filename) => {
        hash.update(filename);
        hash.update(fs.readFileSync(filename));
      });
      const id = hash.digest("hex").slice(0, 12);
      fs.writeFileSync("./public/release.build.json", JSON.stringify({ id }));
    }
  };
}

export default {
  input: ["src/main.js"],
  output: {
    file: "public/main.build.js",
    format: "esm",
    sourcemap: false
  },
  plugins: [
    terser(),
    emitReleaseJson()
  ],
};