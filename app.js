const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require("cors");
require('dotenv').config();

const productRoutes = require('./routes/products');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./routes/contact');
const brandRoutes = require('./routes/brands');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'assets' directory (for seed data)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve static files from the 'uploads' directory for product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/auth', authRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.send('Maanoxo Engineering Backend is running');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
