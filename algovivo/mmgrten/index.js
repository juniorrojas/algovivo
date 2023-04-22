const Engine = require("./Engine");

function engine(args = {}) {
  const ten = new Engine({
    wasmInstance: args.wasmInstance
  });
  return ten;
}

module.exports = {
  engine: engine,
  Engine: Engine,
  Tensor: require("./Tensor"),
  mmgr: require("./mmgr"),
  utils: require("./utils")
};