console.log(" NEW SERVER FILE RUNNING");
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const FILE = 'weather.json';

// READ
function readData() {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE));
}

// WRITE
function writeData(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

//  GET (IMPORTANT)
app.get('/records', (req, res) => {
    res.json(readData());
});

// ADD
app.post('/add', (req, res) => {
    const data = readData();
    data.push(req.body);
    writeData(data);
    res.json({ message: "Added" });
});

// DELETE
app.delete('/delete/:index', (req, res) => {
    const data = readData();
    data.splice(req.params.index, 1);
    writeData(data);
    res.json({ message: "Deleted" });
});

// UPDATE
app.put('/update/:index', (req, res) => {
    const data = readData();
    data[req.params.index] = req.body;
    writeData(data);
    res.json({ message: "Updated" });
});

app.listen(PORT, () => {
    console.log(" Server running at http://localhost:3000");
});


const cors = require('cors');
app.use(cors());