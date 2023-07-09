export default class IconButton {
  constructor(args = {}) {
    const div = this.domElement = document.createElement("div");
    
    div.style.userSelect = "none";
    div.style.webkitTapHighlightColor = "transparent";
    div.style.padding = "12px";
    div.style.cursor = "pointer";
    div.style.borderRadius = "50%";
    div.style.width = "78px";
    div.style.height = "78px";
    div.style.minHeight = div.style.height;
    div.style.margin = "4px";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.boxShadow = "0 0 8px rgba(0, 0, 0, 0.2)";

    const icon = new Image();
    icon.src = args.src;
    const iconSize = 40;
    icon.style.width = `${iconSize}px`;
    icon.style.height = `${iconSize}px`;
    div.appendChild(icon);

    this.setInactiveStyle();
  }

  setActiveStyle() {
    this.domElement.style.backgroundColor = "black";
  }

  setInactiveStyle() {
    this.domElement.style.backgroundColor = "rgba(1, 1, 1, 0.2)";
  }
}