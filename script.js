const apiKey = "703d7e856339df4ee69fe88cfae63762";
const apiBase = "https://api.openweathermap.org/data/2.5/";

async function getWeather(city) {
    try {
        const response = await fetch(`${apiBase}weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error("City not found");
        }
        const data = await response.json();
        updateCurrentWeather(data);
        getForecast(city);
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

async function getForecast(city) {
    try {
        const response = await fetch(`${apiBase}forecast?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error("Forecast not found");
        }
        const data = await response.json();
        updateForecastUI(data.list);
    } catch (error) {
        console.error(error);
    }
}

function updateCurrentWeather(data) {
    // Basic Info
    document.getElementById("cityName").textContent = data.name + ", " + data.sys.country;
    document.getElementById("currentTemp").innerHTML = Math.round(data.main.temp) + "°c";
    document.getElementById("weatherDesc").innerHTML = data.weather[0].description;
    document.getElementById("mainIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    // Date
    const now = new Date();
    document.getElementById("currentDate").textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Highlights
    document.getElementById("windSpeed").innerHTML = data.wind.speed;
    document.getElementById("windDir").innerHTML = getWindDirection(data.wind.deg);

    document.getElementById("humidity").innerHTML = data.main.humidity;
    document.getElementById("humidityProgress").style.width = `${data.main.humidity}%`;

    document.getElementById("visibility").innerHTML = (data.visibility / 1000).toFixed(1);
    document.getElementById("visibilityStatus").innerHTML = getVisibilityStatus(data.visibility);

    document.getElementById("feelsLike").innerHTML = Math.round(data.main.feels_like);
    document.getElementById("pressure").innerHTML = data.main.pressure;

    // Sunrise/Sunset
    document.getElementById("sunrise").innerHTML = formatTime(data.sys.sunrise, data.timezone);
    document.getElementById("sunset").innerHTML = formatTime(data.sys.sunset, data.timezone);

    // Map
    updateMap(data.coord.lat, data.coord.lon, data.name);
}

// Map Initialization
let map;
function updateMap(lat, lon, cityName) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        L.marker([lat, lon]).addTo(map).bindPopup(cityName).openPopup();
    } else {
        map.flyTo([lat, lon], 10);
        // Remove old markers to avoid clutter
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
        L.marker([lat, lon]).addTo(map).bindPopup(cityName).openPopup();
    }
}




function updateForecastUI(forecastList) {
    const listContainer = document.getElementById("forecastList");
    listContainer.innerHTML = ""; // Clear existing

    // Filter for one reading per day (e.g., around 12:00 PM)
    // The API returns data every 3 hours. 
    const dailyForecasts = forecastList.filter(item => item.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;

        const forecastItem = `
            <div class="forecast-item">
                <span class="day">${dayName}</span>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon" class="f-icon">
                <span class="f-temp">${temp}°C</span>
            </div>
        `;
        listContainer.insertAdjacentHTML("beforeend", forecastItem);
    });
}

// Helpers
function formatTime(unixTime, timezoneOffset) {
    // Timezone offset is in seconds, javascript Date uses milliseconds
    // Note: Creating a date with local timezone adjustment can be tricky. 
    // Simple approach: show specific time in local string if needed, 
    // but for simple "sunrise/sunset", just converting unix to readable time string:
    const d = new Date(unixTime * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getWindDirection(deg) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
}

function getVisibilityStatus(meters) {
    if (meters >= 10000) return "Excellent";
    if (meters >= 5000) return "Good";
    if (meters >= 2000) return "Moderate";
    return "Poor";
}



// Event Listeners
const searchInput = document.getElementById("cityInput");
const searchBtn = document.querySelector(".search-container i");

searchBtn.addEventListener("click", () => {
    if (searchInput.value) getWeather(searchInput.value);
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchInput.value) {
        getWeather(searchInput.value);
    }
});

// Initial Load
getWeather("Amravati");
