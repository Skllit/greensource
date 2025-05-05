// src/gateway.ts
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  authenticateConsumer,
  authenticateFarmer,
  authenticateMultipleRoles,
} from "./middleware/authenticate";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3801", // 3801
      "http://localhost:3802", // 3802
      "http://localhost:3803", // 3803
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
//Auth Service Proxy
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:3804", // 3804
    changeOrigin: true,
  })
);

// Farmer Service Proxy (protected)
app.use(
  "/api/farmers",
  authenticateMultipleRoles(["admin", "farmer", "consumer", "delivery_agent"]),
  createProxyMiddleware({
    target: "http://localhost:3805", // 3805
    changeOrigin: true,
  })
);

app.use(
  "/api/customers",
  authenticateMultipleRoles(["admin", "farmer", "consumer", "delivery_agent"]),
  createProxyMiddleware({
    target: "http://localhost:3806", // 3806
    changeOrigin: true,
  })
);

app.use(
  "/api/products",
  authenticateMultipleRoles(["admin", "farmer", "consumer", "delivery_agent"]),
  createProxyMiddleware({
    target: "http://localhost:3807", // 3807
    changeOrigin: true,
  })
);

app.use(
  "/api/orders",
  authenticateMultipleRoles(["admin", "farmer", "consumer", "delivery_agent"]),
  createProxyMiddleware({
    target: "http://localhost:3808", // 3808
    changeOrigin: true,
  })
);

app.use(
  "/api/delivery",
  authenticateMultipleRoles(["admin", "farmer", "consumer", "delivery_agent"]),
  createProxyMiddleware({
    target: "http://localhost:3809", // 3809
    changeOrigin: true,
  })
);

app.listen(3800, () => { // 3800
  console.log("API Gateway running on port 3800"); // 3800
});
