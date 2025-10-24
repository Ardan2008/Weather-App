// script.js
const API_KEY = "4ff5ce4d25cc0b40b1c60aa2682d4ae9"; // <-- Ganti dengan API key OpenWeatherMap (contoh: 'abcd1234')
const API_BASE = "https://api.openweathermap.org/data/2.5/weather";

const appEl = document.getElementById("app");
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const geoBtn = document.getElementById("geoBtn");

const loader = document.getElementById("loader");
const weatherEl = document.getElementById("weather");
const errorEl = document.getElementById("error");

const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const locationEl = document.getElementById("location");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");

function showLoader(show = true){
    loader.hidden = !show;
    weatherEl.hidden = show;
    errorEl.hidden = true;
}

function showError(msg){
    loader.hidden = true;
    weatherEl.hidden = true;
    errorEl.hidden = false;
    errorEl.textContent = msg;
}

function formatTimeFromUnix(ts, tzOffsetSec){
    const date = new Date((ts + tzOffsetSec) * 1000); 
    return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
}

async function fetchWeatherByCity(city){
    if (!city) return showError("Masukkan nama kota.");
    showLoader(true);
    try {
        const url = `${API_BASE}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}&lang=id`;
        const res = await fetch(url);
        if (!res.ok){
        if (res.status === 404) throw new Error("Kota tidak ditemukan.");
        throw new Error("Gagal mengambil data cuaca.");
        }
        const data = await res.json();
        renderWeather(data);
    } catch (err){
        showError(err.message);
    }
}

async function fetchWeatherByCoords(lat, lon){
    showLoader(true);
    try {
        const url = `${API_BASE}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=id`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal mengambil data cuaca.");
        const data = await res.json();
        renderWeather(data);
    } catch (err){
        showError(err.message);
    }
}

function renderWeather(data){
    loader.hidden = true;
    errorEl.hidden = true;
    weatherEl.hidden = false;

    const iconCode = data.weather?.[0]?.icon;
    const description = data.weather?.[0]?.description ?? "";
    const temp = Math.round(data.main?.temp);
    const feels = Math.round(data.main?.feels_like);
    const humidity = data.main?.humidity;
    const wind = data.wind?.speed;
    const city = data.name;
    const country = data.sys?.country;
    const timezone = data.timezone ?? 0; // seconds offset from UTC
    const sunrise = data.sys?.sunrise; // unix seconds (UTC)
    const sunset = data.sys?.sunset;

    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconEl.alt = description;
    tempEl.textContent = `${temp}°C`;
    descEl.textContent = description;
    locationEl.textContent = `${city}, ${country}`;
    feelsEl.textContent = `${feels}°C`;
    humidityEl.textContent = `${humidity}%`;
    windEl.textContent = `${wind} m/s`;

    sunriseEl.textContent = formatTimeFromUnix(sunrise, timezone);
    sunsetEl.textContent = formatTimeFromUnix(sunset, timezone);

    // Day / Night mode: compare current UTC time + timezone with sunrise/sunset
    const nowUtcSec = Math.floor(Date.now() / 1000);
    const localNow = nowUtcSec + timezone;
    const isDay = localNow >= sunrise && localNow < sunset;

    if (isDay){
        appEl.classList.remove("night");
        appEl.classList.add("day");
    } else {
        appEl.classList.remove("day");
        appEl.classList.add("night");
    }

    const main = data.weather?.[0]?.main?.toLowerCase() ?? "";
    if (main.includes("rain") || main.includes("drizzle") || main.includes("thunderstorm")){
    }
}

// Event handlers
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = cityInput.value.trim();
    fetchWeatherByCity(q);
    });

    geoBtn.addEventListener("click", () => {
    if (!navigator.geolocation) return showError("Geolocation tidak didukung browser ini.");
    showLoader(true);
    navigator.geolocation.getCurrentPosition(
        (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
        showError("Gagal memperoleh lokasi. Pastikan izin lokasi diberikan.");
        },
        {enableHighAccuracy:true, timeout:10000}
    );
});

window.addEventListener("load", () => {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeatherByCity("Jakarta"),
        {timeout:7000}
        );
    } else {
        fetchWeatherByCity("Jakarta");
    }
});
