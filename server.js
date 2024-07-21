const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;
const SEED_FILE = path.join(__dirname, 'seeds.json');

app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});