const zipcodeInput = document.getElementById("zipcode");
const form = document.getElementById("user-form");
const statusMessage = document.getElementById("statusMessage");
const locationName = document.getElementById("locationName");
const conditionsText = document.getElementById("conditionsText");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const hiLow = document.getElementById("hiLow");
const visibility = document.getElementById("visibility");
const forecastContainer = document.getElementById("forecast");

const API_KEY = WEATHER_CONFIG?.API_KEY;
const DEFAULT_ZIP = "37209";
const ZIP_REGEX = /^\d{5}(?:-\d{4})?$/;

const formatTime = () => {
  const now = new Date();
  const dateElDisplay = document.getElementById("dateDisplay");
  const timeElDisplay = document.getElementById("timeDisplay");

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  dateElDisplay.textContent = dateFormatter.format(now);
  timeElDisplay.textContent = timeFormatter.format(now);
};

const setStatus = (message, tone = "muted") => {
  statusMessage.textContent = message;
  statusMessage.dataset.tone = tone;
};

const buildIconUrl = (icon) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

const updateCurrentWeather = (data) => {
  const {
    name,
    sys,
    weather,
    main,
    wind: windData,
    visibility: visibilityData,
  } = data;
  const condition = weather[0];

  locationName.textContent = `${name}, ${sys.country}`;
  conditionsText.textContent = condition.description;
  weatherIcon.src = buildIconUrl(condition.icon);
  weatherIcon.alt = condition.description;
  temperature.textContent = `${Math.round(main.temp)}°`;
  feelsLike.textContent = `Feels like ${Math.round(main.feels_like)}°`;
  humidity.textContent = `${main.humidity}%`;
  wind.textContent = `${Math.round(windData.speed)} mph`;
  if (Number.isFinite(visibilityData)) {
    visibility.textContent = `${(visibilityData / 1609).toFixed(1)} mi`;
  } else {
    visibility.textContent = "N/A";
  }
};

const clearForecast = () => {
  while (forecastContainer.firstChild) {
    forecastContainer.removeChild(forecastContainer.firstChild);
  }
};

const buildForecastCards = (forecastList) => {
  clearForecast();
  const daily = {};

  forecastList.forEach((entry) => {
    const [date, time] = entry.dt_txt.split(" ");
    if (!daily[date] || time === "12:00:00") {
      daily[date] = entry;
    }
  });

  Object.values(daily)
    .slice(0, 5)
    .forEach((entry) => {
      const card = document.createElement("div");
      card.className = "forecast-card";

      const date = new Date(entry.dt * 1000);
      const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(date);

      const dayLabel = document.createElement("p");
      dayLabel.className = "eyebrow";
      dayLabel.textContent = dayName;

      const icon = document.createElement("img");
      icon.src = buildIconUrl(entry.weather[0].icon);
      icon.alt = entry.weather[0].description;

      const temp = document.createElement("p");
      temp.className = "forecast-temp";
      temp.textContent = `${Math.round(entry.main.temp)}°`;

      const desc = document.createElement("p");
      desc.textContent = entry.weather[0].description;

      card.appendChild(dayLabel);
      card.appendChild(icon);
      card.appendChild(temp);
      card.appendChild(desc);

      forecastContainer.appendChild(card);
    });
};

const isSameDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const updateHighLowFromForecast = (forecastList) => {
  if (!forecastList || forecastList.length === 0) {
    hiLow.textContent = "--° / --°";
    return;
  }

  const anchorDate = new Date(forecastList[0].dt * 1000);
  const temps = forecastList
    .filter((entry) => isSameDay(new Date(entry.dt * 1000), anchorDate))
    .map((entry) => entry.main.temp)
    .filter((value) => Number.isFinite(value));

  if (temps.length === 0) {
    hiLow.textContent = "--° / --°";
    return;
  }

  const high = Math.max(...temps);
  const low = Math.min(...temps);
  hiLow.textContent = `${Math.round(high)}° / ${Math.round(low)}°`;
};

const buildWeatherUrl = (endpoint, zip) => {
  const params = new URLSearchParams({
    zip: `${zip},us`,
    units: "imperial",
    appid: API_KEY,
  });

  return `https://api.openweathermap.org/data/2.5/${endpoint}?${params.toString()}`;
};

const getApiErrorMessage = (status, context) => {
  if (status === 401) {
    return "Weather service rejected the request. Check the API key configuration.";
  }
  if (status === 404) {
    return `No ${context} data found for that ZIP code.`;
  }
  if (status === 429) {
    return "Weather service rate limit reached. Please try again shortly.";
  }
  if (status >= 500) {
    return "Weather service is unavailable right now. Please try again later.";
  }
  return `Unable to fetch ${context} data right now.`;
};

const fetchWeather = async (zip) => {
  if (!API_KEY) {
    setStatus("Missing API key configuration.", "error");
    return;
  }

  if (!ZIP_REGEX.test(zip)) {
    setStatus("Please enter a valid 5-digit ZIP code.", "error");
    return;
  }

  setStatus("Fetching the latest conditions...", "info");

  try {
    const currentResponse = await fetch(buildWeatherUrl("weather", zip));

    if (!currentResponse.ok) {
      throw new Error(
        getApiErrorMessage(currentResponse.status, "current weather")
      );
    }

    const currentData = await currentResponse.json();
    updateCurrentWeather(currentData);

    const forecastResponse = await fetch(buildWeatherUrl("forecast", zip));

    if (!forecastResponse.ok) {
      throw new Error(getApiErrorMessage(forecastResponse.status, "forecast"));
    }

    const forecastData = await forecastResponse.json();
    buildForecastCards(forecastData.list);
    updateHighLowFromForecast(forecastData.list);

    setStatus(
      `Updated ${new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}.`
    );
  } catch (error) {
    setStatus(error.message, "error");
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const zipValue = (zipcodeInput.value.trim() || DEFAULT_ZIP).toUpperCase();
  if (!ZIP_REGEX.test(zipValue)) {
    setStatus("Please enter a valid 5-digit ZIP code.", "error");
    return;
  }
  fetchWeather(zipValue);
});

formatTime();
setInterval(formatTime, 60000);
fetchWeather(DEFAULT_ZIP);
