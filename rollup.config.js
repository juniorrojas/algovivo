import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

function header() {
  return {
    renderChunk(code) {
      return `/**
 * algovivo
 * (c) 2023 Junior Rojas
 * License: MIT
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
      file: `build/algovivo.module${minified ? ".min": ""}.js`,
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