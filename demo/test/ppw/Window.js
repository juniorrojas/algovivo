import puppeteer from "puppeteer";

export default class Window {
  constructor(args = {}) {
    this.width = args.width ?? 400;
    this.height = args.height ?? 400;
    this.headless = args.headless ?? false;
    this.deviceScaleFactor = args.deviceScaleFactor ?? 1;
    this.indexUrl = args.indexUrl;
  }

  async launch() {
    const width = this.width;
    const height = this.height;
    const deviceScaleFactor = this.deviceScaleFactor;
    const launchOptions = {
      headless: this.headless,
      args: [
        `--window-size=${this.width},${this.height}`,
        "--no-sandbox"
      ]
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    const browser = this.browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // surface browser-side failures to node, otherwise tests hang until timeout
    this.pageError = null;
    page.on("pageerror", (err) => { this.pageError ??= err; console.error("pageerror:", err.message); });
    page.on("error", (err) => { this.pageError ??= err; console.error("error:", err.message); });
    page.on("requestfailed", (req) => {
      console.error("requestfailed:", req.url(), req.failure()?.errorText);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") console.error("console.error:", msg.text());
    });

    await page.setViewport({ width: width, height: height, deviceScaleFactor: deviceScaleFactor });
    await page.goto(this.indexUrl);
    this.page = page;
  }

  async evaluate() {
    return await this.page.evaluate.apply(this.page, arguments);
  }

  // wait for pred to hold in the page, but reject immediately if the page
  // errors or crashes, so tests fail fast with the real cause instead of
  // waiting out the timeout
  async waitForReady(pred, args = {}) {
    const timeout = args.timeout ?? 5000;
    let onError;
    const errored = new Promise((_, reject) => {
      onError = reject;
      this.page.once("pageerror", reject);
      this.page.once("error", reject);
    });
    errored.catch(() => {});
    try {
      // the error may have already fired during launch, before the listeners above
      if (this.pageError) throw this.pageError;
      await Promise.race([
        this.page.waitForFunction(pred, { timeout, polling: 50 }),
        errored
      ]);
    } finally {
      this.page.off("pageerror", onError);
      this.page.off("error", onError);
    }
    if (this.pageError) throw this.pageError;
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