(function () {
    const USERS_KEY = "weather_local_users";
    const SESSION_KEY = "weather_local_session";
    const RECORDS_KEY = "weather_local_records";

    function normalizeText(value, fallback = "") {
        return String(value ?? fallback).trim();
    }

    function createId() {
        if (window.crypto?.randomUUID) {
            return window.crypto.randomUUID();
        }

        return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function readJson(key) {
        try {
            const raw = window.localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function writeJson(key, value) {
        window.localStorage.setItem(key, JSON.stringify(value));
    }

    function readUsers() {
        return readJson(USERS_KEY);
    }

    function writeUsers(users) {
        writeJson(USERS_KEY, users);
    }

    function readRecords() {
        return readJson(RECORDS_KEY);
    }

    function writeRecords(records) {
        writeJson(RECORDS_KEY, records);
    }

    function getSessionUserId() {
        return normalizeText(window.localStorage.getItem(SESSION_KEY));
    }

    function setSessionUserId(userId) {
        window.localStorage.setItem(SESSION_KEY, userId);
    }

    function clearSession() {
        window.localStorage.removeItem(SESSION_KEY);
    }

    function toPublicUser(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email
        };
    }

    function getSessionUser() {
        const sessionUserId = getSessionUserId();

        if (!sessionUserId) {
            return null;
        }

        return readUsers().find((user) => user.id === sessionUserId) || null;
    }

    function normalizeRecord(payload, userId) {
        return {
            id: normalizeText(payload?.id) || createId(),
            userId: normalizeText(payload?.userId || userId),
            date: normalizeText(payload?.date),
            location: normalizeText(payload?.location),
            day: normalizeText(payload?.day),
            temp: normalizeText(payload?.temp),
            hum: normalizeText(payload?.hum),
            rain: normalizeText(payload?.rain)
        };
    }

    function requireSession() {
        const sessionUser = getSessionUser();

        if (!sessionUser) {
            throw new Error("Please log in first.");
        }

        return sessionUser;
    }

    async function request(url, options = {}) {
        const method = String(options.method || "GET").toUpperCase();
        const parsedUrl = new URL(url, window.location.href);
        const path = parsedUrl.pathname;
        const body = options.body ? JSON.parse(options.body) : {};

        if (path === "/api/auth/me" && method === "GET") {
            const sessionUser = getSessionUser();
            return {
                authenticated: Boolean(sessionUser),
                user: sessionUser ? toPublicUser(sessionUser) : null
            };
        }

        if (path === "/api/auth/signup" && method === "POST") {
            const name = normalizeText(body.name);
            const email = normalizeText(body.email).toLowerCase();
            const password = normalizeText(body.password);
            const users = readUsers();

            if (!name || !email || !password) {
                throw new Error("Name, email, and password are required.");
            }

            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters.");
            }

            if (users.some((item) => normalizeText(item.email).toLowerCase() === email)) {
                throw new Error("This email is already registered.");
            }

            const user = {
                id: createId(),
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };

            users.push(user);
            writeUsers(users);
            setSessionUserId(user.id);
            return { message: "Account created.", user: toPublicUser(user) };
        }

        if (path === "/api/auth/login" && method === "POST") {
            const email = normalizeText(body.email).toLowerCase();
            const password = normalizeText(body.password);
            const user = readUsers().find((item) =>
                normalizeText(item.email).toLowerCase() === email && item.password === password
            );

            if (!user) {
                throw new Error("Email or password is incorrect.");
            }

            setSessionUserId(user.id);
            return { message: "Logged in.", user: toPublicUser(user), loginEmailSent: false };
        }

        if (path === "/api/auth/logout" && method === "POST") {
            clearSession();
            return { message: "Logged out." };
        }

        if (path === "/records" && method === "GET") {
            const sessionUser = requireSession();
            return readRecords().filter((record) => normalizeText(record.userId) === sessionUser.id);
        }

        if (path === "/add" && method === "POST") {
            const sessionUser = requireSession();
            const record = normalizeRecord(body, sessionUser.id);

            if (!record.date || !record.temp || !record.hum || !record.rain) {
                throw new Error("Date, temperature, humidity, and rainfall are required.");
            }

            const records = readRecords();
            records.push(record);
            writeRecords(records);
            return { message: "Added", record };
        }

        if (path.startsWith("/delete/") && method === "DELETE") {
            const sessionUser = requireSession();
            const recordId = normalizeText(path.split("/").pop());
            const records = readRecords();
            const nextRecords = records.filter((record) =>
                !(normalizeText(record.id) === recordId && normalizeText(record.userId) === sessionUser.id)
            );

            if (nextRecords.length === records.length) {
                throw new Error("Record not found.");
            }

            writeRecords(nextRecords);
            return { message: "Deleted" };
        }

        if (path.startsWith("/update/") && method === "PUT") {
            const sessionUser = requireSession();
            const recordId = normalizeText(path.split("/").pop());
            const records = readRecords();
            const targetIndex = records.findIndex((record) =>
                normalizeText(record.id) === recordId && normalizeText(record.userId) === sessionUser.id
            );

            if (targetIndex === -1) {
                throw new Error("Record not found.");
            }

            const record = normalizeRecord({ ...body, id: recordId }, sessionUser.id);
            records[targetIndex] = record;
            writeRecords(records);
            return { message: "Updated" };
        }

        return null;
    }

    window.weatherLocalApi = {
        request
    };
})();
