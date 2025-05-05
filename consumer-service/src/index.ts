import express from "express";
// import 'config/dotenv'
import { connectDatabase } from "./config/database";
import customerRoutes from "./routes/customer.routes";
// import { errorHandler } from "./middleware/error.middleware";
import cors from "cors";

// Load environment variables

// Create Express app
const app = express();

// Connect to database
connectDatabase();

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
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/customers", customerRoutes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error handling middleware (should be last)
// app.use(errorHandler);
// Start server
const PORT = process.env.PORT || 3801;
app.listen(PORT, () => {
  console.log(`Customer service running on port ${PORT}`);
});

export default app;
