const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use the port provided by the environment (useful for deployment)
const SEED_FILE = path.join(__dirname, 'seeds.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// Helper functions
async function readSeeds() {
    try {
        const data = await fs.readFile(SEED_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return an empty array
            return [];
        }
        throw error;
    }
}

async function writeSeeds(seeds) {
    await fs.writeFile(SEED_FILE, JSON.stringify(seeds, null, 2));
}

// API routes
app.get('/seeds', async (req, res) => {
    try {
        const seeds = await readSeeds();
        res.json(seeds);
    } catch (error) {
        console.error('Error reading seeds:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/seeds', async (req, res) => {
    try {
        const { name, message } = req.body;
        const newSeed = {
            name,
            message,
            plantedDate: new Date().toISOString()
        };
        const seeds = await readSeeds();
        seeds.push(newSeed);
        await writeSeeds(seeds);
        res.status(201).json(newSeed);
    } catch (error) {
        console.error('Error planting seed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the static HTML file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
