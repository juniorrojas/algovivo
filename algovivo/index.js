const System = require("./Sim");
const mmgrten = require("./mmgrten/index");
const ui = require("./ui");

async function makeSystem(args = {}) {
  const ten = await mmgrten.engine({
    wasmInstance: args.wasmInstance
  });
  return new System({
    ten: ten
  });
}

module.exports = {
  makeSystem: makeSystem,
  System: System,
  mmgrten: mmgrten,
  SystemViewport: ui.SimViewport
};