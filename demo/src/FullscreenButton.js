const expandPaths = ["M9 4H4v5M4 4l6 6", "M15 20h5v-5M20 20l-6-6"];
const contractPaths = ["M10 5v5H5M4 4l6 6", "M14 19v-5h5M20 20l-6-6"];

function currentFullscreenElement() {
  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
}

export default class FullscreenButton {
  static supported() {
    return (document.fullscreenEnabled ?? document.webkitFullscreenEnabled) === true;
  }

  constructor(args = {}) {
    this.target = args.target ?? null;
    this.fullscreen = false;

    const div = this.domElement = document.createElement("div");
    div.style.cursor = "pointer";
    div.style.userSelect = "none";
    div.style.webkitTapHighlightColor = "transparent";
    div.style.padding = "4px 8px";
    div.style.borderRadius = "5px";
    div.style.backgroundColor = "black";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.addEventListener("click", () => this.toggle());

    this.initSvg();
    this.applyFullscreen();

    const onFullscreenChange = () => this.syncFullscreen();
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
  }

  initSvg() {
    const svg = this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.style.width = "16px";
    svg.style.height = "16px";
    svg.style.display = "block";

    this.paths = expandPaths.map(() => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("stroke", "white");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path);
      return path;
    });

    this.domElement.appendChild(svg);
  }

  toggle() {
    if (this.fullscreen) this.exit();
    else this.request();
  }

  request() {
    const target = this.target;
    if (target == null) return;
    const request = target.requestFullscreen ?? target.webkitRequestFullscreen;
    if (request != null) Promise.resolve(request.call(target)).catch(() => {});
  }

  exit() {
    const exit = document.exitFullscreen ?? document.webkitExitFullscreen;
    if (exit != null) Promise.resolve(exit.call(document)).catch(() => {});
  }

  syncFullscreen() {
    const fullscreen = this.target != null && currentFullscreenElement() === this.target;
    if (fullscreen === this.fullscreen) return;
    this.fullscreen = fullscreen;
    this.applyFullscreen();
    if (this.onChange != null) this.onChange(fullscreen);
  }

  applyFullscreen() {
    const d = this.fullscreen ? contractPaths : expandPaths;
    this.paths.forEach((path, i) => path.setAttribute("d", d[i]));
    this.domElement.title = this.fullscreen ? "exit fullscreen" : "fullscreen";
  }
}
