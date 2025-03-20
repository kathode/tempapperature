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
      try {
        return await response.json();
      } catch (jsonError) {
        console.log("Error parsing JSON:", jsonError);
        throw jsonError;
      }
    } else {
      const error = new Error(`HTTP error! status: ${response.status}`);
      console.log(error);
      throw error;
    }
  } catch (e) {
    console.log("Network error:", e);
    throw e;
  }
};
