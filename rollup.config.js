import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

function header() {
  return {
    renderChunk(code) {
      const commitSha = execSync("git rev-parse HEAD").toString().trim();
      const buildInfo = `Built from commit ${commitSha}`;
      return `/**
 * algovivo
 * (c) 2023 Junior Rojas
 * License: MIT
 * 
 * ${buildInfo}
 */
${code}`;
    }
  };
}

const configs = [];

for (let minified of [true, false]) {
  configs.push({
    input: "algovivo/index.js",
    output: {
      file: `build/algovivo${minified ? ".min": ""}.js`,
      format: "umd",
      name: "algovivo",
      sourcemap: false
    },
    plugins: [
      resolve(),
      commonjs(),
      ...(minified ? [terser()] : []),
      header(),
    ]
  });
}

for (let minified of [true, false]) {
  configs.push({
    input: "algovivo/index.js",
    output: {
      file: `build/algovivo${minified ? ".min": ""}.mjs`,
      format: "esm",
      sourcemap: false
    },
    plugins: [
      resolve(),
      commonjs(),
      ...(minified ? [terser()] : []),
      header()
    ]
  });
}

export default configs;