export default class AgentSystem {
  constructor(args = {}) {
    if (args.system == null) throw new Error("system required");
    this.system = args.system;
  }
}