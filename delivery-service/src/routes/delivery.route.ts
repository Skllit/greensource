import express, { Request, Response } from "express";
import deliveryController from "../controller/delivery.controller";

const router = express.Router();

// Delivery Agent Routes
router.post("/agents", async (req: Request, res: Response) => {
  await deliveryController.createDeliveryAgent(req, res);
});
router.get("/agents", async (req: Request, res: Response) => {
  await deliveryController.getDeliveryAgents(req, res);
});
router.get("/agents/:agentId", async (req: Request, res: Response) => {
  await deliveryController.getDeliveryAgentById(req, res);
});
router.get("/agent/email/:email", async (req: Request, res: Response) => {
  await deliveryController.getDeliveryAgentByEmail(req, res);
});

router.get(
  "/agents/:agentId/deliveries",
  async (req: Request, res: Response) => {
    await deliveryController.getAgentDeliveries(req, res);
  }
);
router.get(
  "/agents/:agentId/activeDeliveries",
  async (req: Request, res: Response) => {
    await deliveryController.getAgentActiveDeliveries(req, res);
  }
);
router.get(
  "/agents/:agentId/completedDeliveries",
  async (req: Request, res: Response) => {
    await deliveryController.getAgentCompletedDeliveries(req, res);
  }
);
router.delete("/agents/:agentId", async (req: Request, res: Response) => {
  await deliveryController.deleteDeliveryAgent(req, res);
});
router.put(
  "/agents/:agentId/orderCount/increase",
  async (req: Request, res: Response) => {
    await deliveryController.updateDeliveryAgentOrderCount(req, res);
  }
);
router.put(
  "/add/:deliveryId/agent/:agentId",
  async (req: Request, res: Response) => {
    await deliveryController.addDeliveryAgentIdToDelivery(req, res);
  }
);
router.put("/add/:agentId/delivery/:deliveryId", async (req: Request, res: Response) => {
    await deliveryController.addDeliveryIdToAgent(req, res);
  }
);

// Add this route before other agent routes
router.get("/api/agents/available", async (req: Request, res: Response) => {
  await deliveryController.getAvailableAgents(req, res); 
});

router.put(
  "/agents/:agentId/orderCount/decrease",
  async (req: Request, res: Response) => {
    await deliveryController.decreaseDeliveryAgentOrderCount(req, res);
  }
);

// get delivery details by order id
router.get("/order/:orderId", async (req: Request, res: Response) => {
  await deliveryController.getDeliveryByOrderId(req, res);
});

// Delivery Routes
router.post("/", async (req: Request, res: Response) => {
  await deliveryController.createDelivery(req, res);
});
router.get("/:deliveryId", async (req: Request, res: Response) => {
  await deliveryController.getDeliveryById(req, res);
});
router.put("/:deliveryId/status", async (req: Request, res: Response) => {
  await deliveryController.updateDeliveryStatus(req, res);
});
router.put("/:deliveryId/cancel", async (req: Request, res: Response) => {
  await deliveryController.cancelDelivery(req, res);
});

export default router;
