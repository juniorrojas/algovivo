const fs = require("fs").promises;
const path = require("path");

async function loadTrajectoryStep(step) {
  const trajectoryDataDirname = path.join(__dirname, "data", "trajectory");
  const filename = path.join(trajectoryDataDirname, `${step}.json`);
  const data = JSON.parse(await fs.readFile(filename));
  return data;
}

module.exports = {
  loadTrajectoryStep
}