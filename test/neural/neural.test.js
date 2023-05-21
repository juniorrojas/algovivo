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
  const dataDirname = `${__dirname}/data`;

  async function loadMeshData() {
    return JSON.parse(await fsp.readFile(`${dataDirname}/mesh.json`));
  }

  async function loadPolicyData() {
    return JSON.parse(await fsp.readFile(`${dataDirname}/policy.json`));
  }

  const [meshData, policyData] = await Promise.all(
    [loadMeshData, loadPolicyData].map(f => f())
  );
  
  system.set({
    x: meshData.x,
    springs: meshData.springs,
    springsL0: meshData.l0,
    triangles: meshData.triangles,
    trianglesRsi: meshData.rsi
  });
  expect(system.l0.toArray()).toEqual(meshData.l0);
  expect(system.rsi.toArray()).toEqual(meshData.rsi);
  const policy = new NeuralPolicy({
    system: system,
    stochastic: false,
    active: true
  });
  policy.loadData(policyData);

  const trajectoryDataDirname = `${dataDirname}/trajectory`;

  let expectedNumReservedBytes = null;
  const mgr = system.memoryManager;

  for (let i = 0; i < 100; i++) {
    const data = JSON.parse(fs.readFileSync(`${trajectoryDataDirname}/${i}.json`));

    system.x0.set(data.x0);
    system.v0.set(data.v0);
    system.a.set(data.a0);

    const policyTrace = {};
    policy.step({ trace: policyTrace });
    system.step();

    if (i == 0) expectedNumReservedBytes = mgr.numReservedBytes();
    expect(expectedNumReservedBytes).not.toBeNull();
    expect(expectedNumReservedBytes).toBeGreaterThan(0);
    expect(mgr.numReservedBytes()).toBe(expectedNumReservedBytes);
    
    expect(policyTrace.policyInput).toBeCloseToArray(data.policy_input);
    expect(policyTrace.policyOutput).toBeCloseToArray(data.policy_output);
    expect(system.x0.toArray()).toBeCloseToArray(data.x1);
    expect(system.v0.toArray()).toBeCloseToArray(data.v1);
    expect(system.a.toArray()).toBeCloseToArray(data.a1);
  }
});