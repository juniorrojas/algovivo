const algovivo = require("algovivo");
const fsp = require("fs/promises");
const NeuralPolicy = require("./NeuralPolicy");
const utils = require("../utils");

async function main() {
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
  const policy = new NeuralPolicy({
    system: system,
    stochastic: false,
    active: true
  });
  policy.loadData(policyData);

  const outputDirname = `${__dirname}/data/trajectory`;

  await utils.cleandir(outputDirname);

  const writePromises = [];
  for (let i = 0; i < 100; i++) {
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