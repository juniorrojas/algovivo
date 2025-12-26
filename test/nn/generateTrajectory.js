const algovivo = require("algovivo");
const fsp = require("fs/promises");
const path = require("path");
const { ArgumentParser } = require("argparse");
const utils = require("../utils");

const dataDirname = path.join(__dirname, "data");

async function loadMeshData(filename) {
  return JSON.parse(await fsp.readFile(filename));
}

async function loadPolicyData(filename) {
  return JSON.parse(await fsp.readFile(filename));
}

async function main() {
  const argParser = new ArgumentParser();
  argParser.add_argument("--mesh-filename", { default: path.join(dataDirname, "mesh.json") });
  argParser.add_argument("--policy-filename", { default: path.join(dataDirname, "policy.json") });
  argParser.add_argument("-o", "--output-dirname", { default: "trajectory.out" });
  argParser.add_argument("--steps", { type: "int", default: 100 });
  const args = argParser.parse_args();

  const [wasmInstance, meshData, policyData] = await Promise.all([
    utils.loadWasm(),
    loadMeshData(args.mesh_filename),
    loadPolicyData(args.policy_filename)
  ]);

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

  await utils.cleandir(args.output_dirname);

  const n = args.steps;
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

    const filename = `${args.output_dirname}/${i}.json`;
    await fsp.writeFile(filename, JSON.stringify(itemData, null, 2));
  }

  console.log(`trajectory saved to ${args.output_dirname}`);
}

main();