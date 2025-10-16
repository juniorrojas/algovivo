import AgentSystem from "../src/AgentSystem.js";
import algovivo from "../../algovivo/index.js";
import { loadWasm } from "./utils.js";

test("agent system", async () => {
  const wasmInstance = await loadWasm();
  const system = new algovivo.System({ wasmInstance });
  const agentSystem = new AgentSystem({ algovivo, system });
  expect(agentSystem.numVertices).toBe(0);
  agentSystem.set({
    mesh: { pos: [[0, 0]] }
  });
  expect(agentSystem.numVertices).toBe(1);
});