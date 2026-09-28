const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusMsg = document.getElementById("statusMsg");
const currentCard = document.getElementById("currentCard");
const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const windEl = document.getElementById("wind");
const conditionEl = document.getElementById("condition");
const forecastBody = document.getElementById("forecastBody");

// TASK 1 
function describeWeatherCode(code) {
  if (code === 0) return "Clear sky";
  if (code >= 1 && code <= 3) return "Partly cloudy";
  if (code == 45 || code == 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}

// TASK 2 
function setStatus(message, isError = false) {
  statusMsg.textContent = message;
  if (isError) {
    statusMsg.classList.add("error");
  } else {
    statusMsg.classList.remove("error");
  }
}

async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed");
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error("City not found — try another name.");
  return data.results[0];
}

async function fetchForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forecast request failed");
  return res.json();
}

// TASK 3 
function renderCurrentWeather(place, weatherData) {
  const current = weatherData.current_weather;
  cityNameEl.textContent = `${place.name}, ${place.country}`;
  tempEl.textContent = `${current.temperature} °C`;
  windEl.textContent = `${current.windspeed} km/h`;
  conditionEl.textContent = describeWeatherCode(current.weathercode);
  currentCard.classList.remove("hidden");
}

// TASK 4 
function renderForecastTable(daily) {
  forecastBody.innerHTML = "";
  daily.time.forEach((date, i) => {
    const row = document.createElement("tr");
    const condition = describeWeatherCode(daily.weathercode[i]);
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min[i];
    const precip = daily.precipitation_sum[i];
    
    row.innerHTML = `
      <td>${date}</td>
      <td>${condition}</td>
      <td>${maxTemp} °C</td>
      <td>${minTemp} °C</td>
      <td>${precip} mm</td>
    `;
    
    // Stretch Goal: Highlight rainy days
    if (precip > 0) {
      row.classList.add("rainy");
    }
    
    forecastBody.appendChild(row);
  });
}

// TASK 5 
async function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    setStatus("Please type a city name.", true);
    return;
  }
  
  currentCard.classList.add("hidden");
  forecastBody.innerHTML = "";
  setStatus("Loading...", false);
  
  try {
    const place = await geocodeCity(city);
    const weatherData = await fetchForecast(place.latitude, place.longitude);
    renderCurrentWeather(place, weatherData);
    renderForecastTable(weatherData.daily);
    setStatus("");
  } catch (error) {
    setStatus(error.message || "An error occurred while fetching weather data.", true);
  }
}

// TASK 6 
searchBtn.addEventListener("click", handleSearch);

// TASK 7 
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});