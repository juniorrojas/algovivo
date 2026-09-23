async function fetchJson(url) {
  const response = await fetch(url);
  return await response.json();
}

export default class AgentData {
  constructor(args = {}) {
    this.dataRoot = args.dataRoot ?? "data";
    this.cache = new Map();
  }

  load(agentName) {
    let data = this.cache.get(agentName);
    if (data == null) {
      data = Promise.all([
        fetchJson(`${this.dataRoot}/${agentName}/mesh.json`),
        fetchJson(`${this.dataRoot}/${agentName}/policy.json`)
      ]).then(([mesh, policy]) => ({ mesh, policy }));
      data.catch(() => this.cache.delete(agentName));
      this.cache.set(agentName, data);
    }
    return data;
  }
}
