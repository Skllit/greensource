import Delivery, { IDelivery } from "../models/delivery.model";
import DeliveryAgent, { IDeliveryAgent } from "../models/deliveryAgent.model";
import mongoose from "mongoose";

class DeliveryService {
  // Delivery Agent Management
  async createDeliveryAgent(
    agentData: IDeliveryAgent
  ): Promise<IDeliveryAgent> {
    // Ensure serviceLocations is an array
    const serviceLocations = agentData.serviceLocations || [];

    // Validate service locations (max 5)
    if (serviceLocations.length > 5) {
      throw new Error("Maximum 5 service locations allowed per agent");
    }

    // Create new agent with validated data
    const newAgent = new DeliveryAgent({
      ...agentData,
      serviceLocations,
    });

    return await newAgent.save();
  }

  async updateDeliveryAgent(
    agentId: string,
    updateData: Partial<IDeliveryAgent>
  ): Promise<IDeliveryAgent | null> {
    // Ensure serviceLocations is an array if it's being updated
    if (updateData.serviceLocations) {
      if (updateData.serviceLocations.length > 5) {
        throw new Error("Maximum 5 service locations allowed per agent");
      }
    }

    return await DeliveryAgent.findByIdAndUpdate(agentId, updateData, {
      new: true,
    });
  }

  // Delivery Management
  async createDelivery(deliveryData: {
    orderId: string;
    farmerId: string;
    customerId: string;
    deliveryAgentId: string;
    pickupLocation: { address: string };
    deliveryLocation: { address: string };
  }): Promise<IDelivery> {
    try {
      
     
  
      const delivery = new Delivery({
        ...deliveryData,
        status: "CONFIRMED",
      });
      console.log('data ready to save = ',delivery);
      const savedDelivery = await delivery.save();
      return savedDelivery;
    } catch (error) {
      console.error('Delivery creation failed:', error);
      // Make sure to rethrow the error or return a rejected promise
      throw error; // This ensures we maintain the Promise<IDelivery> return type
    }
  }

  async updateDeliveryStatus(
    deliveryId: string,
    status: IDelivery["status"]
  ): Promise<IDelivery | null> {
    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      { status },
      { new: true }
    );

    if (delivery && status === "DELIVERED") {
      // Make agent available again
      await DeliveryAgent.findByIdAndUpdate(delivery.deliveryAgentId, {
        isAvailable: true,
      });
    }

    return delivery;
  }

  async getAvailableAgents(): Promise<IDeliveryAgent[]> {
    return DeliveryAgent.find({ orderCount: { $eq: 0 }, isAvailable: true });
  }

  async updateDeliveryAgentOrderCount(
    agentId: string
  ): Promise<IDeliveryAgent | null> {
    return await DeliveryAgent.findByIdAndUpdate(
      agentId,
      { $inc: { orderCount: 1 }, isAvailable: false },
      { new: true }
    );
  }

  async addDeliveryIdToAgent(
    agentId: string,
    deliveryId: string
  ): Promise<IDeliveryAgent | null> {
    return await DeliveryAgent.findByIdAndUpdate(
      agentId,
      { $push: { deliveredOrders: deliveryId } },
      { new: true }
    );
  }

  async decreaseDeliveryAgentOrderCount(
    agentId: string
  ): Promise<IDeliveryAgent | null> {
    return await DeliveryAgent.findByIdAndUpdate(
      agentId,
      { $inc: { orderCount: -1 }, isAvailable: true },
      { new: true }
    );
  }

  async addDeliveryAgentIdToDelivery(
    deliveryId: string,
    agentId: string
  ): Promise<IDelivery | null> {
    return await Delivery.findByIdAndUpdate(
      deliveryId,
      { deliveryAgentId: agentId, isAvailable: false },
      { new: true }
    );
  }

  async getDeliveryAgentByEmail(email: string): Promise<IDeliveryAgent | null> {
    return DeliveryAgent.findOne({ email: email });
  }

  async cancelDelivery(deliveryId: string): Promise<IDelivery | null> {
    return Delivery.findByIdAndUpdate(
      deliveryId,
      { status: "CANCELLED" },
      { new: true }
    );
  }

  async getAvailableAgentsForLocations(
    serviceLocations: string[]
  ): Promise<IDeliveryAgent[]> {
    return DeliveryAgent.find({ serviceLocations: { $in: serviceLocations } });
  }
  async getAgentDeliveries(agentId: string): Promise<IDelivery[]> {
    return Delivery.find({
      deliveryAgentId: agentId,
    });
  }

  async getAgentActiveDeliveries(agentId: string): Promise<IDelivery[]> {
    return Delivery.find({
      deliveryAgentId: agentId,
      status: { $ne: 'DELIVERED' }
    });
  }
  async getAgentCompletedDeliveries(agentId: string): Promise<IDelivery[]> {
    return Delivery.find({
      deliveryAgentId: agentId,
      status: { $eq: 'DELIVERED' }
    });
  }
  

  async getDeliveryAgentById(agentId: string): Promise<IDeliveryAgent | null> {
    return DeliveryAgent.findById(agentId);
  }

  async getDeliveryById(deliveryId: string): Promise<IDelivery | null> {
    return Delivery.findById(deliveryId);
  }

  async getDeliveryAgents(): Promise<IDeliveryAgent[]> {
    return DeliveryAgent.find();
  }

  async deleteDeliveryAgent(agentId: string): Promise<void> {
    await DeliveryAgent.findByIdAndDelete(agentId);
  }

  async getAgentOrders(agentId: string): Promise<IDelivery[]> {
    return Delivery.find({ agentId: agentId });
  }

  async verifyDeliveryAgent(agentId: string): Promise<void> {
    await DeliveryAgent.findByIdAndUpdate(agentId, { isVerified: true });
  }

  async getDeliveryByOrderId(orderId: string): Promise<IDelivery | null> {
    return Delivery.findOne({ orderId: orderId });
  }
}

export default new DeliveryService();
