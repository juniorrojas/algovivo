module.exports = {
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/demo/"
  ],
  transform: {
    "\\.[jt]sx?$": ["babel-jest", {
      presets: [["@babel/preset-env", { targets: { node: "current" } }]]
    }]
  }
};
