
const weatherMapElement = document.getElementById("weatherMap");
const weatherMapShell = document.getElementById("weatherMapShell");
const weatherFocusBtn = document.getElementById("weatherFocusBtn");
const tempOverlayBtn = document.getElementById("tempOverlayBtn");
const windOverlayBtn = document.getElementById("windOverlayBtn");
const humidityOverlayBtn = document.getElementById("humidityOverlayBtn");
const rainOverlayBtn = document.getElementById("rainOverlayBtn");
const radarToggleBtn = document.getElementById("radarToggleBtn");
const recordsToggleBtn = document.getElementById("recordsToggleBtn");
const recenterMapBtn = document.getElementById("recenterMapBtn");
const refreshRadarBtn = document.getElementById("refreshRadarBtn");
const zoomOutMapBtn = document.getElementById("zoomOutMapBtn");
const zoomInMapBtn = document.getElementById("zoomInMapBtn");
const fullscreenMapBtn = document.getElementById("fullscreenMapBtn");
const locateMeBtn = document.getElementById("locateMeBtn");
const labelsToggleBtn = document.getElementById("labelsToggleBtn");
const mapModeSatelliteBtn = document.getElementById("mapModeSatelliteBtn");
const mapModeStreetBtn = document.getElementById("mapModeStreetBtn");
const mapLayerStatus = document.getElementById("mapLayerStatus");
const mapCityPill = document.getElementById("mapCityPill");
const mapTimelinePill = document.getElementById("mapTimelinePill");
const mapTimelineText = document.getElementById("mapTimelineText");
const mapPlayBtn = document.getElementById("mapPlayBtn");
const mapSearchForm = document.getElementById("mapSearchForm");
const mapLocationInput = document.getElementById("mapLocationInput");
const mapChips = document.querySelectorAll(".map-chip");
const mapStatusText = document.getElementById("mapStatusText");
const mapSnapshotTemp = document.getElementById("mapSnapshotTemp");
const mapSnapshotWind = document.getElementById("mapSnapshotWind");
const mapSnapshotCondition = document.getElementById("mapSnapshotCondition");
const mapSnapshotUpdated = document.getElementById("mapSnapshotUpdated");
const mapSnapshotLocation = document.getElementById("mapSnapshotLocation");
const mapFooterOverlay = document.getElementById("mapFooterOverlay");
const mapFooterBase = document.getElementById("mapFooterBase");
const mapFooterZoom = document.getElementById("mapFooterZoom");
const mapFooterFocus = document.getElementById("mapFooterFocus");
const mapFooterCoords = document.getElementById("mapFooterCoords");
const windyMapFrame = document.getElementById("windyMapFrame");
const windyOpenLink = document.getElementById("windyOpenLink");
const windyStatus = document.getElementById("windyStatus");
const windyWindBtn = document.getElementById("windyWindBtn");
const windyRainBtn = document.getElementById("windyRainBtn");
const windyTempBtn = document.getElementById("windyTempBtn");
const windyPressureBtn = document.getElementById("windyPressureBtn");
const isWindyOnlyMode = !weatherMapElement && !!windyMapFrame;

const bangladeshBounds = [
    [20.55, 88.0],
    [26.75, 92.75]
];

const majorCities = [
    { name: "Dhaka", label: "Dhaka" },
    { name: "Chattogram", label: "Chattogram" },
    { name: "Sylhet", label: "Sylhet" },
    { name: "Rajshahi", label: "Rajshahi" },
    { name: "Khulna", label: "Khulna" },
    { name: "Barishal", label: "Barishal" }
];

const knownLocations = {
    dhaka: {
        label: "Dhaka, Dhaka Division, Bangladesh",
        lat: 23.8103,
        lon: 90.4125
    },
    chattogram: {
        label: "Chattogram, Chattogram Division, Bangladesh",
        lat: 22.3569,
        lon: 91.7832
    },
    chittagong: {
        label: "Chattogram, Chattogram Division, Bangladesh",
        lat: 22.3569,
        lon: 91.7832
    },
    sylhet: {
        label: "Sylhet, Sylhet Division, Bangladesh",
        lat: 24.8949,
        lon: 91.8687
    },
    rajshahi: {
        label: "Rajshahi, Rajshahi Division, Bangladesh",
        lat: 24.3745,
        lon: 88.6042
    },
    khulna: {
        label: "Khulna, Khulna Division, Bangladesh",
        lat: 22.8456,
        lon: 89.5403
    },
    barishal: {
        label: "Barishal, Barishal Division, Bangladesh",
        lat: 22.701,
        lon: 90.3535
    }
};

const weatherDescriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Severe thunderstorm"
};

let mapInstance = null;
let activePayload = null;
let activeLocation = {
    label: "Dhaka, Bangladesh",
    lat: 23.8103,
    lon: 90.4125
};
let activeQuery = "Dhaka";
let mapZoomLevel = 7;
let activeBaseMode = "satellite";
let activeOverlayMode = "weather";
let currentBaseLayer = null;
let labelsLayer = null;
let focusMarker = null;
let focusCircle = null;
let majorCityLayer = null;
let savedRecordsLayer = null;
let radarLayer = null;
let radarFrames = [];
let radarHost = "https://tilecache.rainviewer.com";
let currentRadarFrameIndex = 0;
let radarPlaying = false;
let radarAnimationTimer = null;
let refreshTimer = null;
let recordsLoaded = false;
let activeWindyLayer = "wind";
const bundleCache = new Map();

function getQueryLocation() {
    const params = new URLSearchParams(window.location.search);
    return params.get("location") || "Dhaka";
}

function getApiBase() {
    const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (!window.location.hostname) {
        return "http://localhost:3000";
    }

    if (isLocalHost && window.location.port && window.location.port !== "3000") {
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    }

    return "";
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const rawText = await response.text();
    const payload = rawText ? JSON.parse(rawText) : {};

    if (!response.ok) {
        throw new Error(payload.error || "Request failed.");
    }

    return payload;
}

async function geocodeLocation(location) {
    const knownPlace = knownLocations[String(location || "").trim().toLowerCase()];

    if (knownPlace) {
        return knownPlace;
    }

    const geocodeUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const geocodeData = await fetchJson(geocodeUrl);

    if (!geocodeData.results || !geocodeData.results.length) {
        throw new Error("Location not found.");
    }

    const place = geocodeData.results[0];
    return {
        label: [place.name, place.admin1, place.country].filter(Boolean).join(", "),
        lat: Number(place.latitude),
        lon: Number(place.longitude)
    };
}

function buildFallbackPayload(place) {
    return normalizePayload({
        location: place.label,
        latitude: place.lat,
        longitude: place.lon,
        timezone: "Asia/Dhaka",
        current: {
            time: new Date().toISOString(),
            temperature: 28,
            humidity: 72,
            precipitation: 0,
            windSpeed: 12,
            apparentTemperature: 31,
            weatherCode: 2
        },
        hourly: [],
        daily: []
    });
}

function normalizePayload(payload) {
    return {
        location: payload.location,
        latitude: Number(payload.latitude),
        longitude: Number(payload.longitude),
        timezone: payload.timezone || "Local",
        current: {
            time: payload.current.time,
            temperature: Number(payload.current.temperature),
            humidity: Number(payload.current.humidity),
            precipitation: Number(payload.current.precipitation),
            windSpeed: Number(payload.current.windSpeed),
            apparentTemperature: Number(payload.current.apparentTemperature ?? payload.current.temperature),
            weatherCode: Number(payload.current.weatherCode)
        },
        hourly: Array.isArray(payload.hourly) ? payload.hourly : [],
        daily: Array.isArray(payload.daily) ? payload.daily : []
    };
}

async function fetchBundleByCoords(lat, lon, label) {
    const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature" +
        "&hourly=temperature_2m" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
        "&timezone=auto";
    const forecastData = await fetchJson(forecastUrl);

    return normalizePayload({
        location: label,
        latitude: lat,
        longitude: lon,
        timezone: forecastData.timezone,
        current: {
            time: forecastData.current.time,
            temperature: forecastData.current.temperature_2m,
            humidity: forecastData.current.relative_humidity_2m,
            precipitation: forecastData.current.precipitation,
            windSpeed: forecastData.current.wind_speed_10m,
            apparentTemperature: forecastData.current.apparent_temperature,
            weatherCode: forecastData.current.weather_code
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
    });
}

async function fetchLocationBundle(location, force = false) {
    const trimmedLocation = (location || "").trim() || "Dhaka";
    const cacheKey = trimmedLocation.toLowerCase();

    if (!force && bundleCache.has(cacheKey)) {
        return bundleCache.get(cacheKey);
    }

    try {
        const payload = normalizePayload(
            await fetchJson(`${getApiBase()}/api/live-weather?location=${encodeURIComponent(trimmedLocation)}`)
        );
        bundleCache.set(cacheKey, payload);
        return payload;
    } catch (apiError) {
        const place = await geocodeLocation(trimmedLocation);
        let payload;

        try {
            payload = await fetchBundleByCoords(place.lat, place.lon, place.label);
        } catch (forecastError) {
            payload = buildFallbackPayload(place);
        }

        bundleCache.set(cacheKey, payload);
        return payload;
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

function getWeatherColor(current) {
    const code = Number(current.weatherCode);
    const temp = Number(current.temperature);

    if ([95, 96, 99].includes(code)) return "#7f8cff";
    if ([61, 63, 65, 80, 81, 82].includes(code)) return "#4ab7ff";
    if (code === 3) return "#8ea2bb";
    if (temp >= 33) return "#ffb84f";
    if (temp <= 18) return "#6ee0ff";
    return "#8adf8b";
}

function getBaseModeLabel(mode = activeBaseMode) {
    if (mode === "street") return "Street";
    if (mode === "terrain") return "Terrain";
    return "Satellite";
}

function getOverlayLabel(mode = activeOverlayMode) {
    if (mode === "temp") return "Temperature";
    if (mode === "wind") return "Wind";
    if (mode === "humidity") return "Humidity";
    if (mode === "rain") return "Rainfall";
    if (mode === "radar") return radarPlaying ? "Radar Playback" : "Radar";
    if (mode === "records") return "Saved Records";
    return "Weather Focus";
}

function getOverlayMetric(payload, mode = activeOverlayMode) {
    if (!payload?.current) {
        return {
            markerValue: "--",
            circleRadius: 18000,
            color: "#64d3ff"
        };
    }

    const current = payload.current;

    if (mode === "temp") {
        return {
            markerValue: `${Math.round(current.temperature)}C`,
            circleRadius: 18000 + Math.max(0, Number(current.temperature)) * 350,
            color: Number(current.temperature) >= 30 ? "#ffb84f" : "#6ee0ff"
        };
    }

    if (mode === "wind") {
        return {
            markerValue: `${Math.round(current.windSpeed)} km/h`,
            circleRadius: 18000 + Math.max(0, Number(current.windSpeed)) * 1000,
            color: "#77d8ff"
        };
    }

    if (mode === "humidity") {
        return {
            markerValue: `${Math.round(current.humidity)}%`,
            circleRadius: 18000 + Math.max(0, Number(current.humidity)) * 220,
            color: "#8adf8b"
        };
    }

    if (mode === "rain") {
        return {
            markerValue: `${Number(current.precipitation).toFixed(1)} mm`,
            circleRadius: 18000 + Math.max(0, Number(current.precipitation)) * 6500,
            color: "#4ab7ff"
        };
    }

    return {
        markerValue: `${Math.round(current.temperature)}C`,
        circleRadius: 16000 + Number(current.precipitation) * 4500 + Number(current.windSpeed) * 220,
        color: getWeatherColor(current)
    };
}

function shortLocationLabel(label) {
    return String(label || "Location").split(",")[0].trim();
}

function getWindyLayerLabel(mode = activeWindyLayer) {
    if (mode === "rain") return "Rain and thunder";
    if (mode === "temp") return "Temperature";
    if (mode === "pressure") return "Pressure";
    return "Wind";
}

function buildWindyEmbedUrl(lat, lon, overlay = activeWindyLayer) {
    const params = new URLSearchParams({
        lat: String(Number(lat).toFixed(4)),
        lon: String(Number(lon).toFixed(4)),
        zoom: String(mapInstance ? Math.max(5, Math.min(11, Math.round(mapInstance.getZoom()))) : mapZoomLevel),
        level: "surface",
        overlay,
        product: "ecmwf",
        menu: "",
        message: "true",
        marker: "true",
        calendar: "now",
        pressure: "true",
        type: "map",
        location: "coordinates",
        detail: "true",
        detailLat: String(Number(lat).toFixed(4)),
        detailLon: String(Number(lon).toFixed(4)),
        metricWind: "km/h",
        metricTemp: "°C",
        metricRain: "mm",
        radarRange: "-1"
    });

    return `https://embed.windy.com/embed2.html?${params.toString()}`;
}

function updateWindyButtons() {
    windyWindBtn?.classList.toggle("active", activeWindyLayer === "wind");
    windyRainBtn?.classList.toggle("active", activeWindyLayer === "rain");
    windyTempBtn?.classList.toggle("active", activeWindyLayer === "temp");
    windyPressureBtn?.classList.toggle("active", activeWindyLayer === "pressure");
}

function syncWindyMap(forceReload = false) {
    if (!windyMapFrame) {
        return;
    }

    const lat = activePayload?.latitude ?? activeLocation.lat;
    const lon = activePayload?.longitude ?? activeLocation.lon;
    const focusLabel = activePayload?.location || activeLocation.label;
    const windyUrl = buildWindyEmbedUrl(lat, lon, activeWindyLayer);

    if (forceReload || windyMapFrame.src !== windyUrl) {
        windyMapFrame.src = windyUrl;
    }

    if (windyOpenLink) {
        windyOpenLink.href = windyUrl;
    }

    if (windyStatus) {
        windyStatus.textContent = `${getWindyLayerLabel()} layer synced to ${focusLabel}.`;
    }

    setMapLayerLabel(`Windy ${getWindyLayerLabel().toLowerCase()} layer`);
    setMapCityLabel(focusLabel);

    if (activePayload?.current?.time) {
        setMapTimelineLabel(formatMapTimeline(activePayload.current.time));
    }

    updateWindyButtons();
}

function buildFocusPopup(payload) {
    const condition = weatherDescriptions[payload.current.weatherCode] || "Live weather";
    const peakDay = payload.daily?.length
        ? [...payload.daily].sort((a, b) => Number(b.maxTemperature) - Number(a.maxTemperature))[0]
        : null;

    return `
        <div class="map-popup-card">
            <strong>${payload.location}</strong>
            <p>${condition} now. Temp ${Number(payload.current.temperature).toFixed(1)} C, humidity ${Math.round(payload.current.humidity)}%, rain ${Number(payload.current.precipitation).toFixed(1)} mm, wind ${Number(payload.current.windSpeed).toFixed(1)} km/h.</p>
            <p>${peakDay ? `${peakDay.time} peaks near ${Math.round(peakDay.maxTemperature)} C.` : "Forecast updates will appear here."}</p>
        </div>
    `;
}

function createTemperatureIcon(label, value, modifier) {
    return L.divIcon({
        className: "map-marker-shell",
        html: `
            <div class="map-temp-marker map-temp-marker--${modifier}">
                <strong>${value}</strong>
                <span>${label}</span>
            </div>
        `,
        iconSize: modifier === "focus" ? [96, 62] : [82, 56],
        iconAnchor: modifier === "focus" ? [48, 31] : [41, 28],
        popupAnchor: [0, -22]
    });
}

function createRecordIcon(count) {
    return L.divIcon({
        className: "map-marker-shell",
        html: `
            <div class="map-record-marker">
                <strong>${count}</strong>
                <span>Saved</span>
            </div>
        `,
        iconSize: [74, 54],
        iconAnchor: [37, 27],
        popupAnchor: [0, -18]
    });
}

function ensureMap() {
    if (mapInstance || !weatherMapElement || !window.L) {
        return;
    }

    mapInstance = L.map(weatherMapElement, {
        zoomControl: false,
        minZoom: 4,
        maxZoom: 18,
        worldCopyJump: true,
        zoomSnap: 0.5
    });

    mapInstance.createPane("radarPane");
    mapInstance.getPane("radarPane").style.zIndex = "360";
    mapInstance.createPane("recordPane");
    mapInstance.getPane("recordPane").style.zIndex = "430";

    labelsLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 20,
        opacity: 0.85,
        attribution: "&copy; CARTO"
    });

    majorCityLayer = L.layerGroup().addTo(mapInstance);
    savedRecordsLayer = L.layerGroup();

    mapInstance.fitBounds(bangladeshBounds, { padding: [24, 24] });

    mapInstance.on("zoomend moveend", () => {
        mapZoomLevel = mapInstance.getZoom();
        updateMapFooter();
    });

    setBaseLayer(activeBaseMode);
}

function setBaseLayer(mode) {
    if (!mapInstance) {
        return;
    }

    if (currentBaseLayer) {
        mapInstance.removeLayer(currentBaseLayer);
    }

    if (mapInstance.hasLayer(labelsLayer)) {
        mapInstance.removeLayer(labelsLayer);
    }

    if (mode === "street") {
        currentBaseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 20,
            attribution: "&copy; OpenStreetMap"
        });
    } else if (mode === "terrain") {
        currentBaseLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
            maxZoom: 17,
            attribution: "&copy; OpenTopoMap"
        });
    } else {
        currentBaseLayer = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                maxZoom: 19,
                attribution: "Tiles &copy; Esri"
            }
        );
        labelsLayer.addTo(mapInstance);
        mode = "satellite";
    }

    activeBaseMode = mode;
    currentBaseLayer.addTo(mapInstance);
    updateControlStates();
    updateMapFooter();
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

function setMapStatusText(message) {
    if (mapStatusText) {
        mapStatusText.textContent = message;
    }
}

function setMapTimelineLabel(text) {
    if (mapTimelinePill) {
        mapTimelinePill.textContent = text;
    }

    if (mapTimelineText) {
        mapTimelineText.textContent = text;
    }
}
function updateFullscreenButton() {
    if (fullscreenMapBtn) {
        fullscreenMapBtn.textContent = document.fullscreenElement === weatherMapShell ? "Exit" : "Full";
    }
}

function updatePlayButton() {
    if (mapPlayBtn) {
        mapPlayBtn.textContent = radarPlaying ? "Pause" : "Play";
    }
}

function updateControlStates() {
    mapModeStreetBtn?.classList.toggle("active", activeBaseMode === "street");
    mapModeSatelliteBtn?.classList.toggle("active", activeBaseMode === "satellite");
    labelsToggleBtn?.classList.toggle("active", activeBaseMode === "terrain");
    weatherFocusBtn?.classList.toggle("active", activeOverlayMode === "weather");
    tempOverlayBtn?.classList.toggle("active", activeOverlayMode === "temp");
    windOverlayBtn?.classList.toggle("active", activeOverlayMode === "wind");
    humidityOverlayBtn?.classList.toggle("active", activeOverlayMode === "humidity");
    rainOverlayBtn?.classList.toggle("active", activeOverlayMode === "rain");
    radarToggleBtn?.classList.toggle("active", activeOverlayMode === "radar");
    recordsToggleBtn?.classList.toggle("active", activeOverlayMode === "records");

    mapChips.forEach((chip) => {
        chip.classList.toggle(
            "active",
            shortLocationLabel(activePayload?.location || activeQuery).toLowerCase() ===
                String(chip.dataset.mapLocation || "").trim().toLowerCase()
        );
    });
}

function updateMapFooter() {
    if (mapFooterOverlay) {
        mapFooterOverlay.textContent = getOverlayLabel();
    }

    if (mapFooterBase) {
        mapFooterBase.textContent = getBaseModeLabel();
    }

    if (mapFooterZoom) {
        mapFooterZoom.textContent = String(mapInstance ? mapInstance.getZoom() : mapZoomLevel);
    }

    if (mapFooterFocus) {
        mapFooterFocus.textContent = activeLocation.label;
    }

    if (mapFooterCoords) {
        const center = mapInstance ? mapInstance.getCenter() : { lat: activeLocation.lat, lng: activeLocation.lon };
        mapFooterCoords.textContent = `${Number(center.lat).toFixed(4)}, ${Number(center.lng).toFixed(4)}`;
    }

    syncWindyMap();
}

function updateSnapshotCard() {
    if (!activePayload) {
        if (mapSnapshotTemp) mapSnapshotTemp.textContent = "--";
        if (mapSnapshotWind) mapSnapshotWind.textContent = "--";
        if (mapSnapshotCondition) mapSnapshotCondition.textContent = "--";
        if (mapSnapshotUpdated) mapSnapshotUpdated.textContent = "--";
        if (mapSnapshotLocation) mapSnapshotLocation.textContent = activeLocation.label;
        return;
    }

    if (mapSnapshotTemp) {
        mapSnapshotTemp.textContent = `${Number(activePayload.current.temperature).toFixed(1)} C`;
    }

    if (mapSnapshotWind) {
        mapSnapshotWind.textContent = `${Number(activePayload.current.windSpeed).toFixed(1)} km/h`;
    }

    if (mapSnapshotCondition) {
        mapSnapshotCondition.textContent =
            weatherDescriptions[activePayload.current.weatherCode] || "Live weather";
    }

    if (mapSnapshotUpdated) {
        mapSnapshotUpdated.textContent = formatMapTimeline(activePayload.current.time);
    }

    if (mapSnapshotLocation) {
        mapSnapshotLocation.textContent = activePayload.location;
    }
}

function renderFocusLayers() {
    if (!mapInstance || !activePayload) {
        return;
    }

    const latLng = [activePayload.latitude, activePayload.longitude];
    const metric = getOverlayMetric(activePayload, activeOverlayMode);
    const markerValue = metric.markerValue;
    const markerLabel = shortLocationLabel(activePayload.location);

    if (focusMarker) {
        mapInstance.removeLayer(focusMarker);
    }

    if (focusCircle) {
        mapInstance.removeLayer(focusCircle);
    }

    focusCircle = L.circle(latLng, {
        radius: metric.circleRadius,
        color: metric.color,
        weight: 2,
        fillColor: metric.color,
        fillOpacity: 0.2
    }).addTo(mapInstance);

    focusMarker = L.marker(latLng, {
        icon: createTemperatureIcon(markerLabel, markerValue, "focus"),
        draggable: true
    }).addTo(mapInstance);

    focusMarker.bindPopup(buildFocusPopup(activePayload));
    focusMarker.on("dragend", async (event) => {
        const position = event.target.getLatLng();
        setMapStatusText("Updating weather for the pinned map point...");

        try {
            const payload = await fetchBundleByCoords(
                position.lat,
                position.lng,
                `Pinned ${position.lat.toFixed(2)}, ${position.lng.toFixed(2)}`
            );
            await applyPayload(payload, {
                query: `${position.lat.toFixed(2)},${position.lng.toFixed(2)}`,
                fly: false,
                updateQuery: false
            });
            focusMarker.openPopup();
        } catch (error) {
            setMapStatusText(error.message || "Unable to update the pinned map point.");
        }
    });
}
async function loadMajorCityMarkers(force = false) {
    if (!mapInstance || !majorCityLayer) {
        return;
    }

    if (!force && majorCityLayer.getLayers().length) {
        return;
    }

    majorCityLayer.clearLayers();

    const results = await Promise.allSettled(
        majorCities.map(async (city) => {
            const payload = await fetchLocationBundle(city.name, force);
            return { city, payload };
        })
    );

    results.forEach((result) => {
        if (result.status !== "fulfilled") {
            return;
        }

        const { city, payload } = result.value;
        const metric = getOverlayMetric(payload, activeOverlayMode);
        const marker = L.marker([payload.latitude, payload.longitude], {
            icon: createTemperatureIcon(city.label, metric.markerValue, "city")
        });

        marker.bindPopup(buildFocusPopup(payload));
        marker.on("click", () => {
            applyPayload(payload, { query: city.name, fly: true, updateQuery: true });
        });

        majorCityLayer.addLayer(marker);
    });
}

async function loadSavedRecordMarkers(force = false) {
    if (!mapInstance || !savedRecordsLayer) {
        return;
    }

    if (recordsLoaded && !force) {
        return;
    }

    savedRecordsLayer.clearLayers();
    recordsLoaded = true;

    try {
        const records = await fetchJson(`${getApiBase()}/records`);

        if (!Array.isArray(records) || !records.length) {
            return;
        }

        const grouped = new Map();
        records.forEach((record) => {
            const location = String(record.location || "").trim();

            if (!location) {
                return;
            }

            const key = location.toLowerCase();
            if (!grouped.has(key)) {
                grouped.set(key, {
                    location,
                    count: 0,
                    latestDate: record.date || "Unknown date",
                    temps: [],
                    days: new Set()
                });
            }

            const entry = grouped.get(key);
            entry.count += 1;
            entry.latestDate = record.date || entry.latestDate;
            entry.temps.push(Number(record.temp));
            if (record.day) {
                entry.days.add(record.day);
            }
        });

        const locations = Array.from(grouped.values()).sort((a, b) => b.count - a.count).slice(0, 10);
        const results = await Promise.allSettled(
            locations.map(async (entry) => ({
                entry,
                payload: await fetchLocationBundle(entry.location)
            }))
        );

        results.forEach((result) => {
            if (result.status !== "fulfilled") {
                return;
            }

            const { entry, payload } = result.value;
            const validTemps = entry.temps.filter((value) => !Number.isNaN(value));
            const avgTemp = validTemps.length
                ? (validTemps.reduce((sum, value) => sum + value, 0) / validTemps.length).toFixed(1)
                : "--";

            const marker = L.marker([payload.latitude, payload.longitude], {
                icon: createRecordIcon(entry.count),
                pane: "recordPane"
            });

            marker.bindPopup(`
                <div class="map-popup-card">
                    <strong>${entry.location}</strong>
                    <p>${entry.count} saved record(s). Latest saved date: ${entry.latestDate}.</p>
                    <p>Average saved temperature: ${avgTemp} C. Recorded day set: ${Array.from(entry.days).slice(0, 3).join(", ") || "Unknown"}.</p>
                </div>
            `);

            marker.on("click", () => {
                updateLocation(entry.location, false);
            });

            savedRecordsLayer.addLayer(marker);
        });
    } catch (error) {
        setMapStatusText(error.message || "Saved record markers are unavailable right now.");
    }
}

async function fetchRadarFrames(force = false) {
    if (!force && radarFrames.length) {
        return radarFrames;
    }

    try {
        const radarData = await fetchJson("https://api.rainviewer.com/public/weather-maps.json");
        radarHost = radarData.host || radarHost;
        const frames = [...(radarData.radar?.past || []), ...(radarData.radar?.nowcast || [])]
            .filter((frame) => frame.path)
            .slice(-10);

        radarFrames = frames;
        currentRadarFrameIndex = Math.max(0, radarFrames.length - 1);
        return radarFrames;
    } catch (error) {
        radarFrames = [];
        return radarFrames;
    }
}

function clearRadarLayer() {
    if (mapInstance && radarLayer) {
        mapInstance.removeLayer(radarLayer);
        radarLayer = null;
    }
}

function buildRadarTileUrl(frame) {
    return `${radarHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
}

async function showRadarFrame(index = currentRadarFrameIndex) {
    if (!mapInstance) {
        return;
    }

    await fetchRadarFrames();

    if (!radarFrames.length) {
        clearRadarLayer();
        setMapLayerLabel(`${getBaseModeLabel()} + Weather Focus`);
        setMapTimelineLabel(formatMapTimeline());
        return;
    }

    currentRadarFrameIndex = Math.max(0, Math.min(index, radarFrames.length - 1));
    const frame = radarFrames[currentRadarFrameIndex];

    clearRadarLayer();
    radarLayer = L.tileLayer(buildRadarTileUrl(frame), {
        pane: "radarPane",
        opacity: 0.62,
        attribution: "Radar &copy; RainViewer"
    }).addTo(mapInstance);

    setMapTimelineLabel(formatMapTimeline(frame.time * 1000));
}
function stopRadarAnimation() {
    radarPlaying = false;

    if (radarAnimationTimer) {
        clearInterval(radarAnimationTimer);
        radarAnimationTimer = null;
    }

    updatePlayButton();
}

async function startRadarAnimation() {
    activeOverlayMode = "radar";
    await fetchRadarFrames();

    if (!radarFrames.length) {
        setMapStatusText("Live radar frames are unavailable right now, but location weather is still active.");
        updateControlStates();
        return;
    }

    stopRadarAnimation();
    radarPlaying = true;
    updateControlStates();
    updatePlayButton();
    await showRadarFrame(currentRadarFrameIndex);

    if (radarFrames.length > 1) {
        radarAnimationTimer = setInterval(() => {
            currentRadarFrameIndex = (currentRadarFrameIndex + 1) % radarFrames.length;
            showRadarFrame(currentRadarFrameIndex);
        }, 900);
    }
}

async function renderOverlayState() {
    if (!mapInstance && !isWindyOnlyMode) {
        return;
    }

    if (isWindyOnlyMode) {
        if (activePayload) {
            setMapStatusText(
                `Showing ${getWindyLayerLabel().toLowerCase()} map over ${activePayload.location}. Search any city, use My Location, or open the current view in Windy.`
            );
        }

        syncWindyMap(true);
        updateControlStates();
        updateMapFooter();
        return;
    }

    if (activePayload) {
        renderFocusLayers();
    }

    if (activeOverlayMode !== "radar") {
        stopRadarAnimation();
        clearRadarLayer();
    }

    if (activeOverlayMode === "radar") {
        await showRadarFrame(currentRadarFrameIndex);
    } else {
        setMapTimelineLabel(activePayload?.current?.time ? formatMapTimeline(activePayload.current.time) : formatMapTimeline());
    }

    if (activeOverlayMode === "records") {
        await loadSavedRecordMarkers();
        if (!mapInstance.hasLayer(savedRecordsLayer)) {
            savedRecordsLayer.addTo(mapInstance);
        }
    } else if (mapInstance.hasLayer(savedRecordsLayer)) {
        mapInstance.removeLayer(savedRecordsLayer);
    }

    if (activePayload) {
        setMapStatusText(
            `Showing ${getOverlayLabel().toLowerCase()} map over ${activePayload.location}. Drag the main marker, search any city, or use Me for current location.`
        );
    }

    await loadMajorCityMarkers(true);
    setMapLayerLabel(`${getBaseModeLabel()} + ${getOverlayLabel()}`);
    updateControlStates();
    updateMapFooter();
}

async function applyPayload(payload, options = {}) {
    const { query = payload.location, fly = true, updateQuery = true } = options;

    ensureMap();
    activePayload = normalizePayload(payload);
    activeQuery = query;
    activeLocation = {
        label: activePayload.location,
        lat: activePayload.latitude,
        lon: activePayload.longitude
    };

    mapLocationInput.value = shortLocationLabel(activePayload.location);
    setMapCityLabel(activePayload.location);
    setMapStatusText(
        `Showing ${getOverlayLabel().toLowerCase()} map over ${activePayload.location}. Drag the main marker, search any city, or use Me for current location.`
    );
    updateSnapshotCard();
    syncWindyMap(true);
    renderFocusLayers();

    if (fly && mapInstance) {
        mapInstance.flyTo([activePayload.latitude, activePayload.longitude], Math.max(mapInstance.getZoom(), 8), {
            duration: 1.15
        });
    }

    if (updateQuery) {
        window.history.replaceState({}, "", `map.html?location=${encodeURIComponent(query)}`);
    }

    await renderOverlayState();
    await loadMajorCityMarkers();
}

async function updateLocation(location, force = false) {
    const requestedLocation = (location || "").trim() || "Dhaka";
    setMapStatusText(`Loading live map for ${requestedLocation}...`);
    const payload = await fetchLocationBundle(requestedLocation, force);
    await applyPayload(payload, { query: requestedLocation, fly: true, updateQuery: true });
}

async function updateLocationFromCoords(lat, lon, label) {
    setMapStatusText("Finding live weather for your current location...");
    const payload = await fetchBundleByCoords(lat, lon, label);
    await applyPayload(payload, { query: label, fly: true, updateQuery: false });
}

function scheduleRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }

    refreshTimer = setInterval(async () => {
        try {
            bundleCache.delete(String(activeQuery || "").toLowerCase());
            await updateLocation(activeQuery, true);
            await fetchRadarFrames(true);
        } catch (error) {
            setMapStatusText(error.message || "Automatic refresh could not update the map.");
        }
    }, 10 * 60 * 1000);
}
mapSearchForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        await updateLocation(mapLocationInput.value.trim() || "Dhaka");
    } catch (error) {
        setMapLayerLabel(error.message || "Unable to load that location.");
        setMapStatusText(error.message || "Unable to load that location.");
    }
});

mapChips.forEach((chip) => {
    chip.addEventListener("click", async () => {
        const location = String(chip.dataset.mapLocation || "").trim();

        if (!location) {
            return;
        }

        try {
            await updateLocation(location);
        } catch (error) {
            setMapLayerLabel(error.message || "Unable to load that location.");
            setMapStatusText(error.message || "Unable to load that location.");
        }
    });
});

mapModeStreetBtn?.addEventListener("click", () => {
    setBaseLayer("street");
    renderOverlayState();
});

mapModeSatelliteBtn?.addEventListener("click", () => {
    setBaseLayer("satellite");
    renderOverlayState();
});

labelsToggleBtn?.addEventListener("click", () => {
    setBaseLayer("terrain");
    renderOverlayState();
});

weatherFocusBtn?.addEventListener("click", async () => {
    activeOverlayMode = "weather";
    await renderOverlayState();
});

tempOverlayBtn?.addEventListener("click", async () => {
    activeOverlayMode = "temp";
    await renderOverlayState();
});

windOverlayBtn?.addEventListener("click", async () => {
    activeOverlayMode = "wind";
    await renderOverlayState();
});

humidityOverlayBtn?.addEventListener("click", async () => {
    activeOverlayMode = "humidity";
    await renderOverlayState();
});

rainOverlayBtn?.addEventListener("click", async () => {
    activeOverlayMode = "rain";
    await renderOverlayState();
});

radarToggleBtn?.addEventListener("click", async () => {
    activeOverlayMode = "radar";
    await renderOverlayState();
});

recordsToggleBtn?.addEventListener("click", async () => {
    activeOverlayMode = "records";
    await renderOverlayState();
});

mapPlayBtn?.addEventListener("click", async () => {
    if (radarPlaying) {
        stopRadarAnimation();
        await renderOverlayState();
    } else {
        await startRadarAnimation();
        setMapLayerLabel(`${getBaseModeLabel()} + ${getOverlayLabel()}`);
    }
});

zoomInMapBtn?.addEventListener("click", () => {
    mapInstance?.zoomIn();
});

zoomOutMapBtn?.addEventListener("click", () => {
    mapInstance?.zoomOut();
});

recenterMapBtn?.addEventListener("click", () => {
    if (!mapInstance) {
        return;
    }

    mapInstance.fitBounds(bangladeshBounds, { padding: [26, 26] });
});

locateMeBtn?.addEventListener("click", () => {
    if (!navigator.geolocation) {
        setMapStatusText("Browser geolocation is not available on this device.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                await updateLocationFromCoords(
                    position.coords.latitude,
                    position.coords.longitude,
                    `My Location ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`
                );
            } catch (error) {
                setMapStatusText(error.message || "Unable to load your current location.");
            }
        },
        () => {
            setMapStatusText("Location permission was denied, so the map stayed on the current city.");
        },
        {
            enableHighAccuracy: true,
            timeout: 10000
        }
    );
});

refreshRadarBtn?.addEventListener("click", async () => {
    try {
        bundleCache.delete(String(activeQuery || "").toLowerCase());
        await updateLocation(activeQuery, true);
        if (!isWindyOnlyMode) {
            await fetchRadarFrames(true);
            await loadMajorCityMarkers(true);
            recordsLoaded = false;
            await loadSavedRecordMarkers(true);
        }
    } catch (error) {
        setMapStatusText(error.message || "Unable to refresh the live map right now.");
    }
});

fullscreenMapBtn?.addEventListener("click", async () => {
    try {
        if (document.fullscreenElement === weatherMapShell) {
            await document.exitFullscreen();
        } else {
            await weatherMapShell.requestFullscreen();
        }
    } finally {
        updateFullscreenButton();
    }
});

document.addEventListener("fullscreenchange", updateFullscreenButton);
(async function initMapPage() {
    if (!window.L && !isWindyOnlyMode) {
        setMapStatusText("Interactive map library could not load. Please refresh and try again.");
        return;
    }

    ensureMap();
    updatePlayButton();
    updateFullscreenButton();
    updateControlStates();
    setMapTimelineLabel(formatMapTimeline());
    syncWindyMap(true);

    try {
        await updateLocation(getQueryLocation());
        if (!isWindyOnlyMode) {
            await fetchRadarFrames();
            await loadMajorCityMarkers();
        }
    } catch (error) {
        setMapLayerLabel(error.message || "Unable to load the live map.");
        setMapStatusText(error.message || "Unable to load the live map.");
        syncWindyMap(true);
    }

scheduleRefresh();
})();

windyWindBtn?.addEventListener("click", () => {
    activeWindyLayer = "wind";
    syncWindyMap(true);
});

windyRainBtn?.addEventListener("click", () => {
    activeWindyLayer = "rain";
    syncWindyMap(true);
});

windyTempBtn?.addEventListener("click", () => {
    activeWindyLayer = "temp";
    syncWindyMap(true);
});

windyPressureBtn?.addEventListener("click", () => {
    activeWindyLayer = "pressure";
    syncWindyMap(true);
});
