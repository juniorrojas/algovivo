export default class IconButton {
  constructor(args = {}) {
    const div = this.domElement = document.createElement("div");

    div.style.userSelect = "none";
    div.style.webkitTapHighlightColor = "transparent";
    div.style.padding = "12px";
    div.style.cursor = "pointer";
    div.style.padding = "0";
    div.style.borderRadius = "50%";
    div.style.width = "78px";
    div.style.height = "78px";
    div.style.minHeight = div.style.height;
    div.style.margin = "4px";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.boxShadow = "0 0 8px rgba(0, 0, 0, 0.2)";

    // const icon = new Image();
    // icon.src = args.src;
    // const iconSize = 40;
    // icon.style.width = `${iconSize}px`;
    // icon.style.height = `${iconSize}px`;
    // div.appendChild(icon);

    this.initSvg();

    this.setInactiveStyle();
  }

  initSvg() {
    const color = "white";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.width = "100%";
    svg.setAttribute("width", "198");
    svg.setAttribute("height", "217");
    svg.setAttribute("viewBox", "0 0 198 217");
    svg.setAttribute("fill", "none");

    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("fill-rule", "evenodd");
    path1.setAttribute("clip-rule", "evenodd");
    path1.setAttribute("d", "M156.5 186.309L173 178.837V161.992L152.888 150.729L130.5 162.127V194.062H120.5V155.996L148 141.996V121.915L173 109.915V86.0615H183V116.208L158 128.208V142.131L177.975 153.317L197.5 142.16V76.5834L179.133 63.0079L157 75.4829L156.5 102H146.5L147 75.4371L119.5 59.4371V22.5615H129.5V53.6859L152.039 66.7998L174.42 54.185L174.077 41.482L156.5 31.2553V48.5615H146.5V13.2817L125.974 0L105 13.3103V128.519L121 117.442V89.0615H131V122.681L105 140.681V204.221L125.975 216.725L146.5 204.249V169.562H156.5V186.309Z");
    path1.setAttribute("fill", color);

    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path2.setAttribute("fill-rule", "evenodd");
    path2.setAttribute("clip-rule", "evenodd");
    path2.setAttribute("d", "M41 30.4169L24.5 37.8885V54.7333L44.6122 65.9962L67 54.5988V22.664H77V60.7291L49.5 74.7291V94.8101L24.5 106.81V130.664H14.5V100.518L39.5 88.5178V74.5946L19.5249 63.4085L0 74.5656V140.142L18.3669 153.718L40.5 141.243L41 114.725H51L50.5 141.288L78 157.288V194.164H68V163.04L45.4606 149.926L23.0796 162.54L23.4229 175.243L41 185.47V168.164H51V203.444L71.5262 216.725L92.5 203.415V88.2068L76.5 99.2837V127.664H66.5V94.0442L92.5 76.0442V12.5043L71.525 -3.05176e-05L51 12.476V47.164H41V30.4169Z");
    path2.setAttribute("fill", color);

    svg.appendChild(path1);
    svg.appendChild(path2);
    this.domElement.appendChild(svg);
  }

  setActiveStyle() {
    this.domElement.style.backgroundColor = "black";
  }

  setInactiveStyle() {
    this.domElement.style.backgroundColor = "rgba(1, 1, 1, 0.2)";
  }
}