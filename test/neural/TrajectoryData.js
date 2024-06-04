const fs = require("fs").promises;
const path = require("path");
const utils = require("../utils");

class TrajectoryData {
  constructor(dirname) {
    this.dirname = dirname;
  }

  async numSteps() {
    return await utils.getNumFilesWithExtension(this.dirname, ".json");
  }

  async loadStep(step) {
    const filename = path.join(this.dirname, `${step}.json`);
    const data = JSON.parse(await fs.readFile(filename));
    return data;
  }
}

module.exports = TrajectoryData;