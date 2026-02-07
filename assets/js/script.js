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

// WARNING: API key is exposed in client-side code. This key should be:
// 1. Moved to a backend/proxy service to hide it from users
// 2. Restricted with API key restrictions (domain/IP allowlists) in OpenWeatherMap dashboard
// 3. Rotated immediately if this code is public
// For production, use environment variables and a backend service to proxy API requests
const API_KEY = window.OPENWEATHERMAP_API_KEY || '882d7b151f3175e892df45d1e68ea9dd';
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
  weatherIcon.style.display = 'block';
  temperature.textContent = `${Math.round(main.temp)}°`;
  feelsLike.textContent = `Feels like ${Math.round(main.feels_like)}°`;
  humidity.textContent = `${main.humidity}%`;
  wind.textContent = `${Math.round(windData.speed)} mph`;
  // Note: temp_max/temp_min from current conditions are not true daily high/low
  // They represent the current high/low within the city's observation area
  hiLow.textContent = `${Math.round(main.temp_max)}° / ${Math.round(main.temp_min)}°`;
  visibility.textContent = Number.isFinite(visibilityData)
    ? `${(visibilityData / 1609).toFixed(1)} mi`
    : '--';
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

      const dayEl = document.createElement('p');
      dayEl.className = 'eyebrow';
      dayEl.textContent = dayName;

      const iconEl = document.createElement('img');
      iconEl.src = buildIconUrl(entry.weather[0].icon);
      iconEl.alt = entry.weather[0].description;

      const tempEl = document.createElement('p');
      tempEl.className = 'forecast-temp';
      tempEl.textContent = `${Math.round(entry.main.temp)}°`;

      const descriptionEl = document.createElement('p');
      descriptionEl.textContent = entry.weather[0].description;

      card.appendChild(dayEl);
      card.appendChild(iconEl);
      card.appendChild(tempEl);
      card.appendChild(descriptionEl);

      forecastContainer.appendChild(card);
    });
};

const validateZipCode = (zip) => {
  // US ZIP codes are 5 digits, optionally followed by a dash and 4 more digits
  const zipPattern = /^\d{5}(-\d{4})?$/;
  return zipPattern.test(zip);
};

const fetchWeather = async (zip) => {
  setStatus('Fetching the latest conditions...', 'info');

  // Validate ZIP code format
  if (!validateZipCode(zip)) {
    setStatus('Please enter a valid 5-digit ZIP code.', 'error');
    return;
  }

  try {
    // Encode ZIP code to prevent injection attacks
    const encodedZip = encodeURIComponent(zip);
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?zip=${encodedZip},us&units=imperial&appid=${API_KEY}`
    );

    let currentData = null;
    if (currentResponse.ok) {
      try {
        currentData = await currentResponse.json();
      } catch (parseError) {
        // If the response was OK but we couldn't parse JSON, treat as a service error
        throw new Error('Received malformed weather data from the service. Please try again later.');
      }
    } else {
      // Try to parse error response, but don't fail if we can't
      try {
        currentData = await currentResponse.json();
      } catch (parseError) {
        // Ignore parse errors for error responses - we'll use status code instead
      }
    }

    if (!currentResponse.ok) {
      let errorMessage;
      switch (currentResponse.status) {
        case 401:
          errorMessage = 'Weather service authentication failed. Please check the API configuration.';
          break;
        case 404:
          errorMessage = 'Unable to find that location. Please check the ZIP code and try again.';
          break;
        case 429:
          errorMessage = 'Weather service rate limit reached. Please wait a moment and try again.';
          break;
        default:
          if (currentData && typeof currentData.message === 'string' && currentData.message.trim()) {
            errorMessage = `Weather service error: ${currentData.message}`;
          } else {
            errorMessage = 'Unable to retrieve weather data at the moment. Please try again later.';
          }
      }
      throw new Error(errorMessage);
    }

    updateCurrentWeather(currentData);

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?zip=${encodedZip},us&units=imperial&appid=${API_KEY}`
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
