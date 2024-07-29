const API_KEY = 'YAIzaSyCgsOf6r2z3R_em8hzSDn4IYX06MLYMNKc';

document.getElementById('search-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const city = document.getElementById('city-input').value.trim();
  if (city) {
    fetchWeatherData(city);
    addToSearchHistory(city);
  }
});

function fetchWeatherData(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      displayCurrentWeather(data);
      displayForecast(data);
    })
    .catch(error => console.error('Error fetching weather data:', error));
}

function displayCurrentWeather(data) {
  const currentWeather = data.list[0]; // Assuming the first entry is the current weather

  const date = new Date(currentWeather.dt_txt).toLocaleDateString();
  const temp = currentWeather.main.temp;
  const humidity = currentWeather.main.humidity;
  const windSpeed = currentWeather.wind.speed;
  const icon = `http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png`;

  document.getElementById('current-weather').innerHTML = `
    <h2>Current Weather</h2>
    <p><strong>City:</strong> ${data.city.name}</p>
    <p><strong>Date:</strong> ${date}</p>
    <img src="${icon}" alt="Weather Icon">
    <p><strong>Temperature:</strong> ${temp}°C</p>
    <p><strong>Humidity:</strong> ${humidity}%</p>
    <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
  `;
}

function displayForecast(data) {
  const forecastList = data.list.filter((item, index) => index % 8 === 0); // Filter to get one entry per day

  let forecastHTML = '<h2>5-Day Forecast</h2>';
  
  forecastList.forEach(forecast => {
    const date = new Date(forecast.dt_txt).toLocaleDateString();
    const temp = forecast.main.temp;
    const humidity = forecast.main.humidity;
    const windSpeed = forecast.wind.speed;
    const icon = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

    forecastHTML += `
      <div class="forecast-day">
        <h3>${date}</h3>
        <img src="${icon}" alt="Weather Icon">
        <p><strong>Temperature:</strong> ${temp}°C</p>
        <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
      </div>
    `;
  });

  document.getElementById('forecast').innerHTML = forecastHTML;
}

function addToSearchHistory(city) {
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    updateSearchHistoryList();
  }
}

function updateSearchHistoryList() {
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = '';
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  
  searchHistory.forEach(city => {
    const listItem = document.createElement('li');
    listItem.textContent = city;
    listItem.addEventListener('click', () => fetchWeatherData(city));
    historyList.appendChild(listItem);
  });
}

// Initialize search history on page load
document.addEventListener('DOMContentLoaded', updateSearchHistoryList);
