module.exports = {
  Window: require("./Window")
}

function mergeModule(name) {
  const m = require(name);
  for (let k in m) {
    module.exports[k] = m[k];
  }
}

mergeModule("./server");