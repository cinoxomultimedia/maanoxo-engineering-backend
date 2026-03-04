const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const { auth, admin } = require('../middleware/auth');

const contactFilePath = path.resolve(__dirname, '../models/contacts.json');

// GET /api/contact
router.get('/', async (req, res) => {
    console.log("Received request for get /api/contact");
    try {
        const data = await fs.readFile(contactFilePath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ message: 'Error reading contact.json.', error: error.message });
    }
});

// 4. Create API to edit contact.json
// PUT /api/contact
router.put('/', auth, admin, async (req, res) => {
    try {
        await fs.writeFile(contactFilePath, JSON.stringify(req.body, null, 2), 'utf-8');
        res.json({ message: 'contact.json updated successfully.', data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error writing to contact.json.', error: error.message });
    }
});

module.exports = router;