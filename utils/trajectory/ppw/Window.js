const puppeteer = require("puppeteer");

class Window {
  constructor(args = {}) {
    this.width = args.width ?? 400;
    this.height = args.height ?? 400;
    this.headless = args.headless ?? false;
    this.deviceScaleFactor = args.deviceScaleFactor ?? 1;
    if (args.indexUrl == null) throw new Error("indexUrl required");
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

  async waitForNetworkIdle() {
    return await this.page.waitForNetworkIdle.apply(this.page, arguments);
  }

  async close() {
    await this.browser.close();
  }
}

module.exports = Window;