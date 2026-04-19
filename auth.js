const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const authStatus = document.getElementById("authStatus");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const signupSubmitBtn = document.getElementById("signupSubmitBtn");
const currentAuthPage = document.body.dataset.authPage || (
    signupForm ? "signup" : "login"
);

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
                throw new Error("Start the Node server and open http://localhost:3000/login.html.");
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

function setAuthStatus(message, isError = false) {
    if (!authStatus) {
        return;
    }

    authStatus.textContent = message;
    authStatus.classList.toggle("is-error", isError);
    authStatus.classList.toggle("is-success", !isError && Boolean(message));
}

function setLoadingState(button, isLoading, label) {
    if (!button) {
        return;
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? "Please wait..." : label;
}

async function redirectIfAuthenticated() {
    try {
        const session = await fetchJson(`${getApiBase()}/api/auth/me`);

        if (session.authenticated) {
            window.location.href = "index.html";
        }
    } catch (error) {
        // Keep the auth page visible if the session check fails.
    }
}

async function handleLogin(event) {
    event.preventDefault();
    setLoadingState(loginSubmitBtn, true, "Login to Dashboard");

    try {
        await fetchJson(`${getApiBase()}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: document.getElementById("loginEmail").value.trim(),
                password: document.getElementById("loginPassword").value
            })
        });

        setAuthStatus("Login successful. Opening your dashboard...", false);
        window.location.href = "index.html";
    } catch (error) {
        setAuthStatus(error.message || "Unable to log in right now.", true);
    } finally {
        setLoadingState(loginSubmitBtn, false, "Login to Dashboard");
    }
}

async function handleSignup(event) {
    event.preventDefault();
    setLoadingState(signupSubmitBtn, true, "Create Account");

    try {
        await fetchJson(`${getApiBase()}/api/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: document.getElementById("signupName").value.trim(),
                email: document.getElementById("signupEmail").value.trim(),
                password: document.getElementById("signupPassword").value
            })
        });

        setAuthStatus("Account created. Opening your dashboard...", false);
        window.location.href = "index.html";
    } catch (error) {
        setAuthStatus(error.message || "Unable to create your account right now.", true);
    } finally {
        setLoadingState(signupSubmitBtn, false, "Create Account");
    }
}

loginForm?.addEventListener("submit", handleLogin);
signupForm?.addEventListener("submit", handleSignup);

setAuthStatus(
    currentAuthPage === "signup"
        ? "Create a new account to keep your own record archive."
        : "Use your account to access saved weather records.",
    false
);
redirectIfAuthenticated();
