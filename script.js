const recordForm = document.getElementById("recordForm");
const dateInput = document.getElementById("date");
const locationField = document.getElementById("locationField");
const dayField = document.getElementById("dayField");
const tempInput = document.getElementById("temp");
const humidityInput = document.getElementById("hum");
const rainfallInput = document.getElementById("rainfallInput");
const searchInput = document.getElementById("searchDate");
const resultBox = document.getElementById("result");
const loader = document.getElementById("loader");
const rainLayer = document.getElementById("rainLayer");
const liveWeatherForm = document.getElementById("liveWeatherForm");
const locationInput = document.getElementById("locationInput");
const refreshLiveWeatherBtn = document.getElementById("refreshLiveWeatherBtn");
const useLiveWeatherBtn = document.getElementById("useLiveWeatherBtn");
const liveStatus = document.getElementById("liveStatus");
const successBox = document.getElementById("successBox");
const successTitle = document.getElementById("successTitle");
const successMessage = document.getElementById("successMessage");

let latestLiveWeather = null;
let successTimeoutId = null;

function getApiBase() {
    const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (isLocalHost && window.location.port && window.location.port !== "3000") {
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    }

    return "";
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    const rawText = await response.text();

    if (!contentType.includes("application/json")) {
        if (rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")) {
            throw new Error("Live weather API was not found. Start the Node server and open http://localhost:3000.");
        }

        throw new Error("Server returned an unexpected response.");
    }

    const payload = JSON.parse(rawText);

    if (!response.ok) {
        throw new Error(payload.error || "Request failed.");
    }

    return payload;
}

async function fetchTextJson(url, options) {
    const response = await fetch(url, options);
    const rawText = await response.text();
    const payload = JSON.parse(rawText);

    if (!response.ok) {
        throw new Error(payload.error || "Request failed.");
    }

    return payload;
}

const weatherDescriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
};

async function fetchDirectLiveWeather(location) {
    const geocodeUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const geocodeData = await fetchTextJson(geocodeUrl);

    if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error("Location not found.");
    }

    const place = geocodeData.results[0];
    const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
        "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature" +
        "&hourly=temperature_2m" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
        "&timezone=auto";
    const forecastData = await fetchTextJson(forecastUrl);
    const current = forecastData.current;

    return {
        location: [place.name, place.admin1, place.country].filter(Boolean).join(", "),
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: forecastData.timezone,
        current: {
            time: current.time,
            temperature: current.temperature_2m,
            apparentTemperature: current.apparent_temperature,
            humidity: current.relative_humidity_2m,
            precipitation: current.precipitation,
            windSpeed: current.wind_speed_10m,
            weatherCode: current.weather_code
        },
        hourly: (forecastData.hourly?.time || []).slice(0, 8).map((time, index) => ({
            time,
            temperature: forecastData.hourly.temperature_2m[index]
        })),
        daily: (forecastData.daily?.time || []).slice(0, 7).map((time, index) => ({
            time,
            weatherCode: forecastData.daily.weather_code[index],
            maxTemperature: forecastData.daily.temperature_2m_max[index],
            minTemperature: forecastData.daily.temperature_2m_min[index]
        }))
    };
}

function formatMetric(value, unit) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "--";
    }

    return `${Number(value).toFixed(1)}${unit}`;
}

function formatDateForInput(date = new Date()) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function formatDayName(date = new Date()) {
    return date.toLocaleDateString("en-US", {
        weekday: "long"
    });
}

function showLoader() {
    loader.style.display = "block";
}

function hideLoader() {
    loader.style.display = "none";
}

function playSuccessChime() {
    const sound = document.getElementById("successSound");

    sound.play().catch(() => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99];

        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;
            gainNode.gain.value = 0.001;

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const startTime = audioContext.currentTime + index * 0.08;
            gainNode.gain.exponentialRampToValueAtTime(0.09, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.26);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.28);
        });
    });
}

function showSuccess(title = "Record Saved", message = "Your weather data has been added successfully.") {
    successTitle.textContent = title;
    successMessage.textContent = message;
    successBox.classList.remove("show");

    void successBox.offsetWidth;

    successBox.classList.add("show");
    playSuccessChime();
    launchConfetti();

    clearTimeout(successTimeoutId);
    successTimeoutId = setTimeout(() => {
        successBox.classList.remove("show");
    }, 3200);
}

function launchConfetti() {
    const canvas = document.getElementById("confetti");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 6 + 2,
        speed: Math.random() * 3 + 2,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
    }));

    let animationId;

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pieces.forEach((piece) => {
            ctx.fillStyle = piece.color;
            ctx.fillRect(piece.x, piece.y, piece.size, piece.size);
            piece.y += piece.speed;

            if (piece.y > canvas.height) {
                piece.y = -10;
            }
        });

        animationId = requestAnimationFrame(update);
    }

    update();

    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 2500);
}

async function addRecord() {
    const data = {
        date: dateInput.value.trim(),
        location: locationField.value.trim(),
        day: dayField.value.trim(),
        temp: tempInput.value.trim(),
        hum: humidityInput.value.trim(),
        rain: rainfallInput.value.trim()
    };

    if (!data.date || !data.location || !data.day || !data.temp || !data.hum || !data.rain) {
        resultBox.textContent = "Please complete all fields before adding a record.";
        return;
    }

    showLoader();

    try {
        await fetchJson(`${getApiBase()}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        recordForm.reset();
        dateInput.value = formatDateForInput();
        locationField.value = latestLiveWeather?.location || locationInput.value.trim() || "";
        dayField.value = formatDayName();
        showSuccess("Record Added", `Weather data for ${data.date} has been saved.`);
        resultBox.textContent = "Weather record saved.";
    } catch (error) {
        resultBox.textContent = error.message;
    } finally {
        hideLoader();
    }
}

async function searchRecord() {
    const searchDate = searchInput.value.trim();

    if (!searchDate) {
        resultBox.textContent = "Please enter a date to search.";
        return;
    }

    showLoader();

    try {
        const data = await fetchJson(`${getApiBase()}/records`);
        const found = data.find((item) => item.date === searchDate);

        resultBox.textContent = found
            ? `Found -> ${found.location || "Unknown location"} | ${found.day || "Unknown day"} | Temp: ${found.temp} C | Humidity: ${found.hum}% | Rain: ${found.rain} mm`
            : "No record found for that date.";
    } catch (error) {
        resultBox.textContent = "Unable to load saved records right now.";
    } finally {
        hideLoader();
    }
}

function setLiveWeatherStatus(message, isError = false) {
    liveStatus.textContent = message;
    liveStatus.classList.toggle("error-text", isError);
}

function getWeatherGlyph(weatherCode) {
    if ([0, 1].includes(weatherCode)) return "sun";
    if ([2, 3, 45, 48].includes(weatherCode)) return "cloud";
    if ([61, 63, 65, 80, 81, 82, 51, 53, 55].includes(weatherCode)) return "rain";
    if ([95, 96, 99].includes(weatherCode)) return "storm";
    return "cloud";
}

function formatForecastHour(isoTime) {
    return new Date(isoTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true
    });
}

function formatForecastDay(isoDate) {
    return new Date(isoDate).toLocaleDateString("en-US", {
        weekday: "short"
    });
}

function renderHourlyForecast(hourly = []) {
    const chart = document.getElementById("forecastChart");
    const times = document.getElementById("forecastTimes");

    if (!chart || !times || hourly.length === 0) {
        return;
    }

    const temperatures = hourly.map((entry) => Number(entry.temperature));
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const range = Math.max(maxTemp - minTemp, 1);

    chart.innerHTML = hourly
        .map((entry, index) => {
            const temp = Number(entry.temperature);
            const left = hourly.length === 1 ? 0 : (index / (hourly.length - 1)) * 100;
            const bottom = ((temp - minTemp) / range) * 68 + 10;

            return `
                <div class="chart-point" style="left:${left}%;bottom:${bottom}%;">
                    <span class="chart-temp">${Math.round(temp)}</span>
                    <span class="chart-dot"></span>
                </div>
            `;
        })
        .join("");

    const points = hourly
        .map((entry, index) => {
            const temp = Number(entry.temperature);
            const x = hourly.length === 1 ? 0 : (index / (hourly.length - 1)) * 100;
            const y = 100 - (((temp - minTemp) / range) * 68 + 10);
            return `${x},${y}`;
        })
        .join(" ");

    chart.innerHTML += `
        <svg class="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="${points}" />
        </svg>
    `;

    times.innerHTML = hourly
        .map((entry) => `<span>${formatForecastHour(entry.time)}</span>`)
        .join("");
}

function renderDailyForecast(daily = []) {
    const forecastContainer = document.getElementById("dailyForecast");

    if (!forecastContainer) {
        return;
    }

    forecastContainer.innerHTML = daily
        .map((entry, index) => {
            const glyph = getWeatherGlyph(entry.weatherCode);
            const cardClass = index === 0 ? "forecast-day active" : "forecast-day";

            return `
                <article class="${cardClass}">
                    <span class="forecast-name">${formatForecastDay(entry.time)}</span>
                    <div class="forecast-icon ${glyph}">
                        <span></span>
                    </div>
                    <div class="forecast-temps">
                        <strong>${Math.round(entry.maxTemperature)}°</strong>
                        <span>${Math.round(entry.minTemperature)}°</span>
                    </div>
                </article>
            `;
        })
        .join("");
}

function updateLiveWeatherUI(payload) {
    latestLiveWeather = payload;

    document.getElementById("liveLocation").textContent = payload.location;
    document.getElementById("liveTemp").textContent = formatMetric(payload.current.temperature, " C");
    document.getElementById("liveFeelsLike").textContent = formatMetric(payload.current.apparentTemperature, " C");
    document.getElementById("liveHumidity").textContent = formatMetric(payload.current.humidity, "%");
    document.getElementById("liveRainfall").textContent = formatMetric(payload.current.precipitation, " mm");
    document.getElementById("liveWind").textContent = formatMetric(payload.current.windSpeed, " km/h");

    const updatedTime = new Date(payload.current.time);
    document.getElementById("liveUpdated").textContent = updatedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const weatherText = weatherDescriptions[payload.current.weatherCode] || "Current conditions";
    setLiveWeatherStatus(`${weatherText} in ${payload.location}`);
    renderHourlyForecast(payload.hourly || []);
    renderDailyForecast(payload.daily || []);
}

async function loadLiveWeather(location = locationInput.value.trim() || "Dhaka") {
    showLoader();
    setLiveWeatherStatus(`Loading live weather for ${location}...`);

    try {
        let payload;

        try {
            payload = await fetchJson(
                `${getApiBase()}/api/live-weather?location=${encodeURIComponent(location)}`
            );
        } catch (apiError) {
            payload = await fetchDirectLiveWeather(location);
        }

        if (!Array.isArray(payload.hourly) || !payload.hourly.length || !Array.isArray(payload.daily) || !payload.daily.length) {
            payload = await fetchDirectLiveWeather(location);
        }

        updateLiveWeatherUI(payload);
    } catch (error) {
        setLiveWeatherStatus(error.message, true);
    } finally {
        hideLoader();
    }
}

function useLiveWeatherInForm() {
    if (!latestLiveWeather) {
        resultBox.textContent = "Load live weather first, then you can copy it into the form.";
        return;
    }

    dateInput.value = formatDateForInput(new Date(latestLiveWeather.current.time));
    locationField.value = latestLiveWeather.location ?? "";
    dayField.value = formatDayName(new Date(latestLiveWeather.current.time));
    tempInput.value = latestLiveWeather.current.temperature ?? "";
    humidityInput.value = latestLiveWeather.current.humidity ?? "";
    rainfallInput.value = latestLiveWeather.current.precipitation ?? "";
    resultBox.textContent = `Filled the form with live data from ${latestLiveWeather.location}.`;
}

function controlRain() {
    if (!rainLayer) {
        return;
    }

    const intensity = Math.random();

    if (intensity < 0.3) {
        rainLayer.style.opacity = "0.08";
    } else if (intensity < 0.6) {
        rainLayer.style.opacity = "0.16";
    } else {
        rainLayer.style.opacity = "0.28";
    }
}

function triggerLightning() {
    const flash = document.createElement("div");
    flash.className = "flash";
    flash.style.opacity = "0.8";
    document.body.appendChild(flash);

    setTimeout(() => {
        flash.style.opacity = "0.15";
    }, 60);

    setTimeout(() => {
        flash.remove();
    }, 160);
}

function autoLightning() {
    setInterval(() => {
        if (Math.random() > 0.74) {
            triggerLightning();
        }
    }, 5000);
}

if (recordForm) {
    recordForm.addEventListener("submit", (event) => {
        event.preventDefault();
        addRecord();
    });
}

if (document.getElementById("searchBtn")) {
    document.getElementById("searchBtn").addEventListener("click", searchRecord);
}

if (liveWeatherForm) {
    liveWeatherForm.addEventListener("submit", (event) => {
        event.preventDefault();
        loadLiveWeather();
    });
}

if (refreshLiveWeatherBtn) {
    refreshLiveWeatherBtn.addEventListener("click", () => loadLiveWeather());
}

if (useLiveWeatherBtn) {
    useLiveWeatherBtn.addEventListener("click", useLiveWeatherInForm);
}

document.addEventListener("mousemove", (event) => {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    document.body.style.backgroundPosition = `${50 + x * 4}% ${50 + y * 4}%`;
});

dateInput.value = formatDateForInput();
locationField.value = locationInput.value.trim();
dayField.value = formatDayName();
setInterval(controlRain, 3000);
controlRain();
autoLightning();
loadLiveWeather();
