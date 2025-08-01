const mongoose = require("mongoose");
require("dotenv").config();

 exports.connect = async () => {
  try {
      await mongoose.connect(process.env.MONGODB_URL 
      );
      console.log("MongoDB connected successfully");
  } catch (err) {
      console.error("MongoDB connection error:", err);
      process.exit(1);
  }
};




