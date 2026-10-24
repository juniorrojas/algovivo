import Section from "./Section.js";
import sectionDefs from "./sections/index.js";

export default class Sections {
  constructor() {
    this.domElement = document.createElement("div");
    this.domElement.style.textAlign = "left";
    this.domElement.style.color = "#666";
    this.domElement.style.fontSize = "14px";
    this.domElement.style.width = "100%";
    this.domElement.style.display = "flex";
    this.domElement.style.flexDirection = "column";

    for (const def of sectionDefs) {
      const s = this.addSection(def.title, def.content);
      if (def.dark) s.setStyle1();
    }
    this.actuationSlot = this.domElement.querySelector(".actuation-demo");
  }

  addSection(title, content) {
    const section = new Section(title, content);
    this.domElement.appendChild(section.domElement);
    return section;
  }
}
