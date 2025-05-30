import { format, getHours, isToday } from "date-fns";
import { createElement, get, getHourFromTime } from "./helpers";
import { weatherIcons } from "./assets/weather-icons";
import "./styles.css";

const getWeather = async (location) => {
  return await get(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=EQ2SHR68M2XWPVVZH4783SLAA&contentType=json`
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
      const currentHour = getHours(new Date());
      const currentTemp = createElement("div", { className: "current-temp" });

      const calc = Math.round(((day.hours[currentHour].temp - range.min) / (range.max - range.min)) * 150) - 4;
      currentTemp.style.setProperty("--current-temp", `${calc}px`);
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

const addSuns = (hours, day) => {
  const earliestHour = getHourFromTime(hours[0].datetime);
  const sunriseHour = getHourFromTime(day.sunrise);
  const sunsetHour = getHourFromTime(day.sunset);

  if (earliestHour < sunriseHour) {
    const index = hours.findIndex((hour) => getHourFromTime(hour.datetime) === sunriseHour);

    if (index === -1) {
      return;
    }

    hours.splice(index + 1, 0, { datetime: day.sunrise, icon: "sunrise" });
  }

  if (earliestHour < sunsetHour) {
    const index = hours.findIndex((hour) => getHourFromTime(hour.datetime) === sunsetHour);

    if (index === -1) {
      return;
    }

    hours.splice(index + 1, 0, { datetime: day.sunset, icon: "sunset" });
  }
};

const hourlyForecast = (results) => {
  const text = document.querySelector(".results");
  const currentHour = Number(new Date().toLocaleString("en-AU", { timeZone: results.timezone, hour: "numeric", hour12: false }));

  const today = results.days[0];
  const nextDay = results.days[1];

  const newTodayHours = today.hours.slice(currentHour, 24);
  const newNextDayHours = nextDay.hours.slice(0, -(24 - currentHour));

  addSuns(newTodayHours, today);

  // On the start of the new day, newNextDayHours is empty due to slicing
  if (currentHour !== 0) {
    addSuns(newNextDayHours, nextDay);
  }

  const container = createElement("div", { className: "container" });
  const div = createElement("div", { className: "hourly-view" });

  for (const hours of [...newTodayHours, ...newNextDayHours]) {
    const row = createElement("div", { className: "hourly-row" });

    if (getHourFromTime(hours.datetime) == currentHour) {
      row.append(
        createElement("div", { className: "hourly-time", textContent: "Now" }),
        createElement("img", { className: "", src: weatherIcons[hours.icon], alt: hours.icon }),
        createElement("div", { className: "padding-left capitalise", textContent: `${Math.round(hours.temp)}°` })
      );
    } else if (hours.icon === "sunrise" || hours.icon === "sunset") {
      row.append(
        createElement("div", { className: "hourly-time", textContent: String(hours.datetime.split("").slice(0, 5)).replaceAll(",", "") }),
        createElement("img", { className: "", src: weatherIcons[hours.icon], alt: hours.icon }),
        createElement("div", { className: "capitalise", textContent: hours.icon })
      );
    } else {
      row.append(
        createElement("div", { className: "hourly-time", textContent: hours.datetime.split(":")[0] }),
        createElement("img", { className: "", src: weatherIcons[hours.icon], alt: hours.icon }),
        createElement("div", { className: "padding-left", textContent: `${Math.round(hours.temp)}°` })
      );
    }

    div.append(row);
  }

  container.append(createElement("div", { textContent: "Hourly forecast", className: "view-header hourly" }), div);
  text.append(container);
};

const dayDescription = (results) => {
  const text = document.querySelector(".results");
  const container = createElement("div", { className: "container" });

  container.append(
    createElement("div", { textContent: results.resolvedAddress, className: "resolved-address" }),
    createElement("div", { textContent: results.description })
  );
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

    dayDescription(results);
    hourlyForecast(results);
    daysForecast(results);
  } catch (e) {
    text.textContent = "";
    text.textContent = e;
    console.log(e);
  }
});
