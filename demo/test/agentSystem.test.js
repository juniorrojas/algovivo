import AgentSystem from "../src/AgentSystem.js";
import algovivo from "../../build/algovivo.js";
import { loadWasm } from "./utils.js";

test("agent system", async () => {
  const wasmInstance = await loadWasm();
  const system = new algovivo.System({ wasmInstance });
  const agentSystem = new AgentSystem({ algovivo, system });
});