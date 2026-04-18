module.exports = {
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/demo/"
  ],
  moduleNameMapper: {
    "^algovivo$": "<rootDir>/algovivo/index.js"
  },
  transform: {
    "\\.[jt]sx?$": ["babel-jest", {
      presets: [["@babel/preset-env", { targets: { node: "current" } }]]
    }]
  }
};
