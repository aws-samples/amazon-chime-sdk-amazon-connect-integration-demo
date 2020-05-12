export function domElement(className) {
  return document.getElementsByClassName(className)[0];
}

export function domShow(className) {
  const element = domElement(className);
  element.style.display = 'block';
  element.setAttribute('show', 'true');
}

export function domHide(className) {
  const element = domElement(className);
  element.style.display = 'none';
  element.setAttribute('show', 'false');
}