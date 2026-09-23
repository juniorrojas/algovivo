async function fetchJson(url) {
  const response = await fetch(url);
  return await response.json();
}

export default class AgentData {
  constructor(args = {}) {
    this.dataRoot = args.dataRoot ?? "data";
    this.version = args.version ?? null;
    this.cache = new Map();
  }

  load(agentName) {
    let data = this.cache.get(agentName);
    if (data == null) {
      data = Promise.all([
        fetchJson(this.url(agentName, "mesh.json")),
        fetchJson(this.url(agentName, "policy.json"))
      ]).then(([mesh, policy]) => ({ mesh, policy }));
      data.catch(() => this.cache.delete(agentName));
      this.cache.set(agentName, data);
    }
    return data;
  }

  url(agentName, filename) {
    const url = `${this.dataRoot}/${agentName}/${filename}`;
    return this.version == null ? url : `${url}?v=${this.version}`;
  }
}
