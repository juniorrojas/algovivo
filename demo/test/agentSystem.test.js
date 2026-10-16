import { test } from "node:test";
import assert from "node:assert";
import fsp from "fs/promises";
import AgentSystem from "../src/AgentSystem.js";
import * as algovivo from "../../build/algovivo.js";
import { loadWasm } from "./utils.js";

test("agent system", async () => {
  const wasmInstance = await loadWasm();
  const system = new algovivo.System({ wasmInstance });
  const agentSystem = new AgentSystem({ algovivo, system });
  assert.strictEqual(system.numVertices, 0);
  agentSystem.set({
    mesh: { pos: [[0, 0]] }
  });
  assert.strictEqual(system.numVertices, 1);
});

test("set agent", async () => {
  const wasmInstance = await loadWasm();
  const system = new algovivo.System({ wasmInstance });
  const agentSystem = new AgentSystem({ algovivo, system });
  assert.strictEqual(agentSystem.agentName, null);
  assert.strictEqual(agentSystem.policyActive, false);

  agentSystem.setAgent("a", {
    mesh: { pos: [[0, 0], [1, 0]] }
  });
  assert.strictEqual(agentSystem.agentName, "a");
  assert.strictEqual(system.numVertices, 2);
  assert.strictEqual(agentSystem.policy, null);
  assert.strictEqual(agentSystem.policyActive, false);
});

async function loadAgentData(agentName) {
  const dirname = `${import.meta.dirname}/../public/data/${agentName}`;
  return {
    mesh: JSON.parse(await fsp.readFile(`${dirname}/mesh.json`)),
    policy: JSON.parse(await fsp.readFile(`${dirname}/policy.json`))
  };
}

test("switch agent keeps center and policy state", async () => {
  const wasmInstance = await loadWasm();
  const system = new algovivo.System({ wasmInstance });
  const agentSystem = new AgentSystem({ algovivo, system });

  agentSystem.setAgent("biped", await loadAgentData("biped"));
  agentSystem.policyActive = true;
  for (let i = 0; i < 10; i++) agentSystem.step();
  const center = system.vertices.getVertexPos(agentSystem.policy.centerVertexId);

  const quadruped = await loadAgentData("quadruped");
  agentSystem.setAgent("quadruped", quadruped);
  assert.strictEqual(agentSystem.agentName, "quadruped");
  assert.strictEqual(system.numVertices, quadruped.mesh.pos.length);
  assert.strictEqual(agentSystem.policyActive, true);

  const newCenter = system.vertices.getVertexPos(agentSystem.policy.centerVertexId);
  assert.ok(Math.abs(newCenter[0] - center[0]) < 0.000005);
  assert.ok(Math.abs(newCenter[1] - quadruped.mesh.pos[quadruped.policy.center_vertex_id][1]) < 0.000005);
});
