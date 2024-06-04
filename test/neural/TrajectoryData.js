const fs = require("fs").promises;
const path = require("path");

class TrajectoryData {
  constructor(dirname) {
    this.dirname = dirname;
  }

  async loadStep(step) {
    const filename = path.join(this.dirname, `${step}.json`);
    const data = JSON.parse(await fs.readFile(filename));
    return data;
  }
}

module.exports = TrajectoryData;