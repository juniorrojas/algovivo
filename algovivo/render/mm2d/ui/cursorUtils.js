function computeDomCursor(event, domElement) {
  let clientX, clientY;
  if (event.touches == null) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    if (event.touches.length == 0) return null;
    const touch = event.touches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  }

  // get cumulative transformation matrix
  let matrix = new DOMMatrix();
  let element = domElement;
  while (element != null) {
    const style = window.getComputedStyle(element);
    const elementMatrix = new DOMMatrix(style.transform);
    matrix = elementMatrix.multiply(matrix);
    element = element.parentElement;
  }
  const matrixInverse = matrix.inverse();

  // compute cursor position in the domElement's coordinate system
  const clientPos = new DOMPointReadOnly(clientX, clientY);
  const transformedClientPos = clientPos.matrixTransform(matrixInverse);

  // transform domElement's bounding rectangle
  const rect = domElement.getBoundingClientRect();
  const topLeft = new DOMPointReadOnly(rect.left, rect.top);
  const transformedTopLeft = topLeft.matrixTransform(matrixInverse);

  const x = transformedClientPos.x - transformedTopLeft.x;
  const y = transformedClientPos.y - transformedTopLeft.y;
  const cursor = [x, y];
  return cursor;
}

module.exports = {
  computeDomCursor: computeDomCursor
}