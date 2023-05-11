const algovivo = require("../../algovivo");
const utils = require("../utils");
const fsp = require("fs/promises");
const fs = require("fs");
const NeuralPolicy = require("./NeuralPolicy");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("neural policy", async () => {
  const system = new algovivo.System({
    wasmInstance: await utils.loadWasm()
  });
  const meshDataPromise = fsp.readFile(`${__dirname}/data/mesh.json`);
  const policyDataPromise = fsp.readFile(`${__dirname}/data/policy.json`);
  const [meshData, policyData] = (await Promise.all([
    meshDataPromise, policyDataPromise
  ])).map(r => JSON.parse(r));
  system.set(meshData);
  const policy = new NeuralPolicy({
    system: system,
    stochastic: false,
    active: true
  });
  policy.loadData(policyData);

  const trajectoryDataDirname = `${__dirname}/data/trajectory`;

  let expectedNumReservedBytes = null;

  for (let i = 0; i < 100; i++) {
    const data = JSON.parse(fs.readFileSync(`${trajectoryDataDirname}/${i}.json`));

    system.x0.set(data.x0);
    system.v0.set(data.v0);

    const policyTrace = {};
    policy.step({ trace: policyTrace });
    system.step();

    const mgr = system.memoryManager;
    if (i == 0) expectedNumReservedBytes = mgr.numReservedBytes();
    expect(expectedNumReservedBytes).not.toBeNull();
    expect(expectedNumReservedBytes).toBeGreaterThan(0);
    expect(mgr.numReservedBytes()).toBe(expectedNumReservedBytes);
    
    expect(policyTrace.policyInput).toBeCloseToArray(data.policyInput);
    expect(policyTrace.policyOutput).toBeCloseToArray(data.policyOutput);
    expect(system.x0.toArray()).toBeCloseToArray(data.x1);
    expect(system.v0.toArray()).toBeCloseToArray(data.v1);
  }
});