import { makeGitHubLink } from "./ui.js";

export default class Header {
  constructor() {
    const divTitle = document.createElement("div");
    this.domElement = divTitle;
    (style => {
      style.display = "flex";
      style.flexDirection = "column";
      style.alignItems = "center";
      style.color = "white";
      style.width = "100%";
      style.backgroundColor = "#000000";
      style.paddingBottom = "20px";
      style.marginBottom = "30px";
      style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
    })(divTitle.style);

    const divContent = document.createElement("div");
    divTitle.appendChild(divContent);
    (style => {
      style.maxWidth = "1200px";
      style.width = "100%";
      style.paddingTop = "20px";
      style.position = "relative";
      style.textAlign = "center";
      style.paddingRight = "50px";
      style.paddingLeft = "50px";
    })(divContent.style);

    const h1 = document.createElement("h1");
    h1.textContent = "algovivo";
    divContent.appendChild(h1);
    ((style) => {
      style.fontSize = "33px";
      style.color = "white";
    })(h1.style);

    const a = makeGitHubLink();
    divContent.appendChild(a);

    const h2 = document.createElement("h2");
    h2.textContent = "an energy-based formulation for soft-bodied virtual creatures";
    divContent.appendChild(h2);
    ((style) => {
      style.textAlign = "center";
      style.fontSize = "18px";
      style.color = "#c7c7c7";
    })(h2.style);
  }
}