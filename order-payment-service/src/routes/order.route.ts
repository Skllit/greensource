// routes/orders.ts
import { Router } from "express";
import { OrderController } from "../controllers/order.controller";


const router = Router();
const orderController = new OrderController();

// Split a multi-farmer cart into separate orders under the hood
router.post(
  "/",
  
  (req, res) => orderController.createOrder(req, res)
);

// Fetch all orders
router.get(
  "/",
  (req, res) => orderController.getOrders(req, res)
);

// Customer-specific orders
router.get(
  "/:email/customers",
  (req, res) => orderController.getOrdersByCustomerEmail(req, res)
);

// Farmer-specific orders
router.get(
  "/:email/farmers",
  (req, res) => orderController.getOrdersByFarmerEmail(req, res)
);

// Single order by ID
router.get(
  "/:id",
  (req, res) => orderController.getOrder(req, res)
);

// Update an order
router.put(
  "/:id",
  (req, res) => orderController.updateOrder(req, res)
);

// Cancel an order
router.put(
  "/:id/cancel",
  (req, res) => orderController.cancelOrder(req, res)
);

export default router;