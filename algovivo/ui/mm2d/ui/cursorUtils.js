function computeDomCursor(event, domElement) {
  const rect = domElement.getBoundingClientRect();
  let clientX, clientY;
  if (event.touches == null) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    if (event.touches.length == 0) return null;
    const touch = event.touches[0];
    if (touch != null) {

    }
    clientX = touch.clientX;
    clientY = touch.clientY;
  }
  const left = clientX - rect.left;
  const top = clientY - rect.top;
  const cursor = [left, top];
  return cursor;
}

module.exports = {
  computeDomCursor: computeDomCursor
}