export const createElement = (tag, attributes = {}, ...children) => {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    element[key] = value;
  }
  for (const child of children) {
    element.appendChild(child);
  }
  return element;
};
