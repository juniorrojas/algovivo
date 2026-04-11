import Engine from "./Engine.js";

function engine(args = {}) {
  const ten = new Engine({
    wasmInstance: args.wasmInstance
  });
  return ten;
}

export { engine, Engine };
export { default as Tensor } from "./Tensor.js";

import * as mmgr from "./mmgr/index.js";
export { mmgr };

import * as utils from "./utils.js";
export { utils };
