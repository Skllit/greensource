import { Request, Response } from "express";
import deliveryService from "../services/delivery.service";
import axios from "axios";

class DeliveryController {
  // Delivery Agent Controllers
  async createDeliveryAgent(req: Request, res: Response) {
    try {
      // Ensure required fields are present
      const { name, email, phoneNumber, idProof, vehicle } = req.body;
      if (!name || !email || !phoneNumber || !idProof || !vehicle) {
        return res.status(400).json({
          error:
            "Name, email, phone number, ID proof and vehicle details are required",
        });
      }

      // Validate ID proof type
      if (!["aadhaar", "pan", "voter"].includes(idProof.type)) {
        return res.status(400).json({
          error: "ID proof type must be either aadhaar, pan or voter",
        });
      }

      // Validate vehicle type
      if (!["bike", "van", "truck"].includes(vehicle.type)) {
        return res.status(400).json({
          error: "Vehicle type must be either bike, van or truck",
        });
      }

      // Initialize serviceLocations as empty array if not provided
      const agentData = {
        ...req.body,
        serviceLocations: req.body.serviceLocations || [],
        orderCount: 0,
        deliveredOrders: [],
        isAvailable: true,
      };

      const agent = await deliveryService.createDeliveryAgent(agentData);
      res.status(201).json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDeliveryAgents(req: Request, res: Response) {
    try {
      const agents = await deliveryService.getDeliveryAgents();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  async getAgentDeliveries(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const deliveries = await deliveryService.getAgentDeliveries(agentId);
      res.json(deliveries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAgentActiveDeliveries(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const deliveries = await deliveryService.getAgentActiveDeliveries(agentId);
      res.json(deliveries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  async getAgentCompletedDeliveries(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const deliveries = await deliveryService.getAgentCompletedDeliveries(agentId);
      res.json(deliveries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delivery Controllers
  async createDelivery(req: Request, res: Response) {
    try {
      const delivery = await deliveryService.createDelivery(req.body);
      res.status(201).json(delivery);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDeliveryAgentByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const agent = await deliveryService.getDeliveryAgentByEmail(email);
      if (!agent) {
        return res.status(404).json({ error: "Delivery agent not found" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDeliveryAgentById(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const agent = await deliveryService.getDeliveryAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Delivery agent not found" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDeliveryByOrderId(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const delivery = await deliveryService.getDeliveryByOrderId(orderId);
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAvailableAgents(req: Request, res: Response) {
    try {
      const agents = await deliveryService.getAvailableAgents();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async decreaseDeliveryAgentOrderCount(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const agent = await deliveryService.decreaseDeliveryAgentOrderCount(
        agentId
      );
      if (!agent) {
        return res.status(404).json({ error: "Delivery agent not found" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addDeliveryAgentIdToDelivery(req: Request, res: Response) {
    try {
      const { deliveryId, agentId } = req.params;
      const delivery = await deliveryService.addDeliveryAgentIdToDelivery(
        deliveryId,
        agentId
      );
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateDeliveryAgentOrderCount(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const agent = await deliveryService.updateDeliveryAgentOrderCount(
        agentId
      );
      if (!agent) {
        return res.status(404).json({ error: "Delivery agent not found" });
      }
      if (agent.orderCount >= 5) {
        return res
          .status(400)
          .json({ error: "Agent has reached maximum order limit" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateDeliveryStatus(req: Request, res: Response) {
    try {
      const { deliveryId } = req.params;
      const { status } = req.body;
      const delivery = await deliveryService.updateDeliveryStatus(
        deliveryId,
        status
      );
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelDelivery(req: Request, res: Response) {
    try {
      const { deliveryId } = req.params;
      const delivery = await deliveryService.cancelDelivery(deliveryId);
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }
      await axios.put(
        `http://localhost:3808/api/orders/${delivery.orderId}/cancel`,
        {
          status: "CANCELLED",
        }
      );
      res.json(delivery);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addDeliveryIdToAgent(req: Request, res: Response) {
    try {
      const { agentId, deliveryId } = req.params;
      const delivery = await deliveryService.addDeliveryIdToAgent(
        agentId,
        deliveryId
      );
      res.json(delivery);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDeliveryById(req: Request, res: Response) {
    try {
      const { deliveryId } = req.params;
      const delivery = await deliveryService.getDeliveryById(deliveryId);
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAvailableAgentsForLocations(req: Request, res: Response) {
    try {
      const serviceLocations = req.query.serviceLocations as string[];

      if (!serviceLocations || !Array.isArray(serviceLocations)) {
        return res.status(400).json({
          error:
            "serviceLocations query parameter is required and must be an array",
        });
      }

      if (serviceLocations.length > 5) {
        return res.status(400).json({
          error: "Maximum 5 service locations allowed",
        });
      }

      const agents = await deliveryService.getAvailableAgentsForLocations(
        serviceLocations
      );
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteDeliveryAgent(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      await deliveryService.deleteDeliveryAgent(agentId);
      res.status(200).json({ message: "Delivery agent deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new DeliveryController();
