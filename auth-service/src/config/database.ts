// src/config/database.ts
import mongoose from 'mongoose';

// Use MongoDB Atlas connection string
const dbURI = 'mongodb://127.0.0.1:27017/auth-userdb';

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI); // No options needed for Mongoose 6+
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    }
};

export default connectDB;


