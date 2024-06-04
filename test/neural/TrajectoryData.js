const fs = require("fs")
const fsp = require("fs").promises;
const path = require("path");

function getNumFilesWithExtension(dirname, ext = ".json") {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, (err, files) => {
      if (err) {
        throw new Error(`Error reading directory ${err}`);
      }
      const filenames = files.filter(file => path.extname(file).toLowerCase() === ext);
      resolve(filenames.length);
    });
  });
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