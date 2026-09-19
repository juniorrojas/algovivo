import snippetForAgent from "./snippet.js";

export default class CodeSnippet {
  constructor(args = {}) {
    this.agentName = args.agentName ?? null;
    this.collapsed = args.collapsed ?? false;

    const div = this.domElement = document.createElement("div");
    div.style.position = "relative";
    div.style.borderRadius = "10px";
    div.style.border = "2px solid black";
    div.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
    div.style.overflow = "hidden";
    div.style.backgroundColor = "rgba(255, 255, 255, 0.94)";

    const pre = this.pre = document.createElement("pre");
    pre.style.margin = "0";
    pre.style.padding = "14px";
    pre.style.paddingTop = "44px";
    pre.style.height = "100%";
    pre.style.overflow = "auto";
    pre.style.fontFamily = "monospace";
    pre.style.fontSize = "11px";
    pre.style.lineHeight = "1.45";
    pre.style.color = "black";
    pre.style.whiteSpace = "pre-wrap";
    pre.style.overflowWrap = "anywhere";
    pre.style.tabSize = "2";
    div.appendChild(pre);

    this.initCopyButton();
    this.initToggleButton();
    this.applyCollapsed();

    if (this.agentName != null) this.setAgent(this.agentName);
  }

  initCopyButton() {
    const btn = this.btnCopy = document.createElement("div");
    btn.textContent = "copy";
    btn.style.position = "absolute";
    btn.style.top = "10px";
    btn.style.right = "72px";
    btn.style.zIndex = "10";
    btn.style.cursor = "pointer";
    btn.style.userSelect = "none";
    btn.style.webkitTapHighlightColor = "transparent";
    btn.style.padding = "4px 12px";
    btn.style.borderRadius = "5px";
    btn.style.backgroundColor = "black";
    btn.style.color = "white";
    btn.style.fontFamily = "monospace";
    btn.style.fontSize = "12px";
    btn.addEventListener("click", () => this.copy());
    this.domElement.appendChild(btn);
  }

  initToggleButton() {
    const btn = this.btnToggle = document.createElement("div");
    btn.style.position = "absolute";
    btn.style.top = "10px";
    btn.style.right = "10px";
    btn.style.zIndex = "11";
    btn.style.cursor = "pointer";
    btn.style.userSelect = "none";
    btn.style.webkitTapHighlightColor = "transparent";
    btn.style.padding = "4px 12px";
    btn.style.borderRadius = "5px";
    btn.style.backgroundColor = "black";
    btn.style.color = "white";
    btn.style.fontFamily = "monospace";
    btn.style.fontSize = "12px";
    btn.addEventListener("click", () => this.setCollapsed(!this.collapsed));
    this.domElement.appendChild(btn);
  }

  setCollapsed(collapsed) {
    this.collapsed = collapsed;
    this.applyCollapsed();
    if (this.onToggle != null) this.onToggle(collapsed);
  }

  applyCollapsed() {
    const collapsed = this.collapsed;
    this.pre.style.display = collapsed ? "none" : "block";
    this.btnCopy.style.display = collapsed ? "none" : "block";
    this.btnToggle.textContent = collapsed ? "code" : "hide";
    this.domElement.style.backgroundColor = collapsed ? "transparent" : "rgba(255, 255, 255, 0.94)";
    this.domElement.style.border = collapsed ? "none" : "2px solid black";
    this.domElement.style.boxShadow = collapsed ? "none" : "0 0 10px rgba(0, 0, 0, 0.1)";
    this.domElement.style.overflow = collapsed ? "visible" : "hidden";
  }

  setAgent(agentName) {
    this.agentName = agentName;
    this.pre.textContent = snippetForAgent(agentName);
    this.pre.scrollTop = 0;
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.pre.textContent);
      this.showCopied();
    } catch (error) {
      this.selectAll();
    }
  }

  showCopied() {
    this.btnCopy.textContent = "copied";
    clearTimeout(this.copiedTimeout);
    this.copiedTimeout = setTimeout(() => {
      this.btnCopy.textContent = "copy";
    }, 1200);
  }

  selectAll() {
    const range = document.createRange();
    range.selectNodeContents(this.pre);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
