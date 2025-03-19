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

export const get = async (url) => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      return response.json();
    } else {
      return response.status;
    }
  } catch (e) {
    console.log(e);
  }
};
