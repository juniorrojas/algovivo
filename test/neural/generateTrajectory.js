const algovivo = require("algovivo");
const fsp = require("fs/promises");
const NeuralPolicy = require("./NeuralPolicy");
const utils = require("../utils");

const dataDirname = `${__dirname}/data`;

async function loadMeshData() {
  return JSON.parse(await fsp.readFile(`${dataDirname}/mesh.json`));
}

async function loadPolicyData() {
  return JSON.parse(await fsp.readFile(`${dataDirname}/policy.json`));
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
  const policy = new NeuralPolicy({
    system: system,
    active: true
  });
  policy.loadData(policyData);

  const outputDirname = `${__dirname}/data/trajectory`;

  await utils.cleandir(outputDirname);

  const writePromises = [];
  const n = 100;
  for (let i = 0; i < n; i++) {
    console.log(`${i + 1} / ${n}`);
    const itemData = {
      x0: system.x0.toArray(),
      v0: system.v0.toArray(),
      a0: system.a.toArray()
    };

    const policyTrace = {};
    policy.step({ trace: policyTrace });
    system.step();

    itemData.x1 = system.x0.toArray();
    itemData.v1 = system.v0.toArray();
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