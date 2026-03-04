const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');
const fs = require('fs/promises');
const path = require('path');

const brandsFilePath = path.resolve(__dirname, '../models/brands.json');

// GET /api/brands - Get all brands from brands.json
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(brandsFilePath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/brands - Add a new brand
router.post('/', auth, admin, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Brand name is required' });

    try {
        const data = await fs.readFile(brandsFilePath, 'utf-8');
        const brands = JSON.parse(data);
        if (brands.some(b => b.name === name)) return res.status(400).json({ message: 'Brand already exists' });
        
        brands.push({ name });
        await fs.writeFile(brandsFilePath, JSON.stringify(brands, null, 2), 'utf-8');
        res.status(201).json({ message: 'Brand added', brand: { name } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/brands/:name - Update a brand name across all products
router.put('/:name', auth, admin, async (req, res) => {
    const { name: newName } = req.body;
    const oldName = req.params.name;

    if (!newName) {
        return res.status(400).json({ message: 'Request body must include a "name" property for the new brand name.' });
    }

    try {
        // Update JSON file
        const data = await fs.readFile(brandsFilePath, 'utf-8');
        const brands = JSON.parse(data);
        const brandIndex = brands.findIndex(b => b.name === oldName);
        if (brandIndex !== -1) {
            brands[brandIndex].name = newName;
            await fs.writeFile(brandsFilePath, JSON.stringify(brands, null, 2), 'utf-8');
        }

        const result = await Product.updateMany({ brand: oldName }, { $set: { brand: newName } });
        res.json({ message: `Successfully updated ${result.modifiedCount} of ${result.matchedCount} products from brand "${oldName}" to "${newName}".`, result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/brands/:name - Delete a brand
router.delete('/:name', auth, admin, async (req, res) => {
    const { name } = req.params;
    try {
        const data = await fs.readFile(brandsFilePath, 'utf-8');
        let brands = JSON.parse(data);
        const newBrands = brands.filter(b => b.name !== name);
        if (brands.length === newBrands.length) return res.status(404).json({ message: 'Brand not found' });

        await fs.writeFile(brandsFilePath, JSON.stringify(newBrands, null, 2), 'utf-8');
        res.json({ message: 'Brand deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;