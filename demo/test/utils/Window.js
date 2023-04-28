const puppeteer = require("puppeteer");

class Window {
  constructor(args) {
    if (args == null) args = {};
    this.width = args.width == null ? 400 : args.width;
    this.height = args.height == null ? 400 : args.height;
    this.headless = args.headless == null ? false : args.headless;
    this.deviceScaleFactor = args.deviceScaleFactor == null ? 1 : args.deviceScaleFactor;
    this.indexUrl = args.indexUrl;
  }

  async launch() {
    const width = this.width;
    const height = this.height;
    const deviceScaleFactor = this.deviceScaleFactor;
    const browser = this.browser = await puppeteer.launch({
      headless: this.headless,
      args: [
        `--window-size=${this.width},${this.height}`
      ]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: width, height: height, deviceScaleFactor: deviceScaleFactor });
    await page.goto(this.indexUrl);
    this.page = page;
  }

  async evaluate() {
    return await this.page.evaluate.apply(this.page, arguments);
  }

  async screenshot() {
    return await this.page.screenshot.apply(this.page, arguments);
  }

  async close() {
    await this.browser.close();
  }
}

module.exports = Window;