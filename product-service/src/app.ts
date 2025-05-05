import express from "express";
import mongoose from "mongoose";
import productRoutes from "./routes/product.route";
import connectDB from "./utils/db";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:", "http://localhost:3801","http://localhost:3802"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })  
  
);

// Routes
app.use("/", productRoutes);

// MongoDB connection
// mongoose.connect('mongodb://localhost:27017/farm-products')
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));
connectDB();

// Start server
const PORT = process.env.PORT || 3802;
app.listen(PORT, () => {
  console.log(`Product service is running on port ${PORT}`);
});

export default app;
