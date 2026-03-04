const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const { auth, admin } = require('../middleware/auth');

const aboutFilePath = path.resolve(__dirname, '../models/about.json');

// GET /api/about
router.get('/', async (req, res) => {
    console.log("Received request for /api/about");
    try {
        const data = await fs.readFile(aboutFilePath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ message: 'Error reading about.json.', error: error.message });
    }
});

// 3. Create API to edit about.json
// PUT /api/about
router.put('/', auth, admin, async (req, res) => {
    try {
        await fs.writeFile(aboutFilePath, JSON.stringify(req.body, null, 2), 'utf-8');
        res.json({ message: 'about.json updated successfully.', data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error writing to about.json.', error: error.message });
    }
});

module.exports = router;