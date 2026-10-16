import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";
import * as utils from "../utils.js";
import fsp from "fs/promises";
import path from "path";
import Trajectory from "../../utils/trajectory/Trajectory.js";

const dataDirname = path.join(import.meta.dirname, "data");

test("trajectory", { timeout: 30000 }, async () => {
  const system = new algovivo.System({
    wasmInstance: await utils.loadWasm()
  });

  const meshData = JSON.parse(
    await fsp.readFile(path.join(dataDirname, "mesh.json"))
  );
  const policyData = JSON.parse(
    await fsp.readFile(path.join(dataDirname, "policy.json"))
  );

  system.set(meshData);
  const policy = new algovivo.nn.MLPPolicy({ system, active: true });
  policy.loadData(policyData);

  const trajectory = new Trajectory(path.join(dataDirname, "trajectory"));
  const n = await trajectory.numSteps();
  assert.strictEqual(n, 100);

  for (let i = 0; i < n; i++) {
    const stepData = await trajectory.loadStep(i);

    utils.assertCloseToArray(system.pos.toArray(), stepData.pos0);
    utils.assertCloseToArray(system.a.toArray(), stepData.a0);

    policy.step();
    system.step();

    if (stepData.pos1 != null) {
      utils.assertCloseToArray(system.pos.toArray(), stepData.pos1);
    }
    if (stepData.a1 != null) {
      utils.assertCloseToArray(system.a.toArray(), stepData.a1);
    }
  }
});
