export default class Section {
  constructor(title, content) {
    this.domElement = document.createElement("div");
    this.domElement.style.textAlign = "left";
    this.domElement.style.color = "#666";
    this.domElement.style.fontSize = "14px";
    this.domElement.style.padding = "22px";
    this.domElement.style.paddingRight = "26px";
    this.domElement.style.paddingLeft = "26px";
    this.domElement.style.paddingBottom = "45px";
    this.domElement.style.width = "100%";
    this.domElement.style.display = "flex";
    this.domElement.style.justifyContent = "center";

    const divContainer = document.createElement("div");
    divContainer.style.maxWidth = "600px";
    this.domElement.appendChild(divContainer);
    
    const h2 = document.createElement("h2");
    this.header = h2;
    h2.style.color = "black";
    h2.style.fontSize = "25px";
    h2.style.padding = "10px";
    h2.style.borderBottom = "2px solid black";
    h2.textContent = title;

    const contentElement = document.createElement("div");
    contentElement.innerHTML = content;

    divContainer.appendChild(h2);
    divContainer.appendChild(contentElement);
  }

  setStyle1() {
    this.domElement.style.backgroundColor = "black";
    this.domElement.style.color = "rgb(199, 199, 199)";
    this.domElement.style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 0px 10px";
    this.header.style.color = "white";
    this.header.style.borderBottom = "2px solid white";
  }
}