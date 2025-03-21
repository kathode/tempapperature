import { format, getHours, isToday } from "date-fns";
import { createElement, get, getHourFromTime } from "./helpers";
import { weatherIcons } from "./assets/weather-icons";
import "./styles.css";

const getWeather = async (location) => {
  return await get(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=69GGTP2KYUASSNS52RGQW5QVT&contentType=json`
  );
};

const getRange = (days) => {
  let min = 100;
  let max = 0;

  for (const day of days) {
    if (day.tempmin < min) {
      min = day.tempmin;
    }
    if (day.tempmax > max) {
      max = day.tempmax;
    }
  }

  min = Math.round(min);
  max = Math.round(max);

  return { min, max };
};

const daysForecast = (results) => {
  const text = document.querySelector(".results");
  const container = createElement("div", { className: "container" });
  const range = getRange(results.days);

  container.append(createElement("div", { textContent: "15 day forecast", className: "view-header" }));
  for (const day of results.days) {
    const column = createElement("div", { className: "column" });
    const tempRange = createElement("div", { className: "row range" });
    const minWidth = ((day.tempmin - range.min) / (range.max - range.min)) * 150;
    const maxWidth = ((range.max - day.tempmax) / (range.max - range.min)) * 150;

    tempRange.style.setProperty("--before-width", `${Math.round(minWidth)}px`);
    tempRange.style.setProperty("--after-width", `${Math.round(maxWidth)}px`);

    if (isToday(day.datetime)) {
      const currentTemp = createElement("div", { className: "current-temp" });
      currentTemp.style.setProperty("--current-temp", `${Math.round(((day.temp - range.min) / (range.max - range.min)) * 150) - 4}px`);
      tempRange.append(currentTemp);

      column.append(
        createElement("div", { className: "row", textContent: `Today` }),
        createElement("img", { className: "row", src: weatherIcons[day.icon], alt: day.icon }),
        createElement(
          "div",
          { className: "weather-range" },
          createElement("div", { className: "row center min-temp", textContent: `${Math.round(day.tempmin)}°` }),
          tempRange,
          createElement("div", { className: "row center max-temp", textContent: `${Math.round(day.tempmax)}°` })
        )
      );
      container.append(column);
    } else {
      column.append(
        createElement("div", { className: "row", textContent: format(day.datetime, "EEE") }),
        createElement("img", { className: "row", src: weatherIcons[day.icon], alt: day.icon }),
        createElement(
          "div",
          { className: "weather-range" },
          createElement("div", { className: "row center min-temp", textContent: `${Math.round(day.tempmin)}°` }),
          tempRange,
          createElement("div", { className: "row center max-temp", textContent: `${Math.round(day.tempmax)}°` })
        )
      );
      container.append(column);
    }
  }

  text.append(container);
};

const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const location = event.target.elements.location.value;
  const text = document.querySelector(".results");

  let results;
  try {
    text.textContent = "";
    text.append(createElement("div", { className: "loader" }));
    results = await getWeather(location);
    text.textContent = "";

    daysForecast(results);
  } catch (e) {
    text.textContent = "";
    text.textContent = e;
    console.log(e);
  }
});
