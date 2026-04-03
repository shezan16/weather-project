const table = document.getElementById("table");

function loadData() {
    fetch('/records')
        .then(res => res.json())
        .then(data => {
            table.innerHTML = `
                <tr>
                    <th>Date</th>
                    <th>Temp</th>
                    <th>Humidity</th>
                    <th>Rain</th>
                    <th>Action</th>
                </tr>
            `;

            data.forEach((item, index) => {
                table.innerHTML += `
                    <tr>
                        <td>${item.date}</td>
                        <td>${item.temp}</td>
                        <td>${item.hum}</td>
                        <td>${item.rain}</td>
                        <td>
                            <button onclick="deleteRecord(${index})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        });
}

function deleteRecord(index) {
    fetch('/delete/' + index, { method: 'DELETE' })
        .then(() => loadData());
}

function goBack() {
    window.location.href = "index.html";
}

loadData();