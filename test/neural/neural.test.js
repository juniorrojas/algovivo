const algovivo = require("../../algovivo");
const utils = require("../utils");
const dataUtils = require("./dataUtils");
const fsp = require("fs/promises");
const path = require("path");
const NeuralPolicy = require("./NeuralPolicy");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

const dataDirname = path.join(__dirname, "data");

async function loadMeshData() {
  const meshFilename = path.join(dataDirname, "mesh.json");
  return JSON.parse(await fsp.readFile(meshFilename));
}

async function loadPolicyData() {
  const policyFilename = path.join(dataDirname, "policy.json");
  return JSON.parse(await fsp.readFile(policyFilename));
}

test("neural policy", async () => {
  const [wasmInstance, meshData, policyData] = await Promise.all(
    [utils.loadWasm, loadMeshData, loadPolicyData].map(f => f())
  );

  const system = new algovivo.System({ wasmInstance });
  
  system.set({
    pos: meshData.pos,
    muscles: meshData.muscles,
    musclesL0: meshData.l0,
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

  const trajectoryDataDirname = path.join(dataDirname, "trajectory");

  let expectedNumReservedBytes = null;
  const mgr = system.memoryManager;

  const n = await utils.getNumFilesWithExtension(trajectoryDataDirname, ".json");
  expect(n).toBe(100);
  for (let i = 0; i < n; i++) {
    const data = await dataUtils.loadTrajectoryStep(trajectoryDataDirname, i);

    system.pos0.set(data.pos0);
    system.vel0.set(data.vel0);
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
    expect(system.pos0.toArray()).toBeCloseToArray(data.pos1);
    expect(system.vel0.toArray()).toBeCloseToArray(data.vel1);
    expect(system.a.toArray()).toBeCloseToArray(data.a1);
  }
});