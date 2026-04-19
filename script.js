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
const liveWeatherMapLink = document.getElementById("liveWeatherMapLink");
const liveDayState = document.getElementById("liveDayState");
const weatherNewsFrame = document.getElementById("weatherNewsFrame");
const weatherNewsLink = document.getElementById("weatherNewsLink");
const weatherNewsTitle = document.getElementById("weatherNewsTitle");
const weatherChannelSwitchBtn = document.getElementById("weatherChannelSwitchBtn");
const showRecordsBtn = document.getElementById("showRecordsBtn");
const authUserName = document.getElementById("authUserName");
const authLogoutBtn = document.getElementById("authLogoutBtn");
const successBox = document.getElementById("successBox");
const successTitle = document.getElementById("successTitle");
const successMessage = document.getElementById("successMessage");
const weatherMapElement = document.getElementById("weatherMap");
const weatherMapShell = document.getElementById("weatherMapShell");
const radarToggleBtn = document.getElementById("radarToggleBtn");
const recenterMapBtn = document.getElementById("recenterMapBtn");
const refreshRadarBtn = document.getElementById("refreshRadarBtn");
const zoomOutMapBtn = document.getElementById("zoomOutMapBtn");
const fullscreenMapBtn = document.getElementById("fullscreenMapBtn");
const labelsToggleBtn = document.getElementById("labelsToggleBtn");
const mapModeSatelliteBtn = document.getElementById("mapModeSatelliteBtn");
const mapModeStreetBtn = document.getElementById("mapModeStreetBtn");
const mapLayerStatus = document.getElementById("mapLayerStatus");
const mapCityPill = document.getElementById("mapCityPill");
const mapTimelinePill = document.getElementById("mapTimelinePill");
const mapTimelineText = document.getElementById("mapTimelineText");
const mapPlayBtn = document.getElementById("mapPlayBtn");
const mapOpenLink = document.getElementById("mapOpenLink");
const predictionLead = document.getElementById("predictionLead");
const predictionList = document.getElementById("predictionList");
const trendBars = document.getElementById("trendBars");
const trendDirection = document.getElementById("trendDirection");
const trendChange = document.getElementById("trendChange");
const trendAverage = document.getElementById("trendAverage");
const trendSummary = document.getElementById("trendSummary");
const comparisonForm = document.getElementById("comparisonForm");
const comparisonLocationInput = document.getElementById("comparisonLocationInput");
const comparisonStatus = document.getElementById("comparisonStatus");
const comparisonPrimaryName = document.getElementById("comparisonPrimaryName");
const comparisonPrimaryStats = document.getElementById("comparisonPrimaryStats");
const comparisonSecondaryName = document.getElementById("comparisonSecondaryName");
const comparisonSecondaryStats = document.getElementById("comparisonSecondaryStats");
const overviewLocation = document.getElementById("overviewLocation");
const overviewTimezone = document.getElementById("overviewTimezone");
const overviewCondition = document.getElementById("overviewCondition");
const overviewConditionMeta = document.getElementById("overviewConditionMeta");
const overviewRecordCount = document.getElementById("overviewRecordCount");
const overviewRecordMeta = document.getElementById("overviewRecordMeta");
const overviewForecastPeak = document.getElementById("overviewForecastPeak");
const overviewForecastMeta = document.getElementById("overviewForecastMeta");
const overviewMapLink = document.getElementById("overviewMapLink");
const dashboardChips = document.querySelectorAll(".dashboard-chip");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const chatChips = document.querySelectorAll(".chat-chip");
const voiceToggleBtn = document.getElementById("voiceToggleBtn");
const chatAiAvatar = document.getElementById("chatAiAvatar");

let latestLiveWeather = null;
let successTimeoutId = null;
let voiceEnabled = true;
let weatherMap = null;
let weatherMarker = null;
let radarLayer = null;
let radarVisible = true;
let latestRadarMeta = null;
let labelsVisible = true;
let activeBaseMode = "satellite";
let satelliteBaseLayer = null;
let darkBaseLayer = null;
let labelsLayer = null;
let radarFrames = [];
let radarFrameIndex = -1;
let radarAnimationId = null;
let radarPlaying = false;
let radarRefreshId = null;
let activeWeatherOverlay = "radar";
let mapZoomLevel = 6;
const reducedEffects =
    document.body.classList.contains("reduced-effects") ||
    window.weatherUiPrefs?.reducedEffects === true;
const weatherTvChannels = [
    {
        title: "WeatherNation YouTube",
        buttonLabel: "Switch YouTube Channel: WeatherNation",
        linkLabel: "Open on YouTube",
        link: "https://www.youtube.com/watch?v=3kxCeMKu-YQ",
        src: "https://www.youtube-nocookie.com/embed/3kxCeMKu-YQ?autoplay=1&mute=1&rel=0&playsinline=1"
    },
    {
        title: "FOX Weather YouTube",
        buttonLabel: "Switch YouTube Channel: FOX Weather",
        linkLabel: "Open on YouTube",
        link: "https://www.youtube.com/watch?v=T3oYDzm_ff0",
        src: "https://www.youtube-nocookie.com/embed/T3oYDzm_ff0?autoplay=1&mute=1&rel=0&playsinline=1"
    },
    {
        title: "LiveNOW Weather YouTube",
        buttonLabel: "Switch YouTube Channel: LiveNOW",
        linkLabel: "Open on YouTube",
        link: "https://www.youtube.com/watch?v=lAKL0H2P6bU",
        src: "https://www.youtube-nocookie.com/embed/lAKL0H2P6bU?autoplay=1&mute=1&rel=0&playsinline=1"
    },
    {
        title: "Storm Center YouTube",
        buttonLabel: "Switch YouTube Channel: Storm Center",
        linkLabel: "Open on YouTube",
        link: "https://www.youtube.com/watch?v=wt6SIE7BXS8",
        src: "https://www.youtube-nocookie.com/embed/wt6SIE7BXS8?autoplay=1&mute=1&rel=0&playsinline=1"
    },
    {
        title: "Weather Updates YouTube",
        buttonLabel: "Switch YouTube Channel: Weather Updates",
        linkLabel: "Open on YouTube",
        link: "https://www.youtube.com/watch?v=XWEvqy0e9-0",
        src: "https://www.youtube-nocookie.com/embed/XWEvqy0e9-0?autoplay=1&mute=1&rel=0&playsinline=1"
    },
    {
        title: "Flood Safety YouTube",
        buttonLabel: "Switch YouTube Channel: Flood Safety",
        linkLabel: "Open on YouTube",
        link: "https://www.youtube.com/watch?v=RUf3ErtEbG4",
        src: "https://www.youtube-nocookie.com/embed/RUf3ErtEbG4?autoplay=1&mute=1&rel=0&playsinline=1"
    }
];
let activeWeatherTvIndex = 0;
let weatherTvLoaded = false;
let weatherMapLoaded = false;

function observeOnceWhenVisible(target, callback) {
    if (!target || typeof callback !== "function") {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        callback();
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.disconnect();
                    callback();
                }
            });
        },
        {
            threshold: 0.18,
            rootMargin: "160px 0px"
        }
    );

    observer.observe(target);
}

function getApiBase() {
    if (window.location.protocol === "file:") {
        return "http://localhost:3000";
    }

    const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (isLocalHost && window.location.port && window.location.port !== "3000") {
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    }

    return "";
}

async function fetchJson(url, options) {
    const tryLocalFallback = async () => {
        if (!window.weatherLocalApi?.request) {
            return null;
        }

        return window.weatherLocalApi.request(url, options);
    };

    try {
        const response = await fetch(url, {
            credentials: "include",
            ...options
        });
        const contentType = response.headers.get("content-type") || "";
        const rawText = await response.text();

        if (!contentType.includes("application/json")) {
            const fallbackPayload = await tryLocalFallback();

            if (fallbackPayload !== null) {
                return fallbackPayload;
            }

            if (rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")) {
                throw new Error("Live weather API was not found. Start the Node server and open http://localhost:3000.");
            }

            throw new Error("Server returned an unexpected response.");
        }

        const payload = JSON.parse(rawText);

        if (new URL(url, window.location.href).pathname === "/api/auth/me" && window.weatherLocalApi?.request) {
            const localSession = await window.weatherLocalApi.request(url, options);

            if (localSession?.authenticated) {
                return localSession;
            }
        }

        if (!response.ok) {
            throw new Error(payload.error || "Request failed.");
        }

        return payload;
    } catch (error) {
        const fallbackPayload = await tryLocalFallback();

        if (fallbackPayload !== null) {
            return fallbackPayload;
        }

        throw error;
    }
}

function updateAuthShell(user) {
    if (authUserName) {
        authUserName.textContent = user?.name ? `Hi, ${user.name}` : "Signed in";
    }
}

async function ensureAuthenticatedPage() {
    try {
        const session = await fetchJson(`${getApiBase()}/api/auth/me`);

        if (!session.authenticated || !session.user) {
            window.location.href = "login.html";
            return false;
        }

        updateAuthShell(session.user);
        return true;
    } catch (error) {
        window.location.href = "login.html";
        return false;
    }
}

async function logoutSession() {
    try {
        await fetchJson(`${getApiBase()}/api/auth/logout`, {
            method: "POST"
        });
    } catch (error) {
        // Redirect anyway so the user is not stuck on a broken session.
    }

    window.location.href = "login.html";
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

function setMapCityLabel(location) {
    if (mapCityPill) {
        mapCityPill.textContent = `Center: ${location}`;
    }
}

function setMapLayerLabel(message) {
    if (mapLayerStatus) {
        mapLayerStatus.textContent = message;
    }
}

function updateMapOpenLink(location) {
    const targetHref = `map.html?location=${encodeURIComponent(location)}`;

    if (mapOpenLink) {
        mapOpenLink.href = targetHref;
    }

    if (liveWeatherMapLink) {
        liveWeatherMapLink.href = targetHref;
    }
}

function setMapTimelineLabel(dateText) {
    if (mapTimelinePill) {
        mapTimelinePill.textContent = dateText;
    }

    if (mapTimelineText) {
        mapTimelineText.textContent = dateText;
    }
}

function formatMapTimeline(timestamp = Date.now()) {
    const date = new Date(timestamp);
    const day = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short"
    });
    const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });

    return `${day} ${time}`;
}

function applyWeatherTvChannel(channel) {
    if (!channel || !weatherNewsFrame) {
        return;
    }

    if (weatherNewsTitle) {
        weatherNewsTitle.textContent = channel.title || "Weather TV channel";
    }

    if (weatherNewsLink) {
        weatherNewsLink.href = channel.link || "#";
        weatherNewsLink.textContent = channel.linkLabel || "Open Channel";
    }

    if (weatherChannelSwitchBtn) {
        weatherChannelSwitchBtn.textContent = channel.buttonLabel || "Switch Channel";
    }

    weatherNewsFrame.hidden = false;
    weatherNewsFrame.loading = "eager";

    if (weatherNewsFrame.src !== (channel.src || "")) {
        weatherNewsFrame.src = channel.src || "";
    }

    weatherNewsFrame.title = channel.title || "Weather TV channel";
}

function ensureWeatherTvLoaded() {
    if (weatherTvLoaded || !weatherNewsFrame) {
        return;
    }

    weatherTvLoaded = true;
    applyWeatherTvChannel(weatherTvChannels[activeWeatherTvIndex]);
}

function updateRadarPlaybackButton() {
    if (!mapPlayBtn) {
        return;
    }

    mapPlayBtn.textContent = radarPlaying ? "Pause" : "Play";
}

function updateFullscreenButton() {
    if (!fullscreenMapBtn) {
        return;
    }

    fullscreenMapBtn.textContent = document.fullscreenElement === weatherMapShell ? "Exit" : "Full";
}

function stopRadarAnimation() {
    if (radarAnimationId) {
        clearInterval(radarAnimationId);
        radarAnimationId = null;
    }

    radarPlaying = false;
    updateRadarPlaybackButton();
}

function startRadarAnimation() {
    radarPlaying = true;
    updateRadarPlaybackButton();
}

function scheduleRadarRefresh() {
    if (radarRefreshId) {
        clearInterval(radarRefreshId);
    }

    radarRefreshId = setInterval(() => {
        renderWeatherMapEmbed();
    }, 10 * 60 * 1000);
}

function updateMapModeButtons() {
    if (mapModeSatelliteBtn) {
        mapModeSatelliteBtn.classList.toggle("active", activeWeatherOverlay === "clouds");
    }

    if (radarToggleBtn) {
        radarToggleBtn.classList.toggle("active", activeWeatherOverlay === "radar");
    }

    if (labelsToggleBtn) {
        labelsToggleBtn.classList.toggle("active", activeWeatherOverlay === "wind");
    }

    if (mapModeStreetBtn) {
        mapModeStreetBtn.classList.toggle("active", activeWeatherOverlay === "temp");
    }
}

function getMapCoordinates() {
    if (latestLiveWeather && latestLiveWeather.latitude !== undefined && latestLiveWeather.longitude !== undefined) {
        return {
            lat: latestLiveWeather.latitude,
            lon: latestLiveWeather.longitude,
            label: latestLiveWeather.location
        };
    }

    return {
        lat: 23.8103,
        lon: 90.4125,
        label: "Dhaka"
    };
}

function getWeatherMapEmbedUrl() {
    const { lat, lon } = getMapCoordinates();
    const overlay = radarPlaying ? "radar" : activeWeatherOverlay;
    const params = new URLSearchParams({
        lat: lat.toFixed(4),
        lon: lon.toFixed(4),
        zoom: String(mapZoomLevel),
        level: "surface",
        overlay,
        menu: "",
        message: "",
        marker: "true",
        calendar: "now",
        pressure: "true",
        type: "map",
        location: "coordinates",
        detail: "true",
        detailLat: lat.toFixed(4),
        detailLon: lon.toFixed(4),
        metricWind: "default",
        metricTemp: "default",
        radarRange: "-1"
    });

    return `https://embed.windy.com/embed2.html?${params.toString()}`;
}

function renderWeatherMapEmbed() {
    if (!weatherMapElement) {
        return;
    }

    const frameLabel = radarPlaying ? "Live animation" : formatMapTimeline();
    setMapTimelineLabel(frameLabel);
    setMapLayerLabel("Tap to open full map");

    weatherMapElement.innerHTML = `
        <iframe
            title="Live weather map"
            src="${getWeatherMapEmbedUrl()}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
        ></iframe>
    `;

    const { label } = getMapCoordinates();
    setMapCityLabel(label);
    updateMapOpenLink(label);
    updateMapModeButtons();
}

async function ensureWeatherMap() {
    if (!weatherMapElement) {
        return;
    }

    const loadMapPreview = () => {
        if (weatherMapLoaded) {
            return;
        }

        weatherMapLoaded = true;
        renderWeatherMapEmbed();
        scheduleRadarRefresh();
    };

    observeOnceWhenVisible(weatherMapElement, loadMapPreview);
}

async function syncWeatherMapToLocation(payload) {
    if (!payload || !weatherMapElement) {
        return;
    }

    mapZoomLevel = 7;
    renderWeatherMapEmbed();
    setMapCityLabel(payload.location);
    updateMapOpenLink(payload.location);
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

function getLocationHour(timeValue) {
    const timeText = String(timeValue || "");
    const match = timeText.match(/T(\d{2}):(\d{2})/);

    if (match) {
        return {
            hour: Number(match[1]),
            minute: Number(match[2])
        };
    }

    const date = new Date(timeValue);

    if (Number.isNaN(date.getTime())) {
        return {
            hour: 12,
            minute: 0
        };
    }

    return {
        hour: date.getHours(),
        minute: date.getMinutes()
    };
}

function getDayPhaseLabel(timeValue) {
    const { hour } = getLocationHour(timeValue);
    return hour >= 6 && hour < 18 ? "Day now" : "Night now";
}

function setPredictionFallback() {
    if (predictionLead) {
        predictionLead.textContent = "Load live weather to see the next forecast window.";
    }

    if (predictionList) {
        predictionList.innerHTML = '<div class="analytics-list-item">Forecast updates will appear here.</div>';
    }
}

function setTrendFallback() {
    if (trendBars) {
        trendBars.innerHTML = `
            <div class="trend-bar-item">
                <span class="trend-bar" style="height: 24px;"></span>
                <small>--</small>
            </div>
        `;
    }

    if (trendDirection) {
        trendDirection.textContent = "--";
    }

    if (trendChange) {
        trendChange.textContent = "--";
    }

    if (trendAverage) {
        trendAverage.textContent = "--";
    }

    if (trendSummary) {
        trendSummary.textContent = "Trend insights will appear after live weather loads.";
    }
}

function setComparisonFallback() {
    if (comparisonStatus) {
        comparisonStatus.textContent = "Compare your selected city with another location.";
    }

    if (comparisonPrimaryName) {
        comparisonPrimaryName.textContent = "--";
    }

    if (comparisonPrimaryStats) {
        comparisonPrimaryStats.textContent = "--";
    }

    if (comparisonSecondaryName) {
        comparisonSecondaryName.textContent = "--";
    }

    if (comparisonSecondaryStats) {
        comparisonSecondaryStats.textContent = "--";
    }
}

function setOverviewFallback() {
    if (overviewLocation) overviewLocation.textContent = "Dhaka, Bangladesh";
    if (overviewTimezone) overviewTimezone.textContent = "Timezone will appear here.";
    if (overviewCondition) overviewCondition.textContent = "--";
    if (overviewConditionMeta) overviewConditionMeta.textContent = "Humidity, wind, and rainfall snapshot.";
    if (overviewRecordCount) overviewRecordCount.textContent = "--";
    if (overviewRecordMeta) overviewRecordMeta.textContent = "Record insights will appear here.";
    if (overviewForecastPeak) overviewForecastPeak.textContent = "--";
    if (overviewForecastMeta) overviewForecastMeta.textContent = "The strongest forecast day will appear here.";
}

async function refreshOverview(payload = latestLiveWeather) {
    if (!payload) {
        setOverviewFallback();
        return;
    }

    const conditionLabel = weatherDescriptions[payload.current.weatherCode] || "Current weather";
    const records = await getSavedRecords();
    const rainfallRecords = records
        .map((item) => ({ ...item, rainValue: Number(item.rain) }))
        .filter((item) => !Number.isNaN(item.rainValue));
    const wettestSaved = rainfallRecords.sort((a, b) => b.rainValue - a.rainValue)[0];
    const warmestForecast = payload.daily?.length
        ? [...payload.daily].sort((a, b) => Number(b.maxTemperature) - Number(a.maxTemperature))[0]
        : null;

    if (overviewLocation) {
        overviewLocation.textContent = payload.location;
    }

    if (overviewTimezone) {
        overviewTimezone.textContent = `Timezone: ${payload.timezone || "Local"}`;
    }

    if (overviewCondition) {
        overviewCondition.textContent = conditionLabel;
    }

    if (overviewConditionMeta) {
        overviewConditionMeta.textContent =
            `${Math.round(payload.current.humidity)}% humidity • ${Number(payload.current.windSpeed).toFixed(1)} km/h wind • ` +
            `${Number(payload.current.precipitation).toFixed(1)} mm rain`;
    }

    if (overviewRecordCount) {
        overviewRecordCount.textContent = `${records.length} entries`;
    }

    if (overviewRecordMeta) {
        overviewRecordMeta.textContent = wettestSaved
            ? `Wettest saved record: ${wettestSaved.date} with ${wettestSaved.rain} mm rainfall.`
            : "No saved rainfall insights yet.";
    }

    if (overviewForecastPeak) {
        overviewForecastPeak.textContent = warmestForecast
            ? `${formatForecastDay(warmestForecast.time)} • ${Math.round(warmestForecast.maxTemperature)}°C`
            : "Forecast pending";
    }

    if (overviewForecastMeta) {
        overviewForecastMeta.textContent = warmestForecast
            ? `Lowest temp on that day looks around ${Math.round(warmestForecast.minTemperature)}°C.`
            : "Load live weather to reveal peak forecast.";
    }

    if (overviewMapLink) {
        overviewMapLink.href = `map.html?location=${encodeURIComponent(payload.location)}`;
    }
}

function renderPredictionPanel(payload) {
    if (!predictionLead || !predictionList) {
        return;
    }

    if (!payload?.daily?.length) {
        setPredictionFallback();
        return;
    }

    const firstThreeDays = payload.daily.slice(0, 3);
    const warmestDay = [...payload.daily].sort((a, b) => Number(b.maxTemperature) - Number(a.maxTemperature))[0];

    predictionLead.textContent =
        `${payload.location} forecast stays active for the next ${firstThreeDays.length} days. ` +
        `${formatForecastDay(warmestDay.time)} looks warmest at ${Math.round(warmestDay.maxTemperature)}°C.`;

    predictionList.innerHTML = firstThreeDays
        .map((entry) => {
            const label = weatherDescriptions[entry.weatherCode] || "Weather";
            return `
                <div class="analytics-list-item">
                    <strong>${formatForecastDay(entry.time)}</strong>
                    <span>${label} • ${Math.round(entry.maxTemperature)}° / ${Math.round(entry.minTemperature)}°</span>
                </div>
            `;
        })
        .join("");
}

async function renderTrendPanel(payload) {
    if (!payload?.hourly?.length) {
        setTrendFallback();
        return;
    }

    const sampleHours = payload.hourly.slice(0, 6);
    const sampledTemps = sampleHours.map((entry) => Number(entry.temperature));
    const firstTemp = Number(sampledTemps[0] ?? payload.current?.temperature ?? 0);
    const lastTemp = Number(sampledTemps[sampledTemps.length - 1] ?? firstTemp);
    const delta = lastTemp - firstTemp;
    const direction = delta > 0.4 ? "Warming" : delta < -0.4 ? "Cooling" : "Stable";
    const records = await getSavedRecords();
    const matchingRecords = records.filter((item) => (item.location || "").trim() === payload.location.trim());
    const recordTemps = matchingRecords
        .map((item) => Number(item.temp))
        .filter((value) => !Number.isNaN(value));
    const averageTemp = recordTemps.length
        ? `${(recordTemps.reduce((sum, value) => sum + value, 0) / recordTemps.length).toFixed(1)}°C`
        : "No saved avg";
    const minTemp = Math.min(...sampledTemps);
    const maxTemp = Math.max(...sampledTemps);
    const range = Math.max(maxTemp - minTemp, 1);

    if (trendBars) {
        trendBars.innerHTML = sampleHours
            .map((entry) => {
                const value = Number(entry.temperature);
                const height = 26 + (((value - minTemp) / range) * 62);
                return `
                    <div class="trend-bar-item">
                        <span class="trend-bar" style="height:${height.toFixed(0)}px;"></span>
                        <small>${formatForecastHour(entry.time)}</small>
                    </div>
                `;
            })
            .join("");
    }

    trendDirection.textContent = direction;
    trendChange.textContent = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}°C`;
    trendAverage.textContent = averageTemp;
    trendSummary.textContent =
        `${payload.location} looks ${direction.toLowerCase()} across the next ${sampleHours.length} hourly checkpoints. ` +
        `Current humidity is ${Math.round(payload.current.humidity)}% and rainfall is ${Number(payload.current.precipitation).toFixed(1)} mm.`;
}

function fillComparisonCard(primaryPayload, secondaryPayload) {
    if (!comparisonPrimaryName || !comparisonSecondaryName) {
        return;
    }

    comparisonPrimaryName.textContent = primaryPayload.location;
    comparisonPrimaryStats.textContent =
        `${Number(primaryPayload.current.temperature).toFixed(1)}°C • ${Math.round(primaryPayload.current.humidity)}% humidity • ` +
        `${Number(primaryPayload.current.windSpeed).toFixed(1)} km/h wind`;

    comparisonSecondaryName.textContent = secondaryPayload.location;
    comparisonSecondaryStats.textContent =
        `${Number(secondaryPayload.current.temperature).toFixed(1)}°C • ${Math.round(secondaryPayload.current.humidity)}% humidity • ` +
        `${Number(secondaryPayload.current.windSpeed).toFixed(1)} km/h wind`;

    const tempDiff = Number(secondaryPayload.current.temperature) - Number(primaryPayload.current.temperature);
    const rainDiff = Number(secondaryPayload.current.precipitation) - Number(primaryPayload.current.precipitation);

    comparisonStatus.textContent =
        `${secondaryPayload.location} is ${tempDiff >= 0 ? Math.abs(tempDiff).toFixed(1) + "°C warmer" : Math.abs(tempDiff).toFixed(1) + "°C cooler"} ` +
        `than ${primaryPayload.location}, with ${rainDiff >= 0 ? "higher" : "lower"} rainfall right now.`;
}

async function compareLocations(secondaryLocation) {
    if (!latestLiveWeather) {
        setComparisonFallback();
        if (comparisonStatus) {
            comparisonStatus.textContent = "Load live weather first, then compare another city.";
        }
        return;
    }

    const compareWith = (secondaryLocation || "").trim();

    if (!compareWith) {
        setComparisonFallback();
        return;
    }

    if (comparisonStatus) {
        comparisonStatus.textContent = `Comparing ${latestLiveWeather.location} with ${compareWith}...`;
    }

    try {
        const secondaryPayload = await fetchDirectLiveWeather(compareWith);
        fillComparisonCard(latestLiveWeather, secondaryPayload);
    } catch (error) {
        if (comparisonStatus) {
            comparisonStatus.textContent = error.message || "Unable to compare that location right now.";
        }
    }
}

async function refreshAnalytics(payload = latestLiveWeather) {
    await refreshOverview(payload);
    renderPredictionPanel(payload);
    await renderTrendPanel(payload);

    if (payload && comparisonLocationInput?.value.trim()) {
        await compareLocations(comparisonLocationInput.value.trim());
    } else {
        setComparisonFallback();
    }
}

function addChatMessage(role, message) {
    if (!chatMessages) {
        return null;
    }

    const bubble = document.createElement("article");
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = `
        <span class="chat-role">${role === "user" ? "You" : "Weather AI"}</span>
        <p>${message}</p>
    `;

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return bubble;
}

function setAiSpeakingState(isSpeaking) {
    if (!chatAiAvatar) {
        return;
    }

    chatAiAvatar.classList.toggle("speaking", isSpeaking);
}

function speakWeatherAi(text) {
    if (!voiceEnabled || !("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.05;
    utterance.onstart = () => setAiSpeakingState(true);
    utterance.onend = () => setAiSpeakingState(false);
    utterance.onerror = () => setAiSpeakingState(false);
    window.speechSynthesis.speak(utterance);
}

function showTypingBubble() {
    if (!chatMessages) {
        return null;
    }

    const bubble = document.createElement("article");
    bubble.className = "chat-bubble ai typing";
    bubble.innerHTML = `
        <span class="chat-role">Weather AI</span>
        <div class="typing-dots" aria-label="Weather AI is typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    setAiSpeakingState(true);
    return bubble;
}

async function revealAiMessage(message) {
    const typingBubble = showTypingBubble();
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (typingBubble) {
        typingBubble.remove();
    }

    const bubble = addChatMessage("ai", "");
    if (!bubble) {
        setAiSpeakingState(false);
        return;
    }

    const textNode = bubble.querySelector("p");
    const words = message.split(" ");
    let built = "";

    for (const word of words) {
        built = built ? `${built} ${word}` : word;
        textNode.textContent = built;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        await new Promise((resolve) => setTimeout(resolve, 34));
    }

    setAiSpeakingState(false);
    speakWeatherAi(message);
}

async function getSavedRecords() {
    try {
        return await fetchJson(`${getApiBase()}/records`);
    } catch (error) {
        return [];
    }
}

function buildForecastSummaryText() {
    if (!latestLiveWeather?.daily?.length) {
        return "I could not find forecast details yet. Try refreshing live weather first.";
    }

    const nextDays = latestLiveWeather.daily.slice(0, 3).map((entry) => {
        const day = formatForecastDay(entry.time);
        return `${day}: ${Math.round(entry.maxTemperature)}° / ${Math.round(entry.minTemperature)}°`;
    });

    return `Upcoming forecast for ${latestLiveWeather.location}: ${nextDays.join(" | ")}.`;
}

function buildAdviceText() {
    if (!latestLiveWeather) {
        return "Load live weather first, then I can give you umbrella and comfort advice.";
    }

    const { precipitation, humidity, temperature, windSpeed } = latestLiveWeather.current;

    if (precipitation > 0.2 || humidity > 88) {
        return `For ${latestLiveWeather.location}, carrying an umbrella is a good idea. Humidity is ${humidity}% and rainfall is ${precipitation} mm right now.`;
    }

    if (temperature >= 32) {
        return `It looks hot in ${latestLiveWeather.location}. Stay hydrated and avoid long direct sun exposure if possible.`;
    }

    if (windSpeed >= 20) {
        return `It is a bit windy in ${latestLiveWeather.location} with wind around ${windSpeed} km/h, so keep light layers handy.`;
    }

    return `Weather looks fairly comfortable in ${latestLiveWeather.location}. You probably do not need an umbrella right now.`;
}

async function buildRecordsSummary() {
    const records = await getSavedRecords();

    if (!records.length) {
        return "There are no saved weather records yet.";
    }

    const temps = records.map((item) => Number(item.temp)).filter((value) => !Number.isNaN(value));
    const rains = records.map((item) => Number(item.rain)).filter((value) => !Number.isNaN(value));
    const averageTemp = temps.length
        ? (temps.reduce((sum, value) => sum + value, 0) / temps.length).toFixed(1)
        : "--";
    const wettest = records.reduce((best, item) => {
        if (!best) return item;
        return Number(item.rain || 0) > Number(best.rain || 0) ? item : best;
    }, null);

    return `You have ${records.length} saved records. Average temperature is ${averageTemp} C. The wettest record is ${wettest?.date || "unknown"} in ${wettest?.location || "unknown location"} with ${wettest?.rain || 0} mm rainfall.`;
}

async function getWeatherAiReply(prompt) {
    const question = prompt.trim().toLowerCase();

    if (!question) {
        return "Ask me something about current weather, forecast, rainfall, or saved records.";
    }

    if (question.includes("record") || question.includes("history") || question.includes("archive")) {
        return buildRecordsSummary();
    }

    if (question.includes("forecast") || question.includes("tomorrow") || question.includes("next")) {
        return buildForecastSummaryText();
    }

    if (question.includes("umbrella") || question.includes("advice") || question.includes("wear") || question.includes("carry")) {
        return buildAdviceText();
    }

    if (
        question.includes("weather") ||
        question.includes("temperature") ||
        question.includes("humidity") ||
        question.includes("rain") ||
        question.includes("wind")
    ) {
        if (!latestLiveWeather) {
            return "Live weather is not loaded yet. Press Get Live Weather first.";
        }

        const current = latestLiveWeather.current;
        return `Right now in ${latestLiveWeather.location}, temperature is ${current.temperature} C, feels like ${current.apparentTemperature} C, humidity is ${current.humidity}%, rainfall is ${current.precipitation} mm, and wind speed is ${current.windSpeed} km/h.`;
    }

    return "I can help with current weather, forecast trends, umbrella advice, and record summaries. Try asking about weather now, forecast, or saved records.";
}

async function handleChatPrompt(prompt) {
    addChatMessage("user", prompt);
    const reply = await getWeatherAiReply(prompt);
    await revealAiMessage(reply);
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
        refreshAnalytics();
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

function getForecastIconType(weatherCode) {
    if ([0, 1].includes(weatherCode)) return "sun";
    if ([2, 3].includes(weatherCode)) return "cloud";
    if ([45, 48].includes(weatherCode)) return "moon";
    if ([61, 63, 65, 80, 81, 82, 51, 53, 55].includes(weatherCode)) return "rain";
    if ([95, 96, 99].includes(weatherCode)) return "storm";
    return "cloud";
}

function getForecastIconMarkup(weatherCode) {
    const type = getForecastIconType(weatherCode);

    if (type === "sun") {
        return `
            <div class="forecast-icon sun" aria-hidden="true">
                <svg viewBox="0 0 64 64" role="presentation" class="forecast-icon-svg">
                    <defs>
                        <radialGradient id="forecastSunCore" cx="35%" cy="35%">
                            <stop offset="0%" stop-color="#fff6ad"></stop>
                            <stop offset="54%" stop-color="#ffd24f"></stop>
                            <stop offset="100%" stop-color="#ff9d20"></stop>
                        </radialGradient>
                    </defs>
                    <g class="sun-rays" stroke="#ffd056" stroke-width="3.2" stroke-linecap="round">
                        <line x1="32" y1="6" x2="32" y2="14"></line>
                        <line x1="32" y1="50" x2="32" y2="58"></line>
                        <line x1="6" y1="32" x2="14" y2="32"></line>
                        <line x1="50" y1="32" x2="58" y2="32"></line>
                        <line x1="14" y1="14" x2="20" y2="20"></line>
                        <line x1="44" y1="44" x2="50" y2="50"></line>
                        <line x1="44" y1="20" x2="50" y2="14"></line>
                        <line x1="14" y1="50" x2="20" y2="44"></line>
                    </g>
                    <circle cx="32" cy="32" r="15" fill="url(#forecastSunCore)"></circle>
                </svg>
            </div>
        `;
    }

    if (type === "cloud") {
        return `
            <div class="forecast-icon cloud" aria-hidden="true">
                <img src="images/cloud.png" alt="Cloud icon" class="forecast-icon-image">
            </div>
        `;
    }

    if (type === "rain") {
        return `
            <div class="forecast-icon rain" aria-hidden="true">
                <img
                    src="images/rain-showers.png?v=1"
                    alt="Rain cloud icon"
                    width="58"
                    height="58"
                    class="forecast-icon-image"
                >
            </div>
        `;
    }

    if (type === "storm") {
        return `
            <div class="forecast-icon storm" aria-hidden="true">
                <img src="images/cloud.png" alt="Storm cloud icon" class="forecast-icon-image">
                <span class="forecast-bolt"></span>
            </div>
        `;
    }

    return `
        <div class="forecast-icon moon" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="presentation" class="forecast-icon-svg">
                <defs>
                    <linearGradient id="forecastMoonFill" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fff8bf"></stop>
                        <stop offset="100%" stop-color="#f2dc49"></stop>
                    </linearGradient>
                </defs>
                <circle cx="29" cy="31" r="19" fill="url(#forecastMoonFill)"></circle>
                <circle cx="39" cy="24" r="18" fill="#18304b"></circle>
                <circle cx="18" cy="16" r="2.4" fill="#bfe8ff"></circle>
                <circle cx="47" cy="18" r="1.8" fill="#9dd7ff"></circle>
            </svg>
        </div>
    `;
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

function getCompactForecastLabel(weatherCode) {
    if ([95, 96, 99].includes(weatherCode)) return "Thunderstorm";
    if ([80, 81, 82].includes(weatherCode)) return "Rain showers";
    if ([61, 63, 65].includes(weatherCode)) return "Rain";
    if ([51, 53, 55].includes(weatherCode)) return "Drizzle";
    if ([71, 73, 75, 77].includes(weatherCode)) return "Snow";
    if ([45, 48].includes(weatherCode)) return "Fog";
    if ([2].includes(weatherCode)) return "Partly cloudy";
    if ([3].includes(weatherCode)) return "Overcast";
    return weatherDescriptions[weatherCode] || "Weather";
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
            const cardClass = index === 0 ? "forecast-day active" : "forecast-day";
            const weatherLabel = getCompactForecastLabel(entry.weatherCode);

            return `
                <article class="${cardClass}">
                    <span class="forecast-day-glow" aria-hidden="true"></span>
                    <span class="forecast-name">${formatForecastDay(entry.time)}</span>
                    ${getForecastIconMarkup(entry.weatherCode)}
                    <span class="forecast-label">${weatherLabel}</span>
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
    if (liveDayState) {
        const phase = getDayPhaseLabel(payload.current.time);
        const phaseText = liveDayState.querySelector(".live-phase-text");
        const phaseIcon = liveDayState.querySelector(".live-phase-icon");
        const isNight = phase === "Night now";

        if (phaseText) {
            phaseText.textContent = phase;
        } else {
            liveDayState.textContent = phase;
        }

        if (phaseIcon) {
            phaseIcon.textContent = isNight ? "☾" : "☀";
        }

        liveDayState.classList.toggle("night", isNight);
    }
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
    syncWeatherMapToLocation(payload);
    refreshAnalytics(payload);
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
    return;
}

function triggerLightning() {
    return;
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
    return;
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

if (showRecordsBtn) {
    showRecordsBtn.addEventListener("click", () => {
        window.location.href = "records.html";
    });
}

if (radarToggleBtn) {
    radarToggleBtn.addEventListener("click", async () => {
        stopRadarAnimation();
        activeWeatherOverlay = "radar";
        radarVisible = true;
        renderWeatherMapEmbed();
    });
}

if (recenterMapBtn) {
    recenterMapBtn.addEventListener("click", async () => {
        mapZoomLevel = 6;
        renderWeatherMapEmbed();
    });
}

if (refreshRadarBtn) {
    refreshRadarBtn.addEventListener("click", async () => {
        stopRadarAnimation();
        renderWeatherMapEmbed();
    });
}

if (zoomOutMapBtn) {
    zoomOutMapBtn.addEventListener("click", async () => {
        mapZoomLevel = Math.max(3, mapZoomLevel - 1);
        renderWeatherMapEmbed();
    });
}

if (labelsToggleBtn) {
    labelsToggleBtn.addEventListener("click", async () => {
        stopRadarAnimation();
        activeWeatherOverlay = "wind";
        renderWeatherMapEmbed();
    });
}

if (mapModeSatelliteBtn) {
    mapModeSatelliteBtn.addEventListener("click", async () => {
        stopRadarAnimation();
        activeWeatherOverlay = "clouds";
        renderWeatherMapEmbed();
    });
}

if (mapModeStreetBtn) {
    mapModeStreetBtn.addEventListener("click", async () => {
        stopRadarAnimation();
        activeWeatherOverlay = "temp";
        renderWeatherMapEmbed();
    });
}

if (mapPlayBtn) {
    mapPlayBtn.addEventListener("click", async () => {
        if (radarPlaying) {
            stopRadarAnimation();
            renderWeatherMapEmbed();
            return;
        }

        activeWeatherOverlay = "radar";
        startRadarAnimation();
        renderWeatherMapEmbed();
    });
}

if (comparisonForm) {
    comparisonForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await compareLocations(comparisonLocationInput.value.trim());
    });
}

dashboardChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        const location = chip.dataset.quickLocation || "";

        if (!location) {
            return;
        }

        locationInput.value = location;
        loadLiveWeather(location);
    });
});

if (weatherChannelSwitchBtn) {
    weatherChannelSwitchBtn.addEventListener("click", () => {
        ensureWeatherTvLoaded();
        activeWeatherTvIndex = (activeWeatherTvIndex + 1) % weatherTvChannels.length;
        applyWeatherTvChannel(weatherTvChannels[activeWeatherTvIndex]);
    });
}

if (weatherNewsFrame) {
    ensureWeatherTvLoaded();
}

if (fullscreenMapBtn && weatherMapShell) {
    fullscreenMapBtn.addEventListener("click", async () => {
        try {
            if (document.fullscreenElement === weatherMapShell) {
                await document.exitFullscreen();
            } else {
                await weatherMapShell.requestFullscreen();
            }
        } catch (error) {
            setLiveWeatherStatus("Fullscreen mode is not available in this browser.", true);
        } finally {
            updateFullscreenButton();
        }
    });
}

document.addEventListener("fullscreenchange", updateFullscreenButton);

if (chatForm) {
    chatForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const prompt = chatInput.value.trim();

        if (!prompt) {
            return;
        }

        chatInput.value = "";
        await handleChatPrompt(prompt);
    });
}

chatChips.forEach((chip) => {
    chip.addEventListener("click", async () => {
        await handleChatPrompt(chip.dataset.chatPrompt || chip.textContent || "");
    });
});

if (voiceToggleBtn) {
    voiceToggleBtn.addEventListener("click", () => {
        voiceEnabled = !voiceEnabled;
        voiceToggleBtn.textContent = voiceEnabled ? "Voice On" : "Voice Off";

        if (!voiceEnabled && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            setAiSpeakingState(false);
        }
    });
}

if (authLogoutBtn) {
    authLogoutBtn.addEventListener("click", logoutSession);
}

if (!reducedEffects) {
    let backgroundMotionFrame = null;

    document.addEventListener("mousemove", (event) => {
        if (backgroundMotionFrame) {
            return;
        }

        backgroundMotionFrame = window.requestAnimationFrame(() => {
            const x = event.clientX / window.innerWidth;
            const y = event.clientY / window.innerHeight;
            document.body.style.backgroundPosition = `${50 + x * 4}% ${50 + y * 4}%`;
            backgroundMotionFrame = null;
        });
    });
}

async function initializeDashboard() {
    const isAuthenticated = await ensureAuthenticatedPage();

    if (!isAuthenticated) {
        return;
    }

    dateInput.value = formatDateForInput();
    locationField.value = locationInput.value.trim();
    dayField.value = formatDayName();
    ensureWeatherMap();
    updateFullscreenButton();
    setPredictionFallback();
    setTrendFallback();
    setComparisonFallback();
    setOverviewFallback();
    loadLiveWeather();
}

initializeDashboard();

