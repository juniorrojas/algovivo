const fs = require("fs");
const path = require("path");

function loadTrajectoryStep(step) {
  const trajectoryDataDirname = path.join(__dirname, "data", "trajectory");
  const filename = path.join(trajectoryDataDirname, `${step}.json`);
  const data = JSON.parse(fs.readFileSync(filename));
  return data;
}

module.exports = {
  loadTrajectoryStep
}