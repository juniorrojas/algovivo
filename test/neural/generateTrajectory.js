const algovivo = require("algovivo");
const fsp = require("fs/promises");
const NeuralPolicy = require("./NeuralPolicy");
const utils = require("../utils");

async function main() {
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

  const outputDirname = `${__dirname}/data/trajectory`;

  await utils.cleandir(outputDirname);

  const writePromises = [];
  for (let i = 0; i < 100; i++) {
    const itemData = {
      x0: system.x0.toArray(),
      v0: system.v0.toArray()
    };

    const policyTrace = {};
    policy.step({ trace: policyTrace });
    system.step();

    itemData.x1 = system.x0.toArray();
    itemData.v1 = system.v0.toArray();
    itemData.policyInput = policyTrace.policyInput;
    itemData.policyOutput = policyTrace.policyOutput;

    const filename = `${outputDirname}/${i}.json`;
    const p = fsp.writeFile(filename, JSON.stringify(itemData, null, 2));
    writePromises.push(p);
  }

  await Promise.all(writePromises);
}

main();