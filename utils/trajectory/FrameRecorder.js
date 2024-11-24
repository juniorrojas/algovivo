const pathutils = require("./pathutils");
const path = require("path");

class FrameRecorder {
  constructor(args = {}) {
    if (args.framesDirname == null) throw new Error("framesDirname required");
    this.framesDirname = args.framesDirname;
    this.initialized = false;
    this.nextFrameId = 0;
  }

  async saveFrame(window) {
    if (window == null) throw new Error("window required");

    if (!this.initialized) {
      await pathutils.cleandir(this.framesDirname);
      this.initialized = true;
    }
    
    const frameFilename = path.join(this.framesDirname, `${this.nextFrameId}.png`);
    await window.screenshot({ path: frameFilename });
    this.nextFrameId++;
  }
}

module.exports = FrameRecorder;