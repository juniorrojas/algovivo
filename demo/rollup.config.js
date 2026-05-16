import terser from "@rollup/plugin-terser";
import crypto from "crypto";
import fs from "fs";

function emitReleaseJson() {
  return {
    name: "emit-release-json",
    writeBundle() {
      const bundle = fs.readFileSync("./public/main.build.js");
      const id = crypto.createHash("sha256").update(bundle).digest("hex").slice(0, 12);
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