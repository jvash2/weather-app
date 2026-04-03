const form = document.getElementById("weather-form");
const input = document.getElementById("city-input");

const loading = document.getElementById("loading");
const error = document.getElementById("error");
const result = document.getElementById("result");

const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const iconEl = document.getElementById("icon");

function showLoading() {
  loading.classList.remove("hidden");
  error.classList.add("hidden");
  result.classList.add("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}

function saveCity(city) {
  localStorage.setItem("lastCity", city);
}

function getSavedCity() {
  return localStorage.getItem("lastCity");
}

// Traducción simple del clima
function weatherDescription(code) {
  if (code === 0) return "Despejado";
  if (code < 3) return "Parcialmente nublado";
  if (code < 50) return "Nublado";
  if (code < 70) return "Lluvia";
  if (code < 90) return "Tormenta";
  return "Clima desconocido";
}

async function getCoordsByCity(city) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=es`
  );
  const data = await res.json();
  if (!data.results) throw new Error("Ciudad no encontrada");
  return data.results[0];
}

async function fetchWeather(lat, lon, cityName) {
  showLoading();

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await res.json();

    cityEl.textContent = cityName;
    tempEl.textContent = `${Math.round(data.current_weather.temperature)} °C`;
    descEl.textContent = weatherDescription(data.current_weather.weathercode);
    iconEl.src = "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";

    result.classList.remove("hidden");
    saveCity(cityName);

  } catch (err) {
    error.textContent = err.message;
    error.classList.remove("hidden");
  } finally {
    hideLoading();
  }
}

// Buscar por ciudad
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const city = input.value.trim();
    const location = await getCoordsByCity(city);
    fetchWeather(location.latitude, location.longitude, location.name);
  } catch (err) {
    error.textContent = err.message;
    error.classList.remove("hidden");
  }
});

// Inicio automático
window.addEventListener("load", () => {
  const savedCity = getSavedCity();
  if (savedCity) {
    form.dispatchEvent(new Event("submit"));
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      fetchWeather(
        pos.coords.latitude,
        pos.coords.longitude,
        "Tu ubicación"
      );
    });
  }
});

