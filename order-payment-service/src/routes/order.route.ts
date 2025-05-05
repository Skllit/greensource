import { Router } from "express";
import { OrderController } from "../controllers/order.controller";

const router = Router();
const orderController = new OrderController();

router.post("/", (req, res) => orderController.createOrder(req, res));
router.get("/", (req, res) => orderController.getOrders(req, res));
router.get("/:email/customers", (req, res) =>
  orderController.getOrdersByCustomerEmail(req, res)
);
router.get("/:email/farmers", (req, res) =>
  orderController.getOrdersByFarmerEmail(req, res)
);
router.get("/:id", (req, res) => orderController.getOrder(req, res));
router.put("/:id", (req, res) => orderController.updateOrder(req, res));
router.put("/:id/cancel", (req, res) => orderController.cancelOrder(req, res));

export default router;
