import fsp from "fs/promises";
import AgentSystem from "../src/AgentSystem.js";
import * as algovivo from "../../build/algovivo.js";
import { loadWasm } from "./utils.js";

test("agent system", async () => {
  const wasmInstance = await loadWasm();
  const system = new algovivo.System({ wasmInstance });
  const agentSystem = new AgentSystem({ algovivo, system });
  expect(system.numVertices).toBe(0);
  agentSystem.set({
    mesh: { pos: [[0, 0]] }
  });
  expect(system.numVertices).toBe(1);
});

test("set agent", async () => {
  const wasmInstance = await loadWasm();
  const system = new algovivo.System({ wasmInstance });
  const agentSystem = new AgentSystem({ algovivo, system });
  expect(agentSystem.agentName).toBe(null);
  expect(agentSystem.policyActive).toBe(false);

  agentSystem.setAgent("a", {
    mesh: { pos: [[0, 0], [1, 0]] }
  });
  expect(agentSystem.agentName).toBe("a");
  expect(system.numVertices).toBe(2);
  expect(agentSystem.policy).toBe(null);
  expect(agentSystem.policyActive).toBe(false);
});

async function loadAgentData(agentName) {
  const dirname = `${__dirname}/../public/data/${agentName}`;
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
  expect(agentSystem.agentName).toBe("quadruped");
  expect(system.numVertices).toBe(quadruped.mesh.pos.length);
  expect(agentSystem.policyActive).toBe(true);

  const newCenter = system.vertices.getVertexPos(agentSystem.policy.centerVertexId);
  expect(newCenter[0]).toBeCloseTo(center[0], 5);
  expect(newCenter[1]).toBeCloseTo(quadruped.mesh.pos[quadruped.policy.center_vertex_id][1], 5);
});
