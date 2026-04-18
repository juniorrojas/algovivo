import * as algovivo from "algovivo";
import * as utils from "../utils.js";
import fsp from "fs/promises";
import path from "path";
import Trajectory from "../../utils/trajectory/Trajectory.js";

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

const dataDirname = path.join(__dirname, "data");

test("trajectory", async () => {
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
  expect(n).toBe(100);

  for (let i = 0; i < n; i++) {
    const stepData = await trajectory.loadStep(i);

    expect(system.pos.toArray()).toBeCloseToArray(stepData.pos0);
    expect(system.a.toArray()).toBeCloseToArray(stepData.a0);

    policy.step();
    system.step();

    if (stepData.pos1 != null) {
      expect(system.pos.toArray()).toBeCloseToArray(stepData.pos1);
    }
    if (stepData.a1 != null) {
      expect(system.a.toArray()).toBeCloseToArray(stepData.a1);
    }
  }
}, 30000);
