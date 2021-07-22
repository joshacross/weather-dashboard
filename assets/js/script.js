//////////DOM/////////////
var zipcode = document.getElementById('zipcode');
var city = document.getElementById('city');
// var week = document.getElementById('week').addEventListener('click', getWeatherForecast());
// var submit = document.getElementById('submit').addEventListener('submit', getWeather());
//////////////////////////

/////////////////////////

//TIME Variables//
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var hrs = today.getHours();
var mins = today.getMinutes();
today = mm + '/' + dd + '/' + yyyy;

var time = hrs + ":" + mins;

console.log(today, time);
//////////////////////////

//////TIME function //////
var displayDate = function() {
    // find date and time elements
    var dateElDisplay = document.getElementById('dateDisplay');
    var timeElDisplay = document.getElementById('timeDisplay');
    // add display text
    dateElDisplay.innerHTML = today;
    timeElDisplay.innerHTML = time;
}

displayDate();
///////////////////////

/////DISPLAY Zipcode/////

//WEATHER Variables///
let weatherContainer = document.getElementById('weatherContainer');
let thunderStorm = document.getElementById('thunderStorm');
let cloudy = document.getElementById('cloudy');
let snow = document.getElementById('snow');
let sunny = document.getElementById('sunny');
let rainy = document.getElementById('rainy');
let sunShower = document.querySelector('#sunShower');
let sunShowerStatement = document.querySelector('.sunShowerStatement');
let thunderStormStatement = document.querySelector('.thunderStormStatement');
let cloudyStatement = document.querySelector('.cloudyStatement');
let snowStatement = document.querySelector('.snowStatement');
let sunnyStatement = document.querySelector('.sunnyStatement');
let rainyStatement = document.querySelector('.rainyStatement');
let data;

// Weather Api Fetch//
getWeatherData = () => {
    // format "open weather map" api url
    let apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + 'nashville' + '&appid=882d7b151f3175e892df45d1e68ea9dd' + "&units=imperial";
    // make a request to the url
    fetch(apiUrl)
      .then(function (response) {
        if (response.ok) {
            console.log(response);
          return response.json()

        } else {
          throw new Error('Something went wrong.');
        }
      }).then(function (data) {
        console.log(data.main);
        let weatherIcon = data.weather[0].icon;
        animatedIcon(weatherIcon);
  
        // a variable to hold temperature
        let temperatureEl = data.main.temp;
        // pass variable to function
        showTemp(temperatureEl);
  
      }).catch(function (error) {
        console.log(error);
      });
  };
  
  const showTemp = (temperatureEl) => {
    // create an H4 element for temp
    var tempEl = document.createElement("h4");
    // add text content
    tempEl.textContent = "The current temperature is " + temperatureEl + "˚F";
    // add class to align content to center
    tempEl.className = "text-center";
    // append child
    weatherContainer.append(tempEl);
  };

  animatedIcon = (weatherIcon) => {
    /* hide html elements */
    sunShower.setAttribute('class', 'hide');
    sunShowerStatement.setAttribute('class', 'hide');
    thunderStorm.setAttribute('class', 'hide');
    thunderStormStatement.setAttribute('class', 'hide');
    cloudy.setAttribute('class', 'hide');
    cloudyStatement.setAttribute('class', 'hide');
    snow.setAttribute('class', 'hide');
    snowStatement.setAttribute('class', 'hide');
    rainy.setAttribute('class', 'hide');
    rainyStatement.setAttribute('class', 'hide');
    sunny.setAttribute('class', 'hide');
    sunnyStatement.setAttribute('class', 'hide');

    /* Display correct icon for current weather */
    if (weatherIcon === '10n' || weatherIcon === '10d' ||
      weatherIcon === '09d' || weatherIcon === '09n') {
        rainy.setAttribute('class', 'show');
        rainyStatement.setAttribute('class', 'show');
        return;
    } if (weatherIcon === '50d' || weatherIcon === '50n' ||
      weatherIcon === '02n' || weatherIcon === '02d' || weatherIcon === '03n' ||
      weatherIcon === '03d' || weatherIcon === '04n' || weatherIcon === '04d') {
        cloudy.setAttribute('class', 'show');
        cloudyStatement.setAttribute('class', 'show');
        return;
    } if (weatherIcon === '01d' || weatherIcon === '01n') {
        sunny.setAttribute('class', 'show');
        sunnyStatement.setAttribute('class', 'show');
        return;
    } if (weatherIcon === '13d' || weatherIcon === '13n') {
        snow.setAttribute('class', 'show');
        snowStatement.setAttribute('class', 'show');
        return;
    } if (weatherIcon === '11d' || weatherIcon === '11n') {
        thunderStorm.setAttribute('class', 'show');
        thunderStormStatement.setAttribute('class', 'show');
        return;
    }
  
  }
  getWeatherData();

// const getWeatherData = () => {
//     // set the Timelines GET endpoint as the target URL
//     const getTimelineURL = "https://api.tomorrow.io/v4/timelines";

//     // get your key from app.tomorrow.io/development/keys
//     const apikey = "NXotJE61HZOY6tbotAEzU6sVRCYmTd7J";

//     // pick the location, as a latlong pair
//     let location = [40.758, -73.9855];

//     // list the fields
//     const fields = [
//         "precipitationIntensity",
//         "precipitationType",
//         "windSpeed",
//         "windGust",
//         "windDirection",
//         "temperature",
//         "temperatureApparent",
//         "cloudCover",
//         "cloudBase",
//         "cloudCeiling",
//         "weatherCode",
//     ];

//     const units = "imperial";

//     let apiUrl = getTimelineURL + "?q=" + location + apiKey + '&units=' + units;

//     console.log(apiUrl);

//     // const fetch = require("node-fetch");
//     // const queryString = require('query-string');
//     // const moment = require("moment");

//     // set the timesteps, like "current", "1h" and "1d"
//     const timesteps = ["current", "1h", "1d"];

//     // configure the time frame up to 6 hours back and 15 days out
//     const now = todaysDate;
//     const startTime = time;

//     // specify the timezone, using standard IANA timezone format
//     const timezone = "America/New_York";

//     // request the timelines with all the query string parameters as options
//     const getTimelineParameters =  queryString.stringify({
//         apikey,
//         location,
//         fields,
//         units,
//         timesteps,
//         startTime,
//         endTime,
//         timezone,
//     }, {arrayFormat: "comma"});

//     var timeline = function() {
//         fetch(getTimelineURL + "?" + getTimelineParameters, {method: "GET"})
//             .then((result) => result.json(console.log(result)))
//             .then((json) => console.log(json)
//             .catch((error) => console.error("error: " + err))
//         )};
//     timeline();
// } 

document.getElementById('getWeatherBtn').addEventListener('click', getWeatherData);

