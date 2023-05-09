const algovivo = require("../../algovivo");
const utils = require("../utils");
const fsp = require("fs/promises");
const NeuralPolicy = require("./NeuralPolicy");
const fs = require("fs");

function fileExists(filename) {
  return new Promise((resolve, reject) => {
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (err) resolve(false);
      else resolve(true);
    });
  });
}

async function cleandir(dirname) {
  if (!await fileExists(dirname)) {
    await fsp.mkdir(dirname);
  } else {
    fs.rmSync(dirname, { recursive: true });
    await fsp.mkdir(dirname);
  }
}

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
    stochastic: false
  });
  policy.active = true;
  policy.loadData(policyData);

  await cleandir(`${__dirname}/gen`);

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
    const p = fsp.writeFile(`${__dirname}/gen/${i}.json`, JSON.stringify(itemData));
    writePromises.push(p);
  }

  await Promise.all(writePromises);
}

main();