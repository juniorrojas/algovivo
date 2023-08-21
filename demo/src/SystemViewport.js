import algovivo from "../../build/algovivo.min.mjs";

export default class SystemViewport extends algovivo.SystemViewport {
  constructor(args = {}) {
    super(args);
    this.setStyle();
  }

  setStyle() {
    this.domElement.style.borderRadius = "10px";
    this.domElement.style.border = "2px solid #c9c9c9";
    this.domElement.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
    
    const mq = window.matchMedia("(max-width: 410px)");
    const updateMq = () => {
      if (mq.matches) {
        this.setSize({ width: 300, height: 350});
      } else {
        this.setSize({ width: 400, height: 400});
      }
    }
    mq.addEventListener("change", (event) => {
      updateMq();
    });
    updateMq();
  }
}
