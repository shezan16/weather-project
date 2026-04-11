const table = document.getElementById("table");
const recordsTotal = document.getElementById("recordsTotal");
const recordsTotalMeta = document.getElementById("recordsTotalMeta");
const recordsAverageTemp = document.getElementById("recordsAverageTemp");
const recordsAverageMeta = document.getElementById("recordsAverageMeta");
const recordsWettest = document.getElementById("recordsWettest");
const recordsWettestMeta = document.getElementById("recordsWettestMeta");
const recordsLatest = document.getElementById("recordsLatest");
const recordsLatestMeta = document.getElementById("recordsLatestMeta");
const recordFilterInput = document.getElementById("recordFilterInput");
const clearFilterBtn = document.getElementById("clearFilterBtn");
let allRecords = [];

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
        throw new Error("Server returned an unexpected response.");
    }

    const payload = JSON.parse(rawText);

    if (!response.ok) {
        throw new Error(payload.error || "Request failed.");
    }

    return payload;
}

function renderHeader() {
    table.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Day</th>
            <th>Temp (C)</th>
            <th>Humidity (%)</th>
            <th>Rainfall (mm)</th>
            <th>Action</th>
        </tr>
    `;
}

function parseRecordDate(value) {
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(value || "").trim());

    if (!match) {
        return 0;
    }

    const [, day, month, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

function appendMessageRow(message) {
    const row = table.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 7;
    cell.textContent = message;
}

function renderOverview(records) {
    const temps = records.map((item) => Number(item.temp)).filter((value) => !Number.isNaN(value));
    const rains = records
        .map((item) => ({ ...item, rainValue: Number(item.rain) }))
        .filter((item) => !Number.isNaN(item.rainValue));
    const latest = records[0];
    const wettest = [...rains].sort((a, b) => b.rainValue - a.rainValue)[0];

    if (recordsTotal) {
        recordsTotal.textContent = `${records.length}`;
    }

    if (recordsTotalMeta) {
        recordsTotalMeta.textContent = records.length
            ? "Saved weather entries in archive."
            : "No records saved yet.";
    }

    if (recordsAverageTemp) {
        recordsAverageTemp.textContent = temps.length
            ? `${(temps.reduce((sum, value) => sum + value, 0) / temps.length).toFixed(1)} C`
            : "--";
    }

    if (recordsAverageMeta) {
        recordsAverageMeta.textContent = temps.length
            ? "Average across the visible records."
            : "Average temperature insight.";
    }

    if (recordsWettest) {
        recordsWettest.textContent = wettest ? `${wettest.rain} mm` : "--";
    }

    if (recordsWettestMeta) {
        recordsWettestMeta.textContent = wettest
            ? `${wettest.date || "Unknown date"}${wettest.location ? ` - ${wettest.location}` : ""}`
            : "Highest rainfall day.";
    }

    if (recordsLatest) {
        recordsLatest.textContent = latest?.date || "--";
    }

    if (recordsLatestMeta) {
        recordsLatestMeta.textContent = latest
            ? `${latest.location || "Unknown location"} - ${latest.day || "Unknown day"}`
            : "Most recent saved weather.";
    }
}

function renderRows(records) {
    renderHeader();

    if (!records.length) {
        appendMessageRow("No matching records found.");
        return;
    }

    records.forEach((item) => {
        const row = table.insertRow();

        row.insertCell().textContent = item.date || "-";
        row.insertCell().textContent = item.location || "-";
        row.insertCell().textContent = item.day || "-";
        row.insertCell().textContent = item.temp || "-";
        row.insertCell().textContent = item.hum || "-";
        row.insertCell().textContent = item.rain || "-";

        const actionCell = row.insertCell();
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Delete";
        button.addEventListener("click", () => deleteRecord(allRecords.indexOf(item)));
        actionCell.appendChild(button);
    });
}

function applyFilter() {
    const query = (recordFilterInput?.value || "").trim().toLowerCase();
    const filtered = query
        ? allRecords.filter((item) =>
            [item.date, item.location, item.day, item.temp, item.hum, item.rain]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        )
        : allRecords;

    renderOverview(filtered);
    renderRows(filtered);
}

async function loadData() {
    renderHeader();

    try {
        const data = await fetchJson(`${getApiBase()}/records`);
        allRecords = [...data].sort((a, b) => parseRecordDate(b.date) - parseRecordDate(a.date));
        applyFilter();
    } catch (error) {
        renderOverview([]);
        appendMessageRow(error.message || "Unable to load records right now.");
    }
}

async function deleteRecord(index) {
    const confirmed = window.confirm("Delete this weather record?");

    if (!confirmed) {
        return;
    }

    try {
        await fetchJson(`${getApiBase()}/delete/${index}`, { method: "DELETE" });
        loadData();
    } catch (error) {
        window.alert(error.message || "Unable to delete the record right now.");
    }
}

function goBack() {
    window.location.href = "index.html";
}

recordFilterInput?.addEventListener("input", applyFilter);
clearFilterBtn?.addEventListener("click", () => {
    if (recordFilterInput) {
        recordFilterInput.value = "";
    }

    applyFilter();
});

loadData();
