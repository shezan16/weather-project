const weatherMapElement = document.getElementById("weatherMap");
const weatherMapShell = document.getElementById("weatherMapShell");
const radarToggleBtn = document.getElementById("radarToggleBtn");
const recenterMapBtn = document.getElementById("recenterMapBtn");
const refreshRadarBtn = document.getElementById("refreshRadarBtn");
const zoomOutMapBtn = document.getElementById("zoomOutMapBtn");
const zoomInMapBtn = document.getElementById("zoomInMapBtn");
const fullscreenMapBtn = document.getElementById("fullscreenMapBtn");
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
const mapFooterZoom = document.getElementById("mapFooterZoom");
const mapFooterFocus = document.getElementById("mapFooterFocus");

let activeWeatherOverlay = "radar";
let mapZoomLevel = 6;
let radarPlaying = false;
let radarRefreshId = null;
let mapSnapshot = null;
let activeLocation = {
    label: "Dhaka, Bangladesh",
    lat: 23.8103,
    lon: 90.4125
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
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Severe thunderstorm"
};

function getQueryLocation() {
    const params = new URLSearchParams(window.location.search);
    return params.get("location") || "Dhaka";
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

async function geocodeLocation(location) {
    const geocodeUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const geocodeData = await fetchTextJson(geocodeUrl);

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

function updateRadarPlaybackButton() {
    if (mapPlayBtn) {
        mapPlayBtn.textContent = radarPlaying ? "Pause" : "Play";
    }
}

function updateFullscreenButton() {
    if (fullscreenMapBtn) {
        fullscreenMapBtn.textContent = document.fullscreenElement === weatherMapShell ? "Exit" : "Full";
    }
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

    mapChips.forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.mapLocation === mapLocationInput.value.trim());
    });
}

function updateMapFooter() {
    if (mapFooterOverlay) {
        mapFooterOverlay.textContent = radarPlaying ? "Radar Animation" : activeWeatherOverlay[0].toUpperCase() + activeWeatherOverlay.slice(1);
    }

    if (mapFooterZoom) {
        mapFooterZoom.textContent = `${mapZoomLevel}x`;
    }

    if (mapFooterFocus) {
        mapFooterFocus.textContent = activeLocation.label;
    }
}

function updateSnapshotCard() {
    if (!mapSnapshot) {
        if (mapSnapshotTemp) mapSnapshotTemp.textContent = "--";
        if (mapSnapshotWind) mapSnapshotWind.textContent = "--";
        if (mapSnapshotCondition) mapSnapshotCondition.textContent = "--";
        if (mapSnapshotUpdated) mapSnapshotUpdated.textContent = "--";
        if (mapSnapshotLocation) mapSnapshotLocation.textContent = activeLocation.label;
        return;
    }

    if (mapSnapshotTemp) {
        mapSnapshotTemp.textContent = `${Number(mapSnapshot.temperature).toFixed(1)}°C`;
    }

    if (mapSnapshotWind) {
        mapSnapshotWind.textContent = `${Number(mapSnapshot.windSpeed).toFixed(1)} km/h`;
    }

    if (mapSnapshotCondition) {
        mapSnapshotCondition.textContent = weatherDescriptions[mapSnapshot.weatherCode] || "Live weather";
    }

    if (mapSnapshotUpdated) {
        mapSnapshotUpdated.textContent = new Date(mapSnapshot.time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    if (mapSnapshotLocation) {
        mapSnapshotLocation.textContent = activeLocation.label;
    }
}

async function fetchMapSnapshot() {
    const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${activeLocation.lat}&longitude=${activeLocation.lon}` +
        "&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto";
    const forecastData = await fetchTextJson(forecastUrl);
    const current = forecastData.current;

    mapSnapshot = {
        temperature: current.temperature_2m,
        windSpeed: current.wind_speed_10m,
        weatherCode: current.weather_code,
        time: current.time
    };

    updateSnapshotCard();
}

function getWeatherMapEmbedUrl() {
    const overlay = radarPlaying ? "radar" : activeWeatherOverlay;
    const params = new URLSearchParams({
        lat: activeLocation.lat.toFixed(4),
        lon: activeLocation.lon.toFixed(4),
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
        detailLat: activeLocation.lat.toFixed(4),
        detailLon: activeLocation.lon.toFixed(4),
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
    setMapLayerLabel(`Live ${activeWeatherOverlay} map`);
    setMapCityLabel(activeLocation.label);
    setMapStatusText(`Tracking ${activeLocation.label} in ${radarPlaying ? "animated radar" : activeWeatherOverlay} mode.`);
    updateMapModeButtons();
    updateRadarPlaybackButton();
    updateMapFooter();
    updateSnapshotCard();

    weatherMapElement.innerHTML = `
        <iframe
            title="Live weather map"
            src="${getWeatherMapEmbedUrl()}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
        ></iframe>
    `;
}

function scheduleRadarRefresh() {
    if (radarRefreshId) {
        clearInterval(radarRefreshId);
    }

    radarRefreshId = setInterval(() => {
        renderWeatherMapEmbed();
    }, 10 * 60 * 1000);
}

function stopRadarAnimation() {
    radarPlaying = false;
    updateRadarPlaybackButton();
}

function startRadarAnimation() {
    radarPlaying = true;
    updateRadarPlaybackButton();
}

async function updateLocation(location) {
    setMapStatusText(`Finding ${location} on the live weather map...`);
    const resolvedLocation = await geocodeLocation(location);
    activeLocation = resolvedLocation;
    mapZoomLevel = 7;
    mapLocationInput.value = location;
    window.history.replaceState({}, "", `map.html?location=${encodeURIComponent(location)}`);
    await fetchMapSnapshot();
    renderWeatherMapEmbed();
}

if (mapSearchForm) {
    mapSearchForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const location = mapLocationInput.value.trim() || "Dhaka";

        try {
            await updateLocation(location);
        } catch (error) {
            setMapLayerLabel(error.message || "Unable to load that location.");
            setMapStatusText(error.message || "Unable to load that location.");
        }
    });
}

mapChips.forEach((chip) => {
    chip.addEventListener("click", async () => {
        const location = chip.dataset.mapLocation || "";

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

radarToggleBtn?.addEventListener("click", () => {
    stopRadarAnimation();
    activeWeatherOverlay = "radar";
    renderWeatherMapEmbed();
});

labelsToggleBtn?.addEventListener("click", () => {
    stopRadarAnimation();
    activeWeatherOverlay = "wind";
    renderWeatherMapEmbed();
});

mapModeSatelliteBtn?.addEventListener("click", () => {
    stopRadarAnimation();
    activeWeatherOverlay = "clouds";
    renderWeatherMapEmbed();
});

mapModeStreetBtn?.addEventListener("click", () => {
    stopRadarAnimation();
    activeWeatherOverlay = "temp";
    renderWeatherMapEmbed();
});

refreshRadarBtn?.addEventListener("click", () => {
    stopRadarAnimation();
    renderWeatherMapEmbed();
});

zoomInMapBtn?.addEventListener("click", () => {
    mapZoomLevel = Math.min(11, mapZoomLevel + 1);
    renderWeatherMapEmbed();
});

recenterMapBtn?.addEventListener("click", () => {
    mapZoomLevel = 6;
    renderWeatherMapEmbed();
});

zoomOutMapBtn?.addEventListener("click", () => {
    mapZoomLevel = Math.max(3, mapZoomLevel - 1);
    renderWeatherMapEmbed();
});

mapPlayBtn?.addEventListener("click", () => {
    if (radarPlaying) {
        stopRadarAnimation();
    } else {
        activeWeatherOverlay = "radar";
        startRadarAnimation();
    }

    renderWeatherMapEmbed();
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
    const initialLocation = getQueryLocation();
    mapLocationInput.value = initialLocation;

    try {
        await updateLocation(initialLocation);
    } catch (error) {
        setMapLayerLabel(error.message || "Unable to load live map location.");
        setMapStatusText(error.message || "Unable to load live map location.");
        renderWeatherMapEmbed();
    }

    scheduleRadarRefresh();
    updateFullscreenButton();
    updateMapFooter();
})();
