const table = document.getElementById("table");

function getApiBase() {
    const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (isLocalHost && window.location.port && window.location.port !== "3000") {
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    }

    return "";
}

async function loadData() {
    try {
        const response = await fetch(`${getApiBase()}/records`);
        const data = await response.json();

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

        data.forEach((item, index) => {
            table.innerHTML += `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.location || "-"}</td>
                    <td>${item.day || "-"}</td>
                    <td>${item.temp}</td>
                    <td>${item.hum}</td>
                    <td>${item.rain}</td>
                    <td><button onclick="deleteRecord(${index})">Delete</button></td>
                </tr>
            `;
        });
    } catch (error) {
        table.innerHTML += `
            <tr>
                <td colspan="7">Unable to load records right now.</td>
            </tr>
        `;
    }
}

async function deleteRecord(index) {
    await fetch(`${getApiBase()}/delete/${index}`, { method: "DELETE" });
    loadData();
}

function goBack() {
    window.location.href = "index.html";
}

loadData();
