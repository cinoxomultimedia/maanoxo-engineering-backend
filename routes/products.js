const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;
const { auth, admin } = require('../middleware/auth');

// GET /api/products - Read all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        
        // Generate full URLs for images
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithUrls = products.map(product => {
            const productObj = product.toObject();
            if (productObj.image && !productObj.image.startsWith('http')) {
                // Ensure path starts with /
                const imagePath = productObj.image.startsWith('/') ? productObj.image : `/${productObj.image}`;
                productObj.image = `${baseUrl}${imagePath}`;
            }
            return productObj;
        });

        res.json(productsWithUrls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/products/:id - Read single product details
router.get('/:id', async (req, res) => {
     console.log("Received request for get /api/products/:id");
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productObj = product.toObject();
        if (productObj.image && !productObj.image.startsWith('http')) {
            const imagePath = productObj.image.startsWith('/') ? productObj.image : `/${productObj.image}`;
            productObj.image = `${baseUrl}${imagePath}`;
        }
        res.json(productObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 1. Create API to add products
// POST /api/products
router.post('/', auth, admin, upload.single('image'), async (req, res) => {
     console.log("Received request for POST /api/products");
    try {
        // req.file is the 'image' file
        // req.body will hold the text fields
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }

        const { brand, model, keywords, title, description, price, priceDisplay } = req.body;

        const newProduct = new Product({
            brand,
            model,
            keywords,
            title,
            description,
            price,
            priceDisplay,
            // Construct the URL to the uploaded image
            image: req.file.path
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 3. Update a product by ID
// PUT /api/products/:id
router.put('/:id', auth, admin, upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updateData = { ...req.body };

        // If a new image is uploaded, handle file replacement
        if (req.file) {
            // If there was an old image on Cloudinary, delete it
            if (product.image && product.image.includes('cloudinary')) {
                try {
                    // Extract the public_id from the old image URL
                    const oldPublicId = product.image.match(/upload\/(?:v\d+\/)?(.+?)\.\w+$/)[1];
                    await cloudinary.uploader.destroy(oldPublicId);
                } catch (error) {
                    console.error("Error deleting old image from Cloudinary:", error);
                    // Don't block the update if old image deletion fails
                }
            }

            // Set the new image path
            updateData.image = req.file.path;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 4. Delete a product by ID
// DELETE /api/products/:id
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // If the product has an image on Cloudinary, delete it.
        if (product.image) {
            try {
                // Extract the public_id from the image URL using a regular expression
                const publicId = product.image.match(/upload\/(?:v\d+\/)?(.+?)\.\w+$/)[1];
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            } catch (error) {
                console.error("Error deleting image from Cloudinary:", error);
                // We don't want to block product deletion if image deletion fails, so we just log the error.
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Create API to edit brands
// PATCH /api/products/brand
// Body: { "from": "oldBrandName", "to": "newBrandName" }
router.patch('/brand', auth, admin, async (req, res) => {
    const { from, to } = req.body;
    if (!from || !to) {
        return res.status(400).json({ message: 'Request body must include "from" and "to" brand names.' });
    }

    try {
        const result = await Product.updateMany({ brand: from }, { $set: { brand: to } });
        res.json({ message: `Successfully updated ${result.modifiedCount} of ${result.matchedCount} products from brand "${from}" to "${to}".`, result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;