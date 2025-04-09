const algovivo = require("algovivo");
const fsp = require("fs/promises");
const path = require("path");
const utils = require("../utils");

const dataDirname = path.join(__dirname, "data");

async function loadMeshData() {
  const meshFilename = process.env.MESH_FILENAME || path.join(dataDirname, "mesh.json");
  return JSON.parse(await fsp.readFile(meshFilename));
}

async function loadPolicyData() {
  const policyFilename = process.env.POLICY_FILENAME || path.join(dataDirname, "policy.json");
  return JSON.parse(await fsp.readFile(policyFilename));
}

async function main() {
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
  const policy = new algovivo.nn.NeuralFramePolicy({
    system: system,
    active: true
  });
  policy.loadData(policyData);

  const outputDirname = process.env.OUTPUT_DIRNAME || path.join(__dirname, "data", "trajectory");

  await utils.cleandir(outputDirname);

  const writePromises = [];
  const n = process.env.STEPS ? parseInt(process.env.STEPS, 10) : 100;
  for (let i = 0; i < n; i++) {
    console.log(`${i + 1} / ${n}`);
    const itemData = {
      pos0: system.pos0.toArray(),
      vel0: system.vel0.toArray(),
      a0: system.a.toArray()
    };

    const policyTrace = {};
    policy.step({ trace: policyTrace });
    system.step();

    itemData.pos1 = system.pos0.toArray();
    itemData.vel1 = system.vel0.toArray();
    itemData.a1 = system.a.toArray();
    itemData.policy_input = policyTrace.policyInput;
    itemData.policy_output = policyTrace.policyOutput;

    const filename = `${outputDirname}/${i}.json`;
    const p = fsp.writeFile(filename, JSON.stringify(itemData, null, 2));
    writePromises.push(p);
  }

  await Promise.all(writePromises);
}

main();