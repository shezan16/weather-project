const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, "weather.json");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function readData() {
    if (!fs.existsSync(FILE)) {
        return [];
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(FILE, "utf8"));
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function writeData(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function normalizeText(value, fallback = "") {
    return String(value ?? fallback).trim();
}

function normalizeRecord(payload = {}) {
    return {
        date: normalizeText(payload.date),
        location: normalizeText(payload.location),
        day: normalizeText(payload.day),
        temp: normalizeText(payload.temp),
        hum: normalizeText(payload.hum),
        rain: normalizeText(payload.rain)
    };
}

function isValidRecord(record) {
    return Boolean(record.date && record.temp && record.hum && record.rain);
}

function isValidIndex(index, collection) {
    return Number.isInteger(index) && index >= 0 && index < collection.length;
}

async function getJson(url) {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "weather-project/1.0"
        }
    });

    if (!response.ok) {
        throw new Error(`Weather service error: ${response.status}`);
    }

    return response.json();
}

async function getCoordinates(location) {
    const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodeUrl.searchParams.set("name", location);
    geocodeUrl.searchParams.set("count", "1");
    geocodeUrl.searchParams.set("language", "en");
    geocodeUrl.searchParams.set("format", "json");

    const geocodeData = await getJson(geocodeUrl);

    if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error("Location not found");
    }

    return geocodeData.results[0];
}

function buildForecastSummary(forecastData) {
    const hourlyTimes = forecastData.hourly?.time || [];
    const hourlyTemps = forecastData.hourly?.temperature_2m || [];
    const dailyTimes = forecastData.daily?.time || [];
    const dailyCodes = forecastData.daily?.weather_code || [];
    const dailyMax = forecastData.daily?.temperature_2m_max || [];
    const dailyMin = forecastData.daily?.temperature_2m_min || [];

    return {
        hourly: hourlyTimes.slice(0, 8).map((time, index) => ({
            time,
            temperature: hourlyTemps[index]
        })),
        daily: dailyTimes.slice(0, 7).map((time, index) => ({
            time,
            weatherCode: dailyCodes[index],
            maxTemperature: dailyMax[index],
            minTemperature: dailyMin[index]
        }))
    };
}

app.get("/records", (req, res) => {
    const data = readData().map((item) => normalizeRecord(item));
    res.json(data);
});

app.post("/add", (req, res) => {
    const data = readData();
    const record = normalizeRecord(req.body);

    if (!isValidRecord(record)) {
        return res.status(400).json({
            error: "Date, temperature, humidity, and rainfall are required."
        });
    }

    data.push(record);
    writeData(data);
    res.json({ message: "Added" });
});

app.delete("/delete/:index", (req, res) => {
    const data = readData();
    const index = Number(req.params.index);

    if (!isValidIndex(index, data)) {
        return res.status(404).json({ error: "Record not found." });
    }

    data.splice(index, 1);
    writeData(data);
    res.json({ message: "Deleted" });
});

app.put("/update/:index", (req, res) => {
    const data = readData();
    const index = Number(req.params.index);
    const record = normalizeRecord(req.body);

    if (!isValidIndex(index, data)) {
        return res.status(404).json({ error: "Record not found." });
    }

    if (!isValidRecord(record)) {
        return res.status(400).json({
            error: "Date, temperature, humidity, and rainfall are required."
        });
    }

    data[index] = record;
    writeData(data);
    res.json({ message: "Updated" });
});

app.get("/api/live-weather", async (req, res) => {
    const location = (req.query.location || "Dhaka").toString().trim();

    try {
        const place = await getCoordinates(location);
        const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
        forecastUrl.searchParams.set("latitude", place.latitude);
        forecastUrl.searchParams.set("longitude", place.longitude);
        forecastUrl.searchParams.set(
            "current",
            "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature"
        );
        forecastUrl.searchParams.set("hourly", "temperature_2m");
        forecastUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
        forecastUrl.searchParams.set("timezone", "auto");

        const forecastData = await getJson(forecastUrl);
        const current = forecastData.current;
        const forecastSummary = buildForecastSummary(forecastData);

        res.json({
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
            hourly: forecastSummary.hourly,
            daily: forecastSummary.daily
        });
    } catch (error) {
        const status = error.message === "Location not found" ? 404 : 500;
        res.status(status).json({
            error: error.message || "Unable to fetch live weather right now."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
