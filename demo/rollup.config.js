import terser from "@rollup/plugin-terser";

export default {
  input: ["src/main.js"],
  output: {
    file: "public/main.build.js",
    format: "esm",
    sourcemap: false
  },
  plugins: [
    terser()
  ],
};