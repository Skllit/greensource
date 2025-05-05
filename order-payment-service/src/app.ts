import express from "express";
import mongoose from "mongoose";
import orderRoutes from "./routes/order.route";
// import paymentRoutes from "./routes/payment.route";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3808;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:",
      "http://localhost:3801",
      "http://localhost:3802",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use("/api/orders", orderRoutes);
// app.use("/api/payments", paymentRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: any) => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Order-Payment service is running on port ${PORT}`);
});
