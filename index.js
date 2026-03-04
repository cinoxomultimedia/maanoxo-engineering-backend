const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// ❌ MongoDB temporarily disabled

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully ✅"))
  .catch(err => console.log("DB Error:", err));

  console.log(process.env.MONGO_URI);

// Simple test route
app.get("/", (req, res) => {
  res.send("API Working Without MongoDB 🚀");
});

// Example route (no DB)
app.get("/users", (req, res) => {
  res.json([
    { name: "Deepak", email: "deepak@test.com" },
    { name: "Admin", email: "admin@test.com" }
  ]);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});