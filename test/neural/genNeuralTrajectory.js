const algovivo = require("../../algovivo");
const utils = require("../utils");
const fsp = require("fs/promises");
const NeuralPolicy = require("./NeuralPolicy");

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
  for (let i = 0; i < 10; i++) {
    const itemData = {
      x0: system.x0.toArray(),
      v0: system.v0.toArray()
    };

    policy.step();
    system.step();

    itemData.x1 = system.x0.toArray();
    itemData.v1 = system.v0.toArray();

    const filename = `${outputDirname}/${i}.json`;
    const p = fsp.writeFile(filename, JSON.stringify(itemData));
    writePromises.push(p);
  }

  await Promise.all(writePromises);
}

main();