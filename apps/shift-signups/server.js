import express from 'express';
import helmet from 'helmet';
import { z } from 'zod'; // Import Zod
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Nginx)
const PORT = 80;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'events.jsonl');
const MAX_DB_SIZE_BYTES = 10 * 1024 * 1024; // 10MB Hard Limit

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure db file exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "");
}

// --- Validation Schemas (Zod) ---
// Slot Format: YYYY-MM-DD-HH (e.g., 2026-01-08-14)
const slotRegex = /^\d{4}-\d{2}-\d{2}-\d{2}$/;

const SignupSchema = z.object({
    key: z.string().regex(slotRegex, "Invalid slot format (YYYY-MM-DD-HH)"),
    value: z.string().max(100, "Name too long").optional(), // Allow empty string to 'unsignup'
});

const ConfigSchema = z.object({
    key: z.enum(['set', 'from', 'config']), // Restrict config keys
    value: z.string().max(200),
});

// --- Helper: Read & Reduce ---
// Reads the append-only log and reconstructs the current state
const getDbState = () => {
    const state = {
        shifts: {},
        config: { set: "SET", from: "FROM", config: "CONFIG" }
    };

    try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');

        lines.forEach(line => {
            try {
                const event = JSON.parse(line);
                if (event.type === 'SHIFT_UPDATE') {
                    // Last write wins logic
                    state.shifts[event.key] = event.value;
                } else if (event.type === 'CONFIG_UPDATE') {
                    state.config[event.key] = event.value;
                }
            } catch (e) {
                console.warn("Skipping corrupt log line", e);
            }
        });
    } catch (err) {
        console.error("Read Error:", err);
    }
    return state;
};

// --- Helper: Append Event ---
const appendEvent = (event) => {
    // 1. Check Size Limit
    const stats = fs.statSync(DB_FILE);
    if (stats.size > MAX_DB_SIZE_BYTES) {
        throw new Error("Storage Quota Exceeded (10MB). Contact Administrator.");
    }

    // 2. Alert Threshold (Soft Limit)
    if (stats.size > (MAX_DB_SIZE_BYTES * 0.8)) {
        console.error(`⚠️ DATA FILE CRITICAL: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    }

    // 3. Append
    const entry = JSON.stringify({ ...event, ts: Date.now() }) + '\n';
    fs.appendFileSync(DB_FILE, entry);
};

// --- API Routes ---

// API: Get Data (Replayed from Log)
app.get('/api/data', (req, res) => {
    const data = getDbState();
    res.json(data);
});

// API: Update Shift
app.post('/api/shift', (req, res) => {
    try {
        // Validate Input
        const payload = SignupSchema.parse(req.body);

        // Append to Log
        appendEvent({
            type: 'SHIFT_UPDATE',
            key: payload.key,
            value: payload.value || "" // Validate sanitized value
        });

        // Return new state
        // Optimization: In a real Event Source system we might return just 'Accepted', 
        // but frontend expects full state or success.
        const newState = getDbState();
        res.json({ success: true, shifts: newState.shifts });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Shift Write Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

// API: Update Config
app.post('/api/config', (req, res) => {
    try {
        const payload = ConfigSchema.parse(req.body);

        appendEvent({
            type: 'CONFIG_UPDATE',
            key: payload.key,
            value: payload.value
        });

        const newState = getDbState();
        res.json({ success: true, config: newState.config });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(500).json({ error: error.message });
    }
});

// Catch-all: Serve React App
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Storage: ${DB_FILE}`);
});
