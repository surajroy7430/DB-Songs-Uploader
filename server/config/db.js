const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully!");
    return true;
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    return false;
  }
};

module.exports = connectToDB;
