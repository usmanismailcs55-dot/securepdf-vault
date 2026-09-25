require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const mongoose = require("mongoose");
const User = require("./models/User");

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    const email = "lockout-test@example.com";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Test user already exists.");
      await mongoose.disconnect();
      process.exit(0);
    }

    await User.create({
      name: "Lockout Test User",
      email,
      password: "CorrectPassword123",
      isEmailVerified: true,
      accountStatus: "active",
    });

    console.log("Test user created successfully.");
    console.log(`Email: ${email}`);
    console.log("Password: CorrectPassword123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to create test user:", error.message);
    process.exit(1);
  }
};

createTestUser();