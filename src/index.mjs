  // Import styles
import "./styles.css";

// Global API Key
const apiKey = '0613cb414f25bfe37beaab9e4a2a5534';

// Handle form submission for city input
document.getElementById('weather-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const city = document.getElementById('city-input').value;
  getWeatherForCity(city);
});

// Get weather for a specific city
function getWeatherForCity(city) {
  getCoordinates(city)
    .then(coords => getForecast(coords.lat, coords.lon))
    .then(data => displayWeatherData(data, city)) // Pass the city name to the display function
    .catch(handleError);
}

// Get the geolocation coordinates
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const currentCity = "Adelaide"; // Replace with a function to get the city name from coordinates if needed
      getForecast(position.coords.latitude, position.coords.longitude)
        .then(data => displayWeatherData(data, currentCity)) // Pass "Current Location" or city name
        .catch(handleError);
    }, handleError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}


// Fetch coordinates based on city name
function getCoordinates(city) {
  return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      if (!data || !data.coord) {
        throw new Error('City not found');
      }
      return data.coord;
    });
}

// Fetch weather forecast using coordinates
function getForecast(lat, lon) {
  return fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=metric`)
    .then(response => response.json());
}

function displayWeatherData(data, locationName) {
  const weatherDiv = document.getElementById('weather');
  const forecastDiv = document.getElementById('forecast');

  // Today's weather data
  const today = data.daily[0];
  const todayDate = new Date(today.dt * 1000); // Convert Unix timestamp to Date object
  let todayWeatherHTML = `
    <div>
      <h3>Weather today in ${locationName}</h3> 
      <div class="today-weather">
        <img class="current-weather-icon" src="http://openweathermap.org/img/wn/${today.weather[0].icon}@4x.png" alt="Weather Icon">
        <p class="current-temp">${Math.round(today.temp.day)}°</p>
        <div class="today-weather-column">
          <p class="today-weather-desc">${today.weather[0].description}</p>
          <p>Max ${Math.round(today.temp.max)}° &nbsp&nbsp Min ${Math.round(today.temp.min)}°</p>
        </div>
      </div>
    </div>`;

  // 7-Day forecast data

  let forecastHTML = ``;
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  data.daily.slice(0,7).forEach((day, index) => {
    const date = new Date(day.dt * 1000);
    let dayOfWeek = daysOfWeek[date.getDay()];
    let dayOfMonth = date.getDate();
    let dayLabel = index === 0 ? "Today" : `Day ${index + 1}`;
    forecastHTML += `
   
      <div class="forecast-item">
        <h4>${dayLabel} ${dayOfWeek} ${dayOfMonth}</h4>
        <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather Icon">
        <p>${Math.round(day.temp.day)}° &nbsp ${Math.round(day.temp.night)}°</p>
        <p>${day.weather[0].description}</p>
       
      </div>
    
    `;
  });

  // Set the innerHTML of the corresponding DIVs
  weatherDiv.innerHTML = todayWeatherHTML;
  forecastDiv.innerHTML = forecastHTML;
}



// Handle any errors during fetch operations
function handleError(error) {
  console.error('Error: ', error.message || error);
  alert('An error occurred: ' + (error.message || error));
}

// Call this function when the page loads
getLocation();
