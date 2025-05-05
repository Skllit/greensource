import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import axios from "axios";
import { IOrder, IShippingAddress } from "../types/order";

interface IOrderWithId extends IOrder {
  _id: string;
}

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      // Create the order
      const order = (await this.orderService.createOrder(
        req.body
      )) as IOrderWithId;

      try {
        // Update farmer's orders
        await axios.post(
          `http://localhost:3805/api/farmers/${order.farmerId}/add/order`,
          {
            orderId: order._id,
            amount: order.totalAmount,
          }
        );

        // Update consumer's orders
        await axios.post(
          `http://localhost:3806/api/customers/${order.consumerId}/orders`,
          { orderId: order._id }
        );

        
        res.status(201).json(order);
      } catch (error) {
        // If any of the subsequent operations fail, cancel the order
        await this.orderService.cancelOrder(order._id);
        throw new Error(
          error instanceof Error ? error.message : "Failed to process order"
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Unknown error occurred" });
      }
    }
  }

  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.orderService.getOrders();
      res.json(orders);
    } catch (error: unknown) {
      if (error instanceof Error)
        res.status(400).json({ error: error.message });
      else res.status(500).json({ error: "unknown error occured" });
    }
  }

  async getOrdersByCustomerEmail(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.orderService.getOrdersByCustomerEmail(
        req.params.email
      );
      res.status(200).json(orders);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "unknown error occurred" });
      }
    }
  }

  async getOrdersByFarmerEmail(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.orderService.getOrdersByFarmerEmail(
        req.params.email
      );
      res.status(200).json(orders);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "unknown error occurred" });
      }
    }
  }

  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const order = await this.orderService.updateOrder(
        req.params.id,
        req.body
      );
      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      res.json(order);
    } catch (error: unknown) {
      if (error instanceof Error) res.json({ error: error.message });
      else res.status(500).json({ error: "unknown error occured" });
    }
  }

  async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      res.status(200).json(order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "unknown error occurred" });
      }
    }
  }

  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const order = await this.orderService.cancelOrder(req.params.id);
      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      if (error instanceof Error)
        res.status(400).json({ error: error.message });
      else res.status(500).json({ error: "unknown error occured" });
    }
  }
}
