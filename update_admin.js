const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const updateAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const email = "cinoxomultimediapvtltd@gmail.com";
    const password = "Deepak@8044";

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user
    const res = await User.updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );

    console.log("Update result:", res);
    console.log("Password updated successfully to hashed version.");

    mongoose.disconnect();
  } catch (error) {
    console.log(error);
  }
};

updateAdminPassword();