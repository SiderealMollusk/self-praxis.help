import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 80;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure db file exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ shifts: {}, config: { set: "SET", from: "FROM", config: "CONFIG" } }));
}

// Helper to read DB
const readDb = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Read Error:", err);
        return { shifts: {}, config: { set: "SET", from: "FROM", config: "CONFIG" } };
    }
};

// Helper to write DB
const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Write Error:", err);
    }
};

// API: Get Data
app.get('/api/data', (req, res) => {
    const data = readDb();
    res.json(data);
});

// API: Update Shift
app.post('/api/shift', (req, res) => {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: "Missing key" });

    const db = readDb();
    db.shifts = db.shifts || {};
    db.shifts[key] = value || ""; // Allow clearing
    console.log(`Updated shift: ${key} -> ${value}`);
    writeDb(db);

    res.json({ success: true, shifts: db.shifts });
});

// API: Update Config
app.post('/api/config', (req, res) => {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: "Missing key" });

    const db = readDb();
    db.config = db.config || { set: "SET", from: "FROM", config: "CONFIG" };
    db.config[key] = value || "";
    writeDb(db);

    res.json({ success: true, config: db.config });
});

// Catch-all: Serve React App
// Catch-all: Serve React App (Must be last)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
