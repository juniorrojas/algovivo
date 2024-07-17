const fsp = require("fs").promises;
const path = require("path");

async function getNumFilesWithExtension(dirname, ext = ".json") {
  try {
    const files = await fsp.readdir(dirname);
    const filenames = files.filter(file => path.extname(file).toLowerCase() === ext);
    return filenames.length;
  } catch (err) {
    throw new Error(`Error reading directory ${err}`);
  }
}

class TrajectoryData {
  constructor(dirname) {
    this.dirname = dirname;
  }

  async numSteps() {
    return await getNumFilesWithExtension(this.dirname, ".json");
  }

  async loadStep(step) {
    const filename = path.join(this.dirname, `${step}.json`);
    const data = JSON.parse(await fsp.readFile(filename));
    return data;
  }
}

module.exports = TrajectoryData;