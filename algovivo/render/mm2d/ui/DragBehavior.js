const cursorUtils = require("./cursorUtils");

class DragBehavior {
  constructor(args = {}) {
    this._dragging = false;

    this.onDomCursorDown = args.onDomCursorDown;
    this.onDragProgress = args.onDragProgress;
    this.onDomCursorUp = args.onDomCursorUp;

    this.domElement = null;
  }

  beginDrag() {
    this._dragging = true;
  }

  endDrag() {
    this._dragging = false;
  }

  dragging() {
    return this._dragging;
  }

  domCursorDown(domCursor, event) {
    if (this.onDomCursorDown != null) this.onDomCursorDown(domCursor, event);
  }

  domCursorMove(domCursor, event) {
    if (!this.dragging()) return;
    if (this.onDragProgress != null) this.onDragProgress(domCursor, event);
  }

  domCursorUp(domCursor, event) {
    this.endDrag();
    if (this.onDomCursorUp != null) this.onDomCursorUp(domCursor, event);
  }

  linkToDom(domElement) {
    if (this.domElement != null) {
      throw new Error("already linked to DOM");
    }
    this.domElement = domElement;
    const onDomCursorDown = (event) => {
      event.preventDefault();
      const domCursor = cursorUtils.computeDomCursor(event, domElement);
      this.domCursorDown(domCursor, event);
    }
    domElement.addEventListener("mousedown", onDomCursorDown, {passive: false});
    domElement.addEventListener("touchstart", onDomCursorDown, {passive: false});
    
    const onDomCursorMove = (event) => {
      const domCursor = cursorUtils.computeDomCursor(event, domElement);
      this.domCursorMove(domCursor, event);
    }
    domElement.addEventListener("mousemove", onDomCursorMove, {passive: false});
    domElement.addEventListener("touchmove", onDomCursorMove, {passive: false});

    const onDomCursorUp = (event) => {
      const domCursor = cursorUtils.computeDomCursor(event, domElement);
      this.domCursorUp(domCursor, event);
    }
    window.addEventListener("mouseup", onDomCursorUp);
    window.addEventListener("touchend", onDomCursorUp);
    window.addEventListener("touchcancel", onDomCursorUp);
  }
}

module.exports = DragBehavior;