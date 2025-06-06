import mongoose from 'mongoose';

const dbURI = process.env.MONGO_URI
  ||'mongodb://127.0.0.1:27017/Farmers';

mongoose
  .connect(dbURI)
  .then(() => console.log("Database connected!"))
  .catch(err => console.error("MongoDB connection error:", err));
