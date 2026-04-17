const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const RECORDS_FILE = path.join(__dirname, "weather.json");
const USERS_FILE = path.join(__dirname, "users.json");

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "weather-project-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: "lax"
    }
}));
app.use(express.static(__dirname));

function readCollection(filePath) {
    if (!fs.existsSync(filePath)) {
        return [];
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function writeCollection(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function normalizeText(value, fallback = "") {
    return String(value ?? fallback).trim();
}

function readUsers() {
    return readCollection(USERS_FILE).map((item) => ({
        id: normalizeText(item.id),
        name: normalizeText(item.name),
        email: normalizeText(item.email).toLowerCase(),
        passwordHash: normalizeText(item.passwordHash),
        createdAt: normalizeText(item.createdAt)
    })).filter((item) => item.id && item.email && item.passwordHash);
}

function writeUsers(users) {
    writeCollection(USERS_FILE, users);
}

function normalizeRecord(payload = {}, userId = "") {
    return {
        id: normalizeText(payload.id) || crypto.randomUUID(),
        userId: normalizeText(payload.userId || userId),
        date: normalizeText(payload.date),
        location: normalizeText(payload.location),
        day: normalizeText(payload.day),
        temp: normalizeText(payload.temp),
        hum: normalizeText(payload.hum),
        rain: normalizeText(payload.rain)
    };
}

function isValidRecord(record) {
    return Boolean(record.userId && record.date && record.temp && record.hum && record.rain);
}

function readRecords() {
    return readCollection(RECORDS_FILE).map((item) => normalizeRecord(item, item.userId));
}

function writeRecords(records) {
    writeCollection(RECORDS_FILE, records);
}

function toPublicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
}

function getSessionUser(req) {
    const userId = normalizeText(req.session?.userId);

    if (!userId) {
        return null;
    }

    return readUsers().find((item) => item.id === userId) || null;
}

function requireAuth(req, res, next) {
    const sessionUser = getSessionUser(req);

    if (!sessionUser) {
        return res.status(401).json({ error: "Please log in first." });
    }

    req.sessionUser = sessionUser;
    next();
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

async function sendLoginAlertEmail(user, req) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.LOGIN_ALERT_FROM_EMAIL;

    if (!apiKey || !fromEmail || !user?.email) {
        return { sent: false, skipped: true };
    }

    const loginTime = new Date().toLocaleString("en-BD", {
        timeZone: "Asia/Dhaka",
        dateStyle: "medium",
        timeStyle: "short"
    });
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [user.email],
            subject: "New login to your Weather account",
            html: `
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10233d">
                    <h2 style="margin-bottom:8px;">Hello ${user.name || "there"},</h2>
                    <p>Your Weather account was just accessed successfully.</p>
                    <p><strong>Login time:</strong> ${loginTime}</p>
                    <p><strong>IP address:</strong> ${ipAddress}</p>
                    <p>If this was you, no action is needed.</p>
                </div>
            `
        })
    });

    if (!response.ok) {
        throw new Error(`Login email failed: ${response.status}`);
    }

    return { sent: true, skipped: false };
}

app.get("/records", (req, res) => {
    const sessionUser = getSessionUser(req);

    if (!sessionUser) {
        return res.status(401).json({ error: "Please log in first." });
    }

    const data = readRecords().filter((item) => item.userId === sessionUser.id);
    res.json(data);
});

app.get("/api/auth/me", (req, res) => {
    const sessionUser = getSessionUser(req);

    if (!sessionUser) {
        return res.json({ authenticated: false, user: null });
    }

    res.json({ authenticated: true, user: toPublicUser(sessionUser) });
});

app.post("/api/auth/signup", async (req, res) => {
    const name = normalizeText(req.body?.name);
    const email = normalizeText(req.body?.email).toLowerCase();
    const password = normalizeText(req.body?.password);
    const users = readUsers();

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    if (users.some((item) => item.email === email)) {
        return res.status(409).json({ error: "This email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash,
        createdAt: new Date().toISOString()
    };

    users.push(user);
    writeUsers(users);
    req.session.userId = user.id;
    res.json({ message: "Account created.", user: toPublicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
    const email = normalizeText(req.body?.email).toLowerCase();
    const password = normalizeText(req.body?.password);
    const user = readUsers().find((item) => item.email === email);

    if (!user) {
        return res.status(401).json({ error: "Email or password is incorrect." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
        return res.status(401).json({ error: "Email or password is incorrect." });
    }

    req.session.userId = user.id;

    let loginEmailSent = false;

    try {
        const emailResult = await sendLoginAlertEmail(user, req);
        loginEmailSent = Boolean(emailResult.sent);
    } catch (error) {
        console.error(error.message);
    }

    res.json({
        message: "Logged in.",
        user: toPublicUser(user),
        loginEmailSent
    });
});

app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out." });
    });
});

app.post("/add", requireAuth, (req, res) => {
    const data = readRecords();
    const record = normalizeRecord(req.body, req.sessionUser.id);

    if (!isValidRecord(record)) {
        return res.status(400).json({
            error: "Date, temperature, humidity, and rainfall are required."
        });
    }

    data.push(record);
    writeRecords(data);
    res.json({ message: "Added", record });
});

app.delete("/delete/:recordId", requireAuth, (req, res) => {
    const data = readRecords();
    const recordId = normalizeText(req.params.recordId);
    const index = data.findIndex((item) => item.id === recordId && item.userId === req.sessionUser.id);

    if (index === -1) {
        return res.status(404).json({ error: "Record not found." });
    }

    data.splice(index, 1);
    writeRecords(data);
    res.json({ message: "Deleted" });
});

app.put("/update/:recordId", requireAuth, (req, res) => {
    const data = readRecords();
    const recordId = normalizeText(req.params.recordId);
    const index = data.findIndex((item) => item.id === recordId && item.userId === req.sessionUser.id);
    const record = normalizeRecord({ ...req.body, id: recordId }, req.sessionUser.id);

    if (index === -1) {
        return res.status(404).json({ error: "Record not found." });
    }

    if (!isValidRecord(record)) {
        return res.status(400).json({
            error: "Date, temperature, humidity, and rainfall are required."
        });
    }

    data[index] = record;
    writeRecords(data);
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
