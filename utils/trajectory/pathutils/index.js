const fs = require("fs");
const fsp = fs.promises;

function fileExists(filename) {
  return new Promise((resolve, reject) => {
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (err) resolve(false);
      else resolve(true);
    });
  });
}

async function cleandir(dirname) {
  if (!await fileExists(dirname)) {
    await fsp.mkdir(dirname);
  } else {
    fs.rmSync(dirname, { recursive: true });
    await fsp.mkdir(dirname);
  }
}

module.exports = {
  fileExists,
  cleandir
};