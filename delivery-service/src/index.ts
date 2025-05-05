import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import deliveryRoutes from "./routes/delivery.route";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3803",
      "http://localhost:3801",
      "http://localhost:3802",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use("/", deliveryRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3800;
app.listen(PORT, () => {
  console.log(`Delivery service is running on port ${PORT}`);
});

export default app;
