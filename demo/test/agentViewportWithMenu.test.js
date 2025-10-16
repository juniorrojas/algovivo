import AgentViewportWithMenu from "../src/AgentViewportWithMenu.js";
import algovivo from "../../build/algovivo.js";

test("agent viewport", async () => {
  const agentViewport = new AgentViewportWithMenu({ algovivo, headless: true });
});