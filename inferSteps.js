const fs = require("fs");
const path = require("path");

const dirname = "test/neural/data/trajectory/";

fs.readdir(dirname, (err, files) => {
  if (err) {
    throw new Error(`Error reading directory ${err}`);
  }
  const filenames = files.filter(file => path.extname(file).toLowerCase() === ".json");
  console.log(filenames.length);
});