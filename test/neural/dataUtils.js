const fs = require("fs").promises;
const path = require("path");

async function loadTrajectoryStep(trajectoryDataDirname, step) {
  const filename = path.join(trajectoryDataDirname, `${step}.json`);
  const data = JSON.parse(await fs.readFile(filename));
  return data;
}

module.exports = {
  loadTrajectoryStep
}