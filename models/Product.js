const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  brand: String,
  model: String,
  keywords: String,
  image: String,
  title: String,
  description: String,
  price: Number,
  priceDisplay: String
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;