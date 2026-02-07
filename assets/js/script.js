const zipcodeInput = document.getElementById('zipcode');
const form = document.getElementById('user-form');
const statusMessage = document.getElementById('statusMessage');
const locationName = document.getElementById('locationName');
const conditionsText = document.getElementById('conditionsText');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const hiLow = document.getElementById('hiLow');
const visibility = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecast');

const API_KEY = '882d7b151f3175e892df45d1e68ea9dd';
const DEFAULT_ZIP = '37209';

const formatTime = () => {
  const now = new Date();
  const dateElDisplay = document.getElementById('dateDisplay');
  const timeElDisplay = document.getElementById('timeDisplay');

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  dateElDisplay.textContent = dateFormatter.format(now);
  timeElDisplay.textContent = timeFormatter.format(now);
};

const setStatus = (message, tone = 'muted') => {
  statusMessage.textContent = message;
  statusMessage.dataset.tone = tone;
};

const buildIconUrl = (icon) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

const updateCurrentWeather = (data) => {
  const { name, sys, weather, main, wind: windData, visibility: visibilityData } = data;
  const condition = weather[0];

  locationName.textContent = `${name}, ${sys.country}`;
  conditionsText.textContent = condition.description;
  weatherIcon.src = buildIconUrl(condition.icon);
  weatherIcon.alt = condition.description;
  temperature.textContent = `${Math.round(main.temp)}°`;
  feelsLike.textContent = `Feels like ${Math.round(main.feels_like)}°`;
  humidity.textContent = `${main.humidity}%`;
  wind.textContent = `${Math.round(windData.speed)} mph`;
  hiLow.textContent = `${Math.round(main.temp_max)}° / ${Math.round(main.temp_min)}°`;
  visibility.textContent = `${(visibilityData / 1609).toFixed(1)} mi`;
};

const buildForecastCards = (forecastList) => {
  forecastContainer.innerHTML = '';
  const daily = {};

  forecastList.forEach((entry) => {
    const [date, time] = entry.dt_txt.split(' ');
    if (!daily[date] || time === '12:00:00') {
      daily[date] = entry;
    }
  });

  Object.values(daily)
    .slice(0, 5)
    .forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'forecast-card';

      const date = new Date(entry.dt * 1000);
      const dayName = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(date);

      card.innerHTML = `
        <p class="eyebrow">${dayName}</p>
        <img src="${buildIconUrl(entry.weather[0].icon)}" alt="${entry.weather[0].description}" />
        <p class="forecast-temp">${Math.round(entry.main.temp)}°</p>
        <p>${entry.weather[0].description}</p>
      `;

      forecastContainer.appendChild(card);
    });
};

const fetchWeather = async (zip) => {
  setStatus('Fetching the latest conditions...', 'info');

  try {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&appid=${API_KEY}`
    );

    if (!currentResponse.ok) {
      throw new Error('Unable to find that location. Please try another zip.');
    }

    const currentData = await currentResponse.json();
    updateCurrentWeather(currentData);

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&units=imperial&appid=${API_KEY}`
    );

    if (!forecastResponse.ok) {
      throw new Error('Forecast data is unavailable right now.');
    }

    const forecastData = await forecastResponse.json();
    buildForecastCards(forecastData.list);

    setStatus(`Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`);
  } catch (error) {
    setStatus(error.message, 'error');
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const zipValue = zipcodeInput.value.trim() || DEFAULT_ZIP;
  fetchWeather(zipValue);
});

formatTime();
setInterval(formatTime, 60000);
fetchWeather(DEFAULT_ZIP);
