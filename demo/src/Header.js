const headerBackgroundColor = "#000000";

export function makeHeader() {
  const divTitle = document.createElement("div");
  document.body.appendChild(divTitle);
  (style => {
    style.display = "flex";
    style.flexDirection = "column";
    style.alignItems = "center";
    style.color = "white";
    style.width = "100%";
    style.backgroundColor = headerBackgroundColor;
    style.paddingTop = "20px";
    style.paddingBottom = "20px";
    style.paddingRight = "50px";
    style.paddingLeft = "50px";
    style.marginBottom = "30px";
    style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
  })(divTitle.style);

  const h1 = document.createElement("h1");
  h1.textContent = "algovivo";
  divTitle.appendChild(h1);
  ((style) => {
    style.fontSize = "33px";
    style.color = "white";
  })(h1.style);

  const h2 = document.createElement("h2");
  h2.textContent = "an energy-based formulation for soft-bodied virtual creatures";
  divTitle.appendChild(h2);
  ((style) => {
    style.textAlign = "center";
    style.fontSize = "18px";
    style.color = "#c7c7c7";
  })(h2.style);
}

export default class Header {
  constructor() {
    makeHeader();
  }
}