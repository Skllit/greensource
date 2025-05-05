import { Order } from "../models/order.model";
import { IOrder, OrderStatus } from "../types/order";

export class OrderService {
  async createOrder(orderData: IOrder): Promise<IOrder> {
    try {
      const { ...cleanOrderData } = orderData as any;

      const order = new Order({
        ...cleanOrderData,
        status: OrderStatus.PENDING,
      });

      return await order.save();
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async getOrders(): Promise<IOrder[]> {
    return await Order.find();
  }

  async getOrderById(_id: string): Promise<IOrder | null> {
    return await Order.findById(_id);
  }

  async updateOrder(
    _id: string,
    orderData: Partial<IOrder>
  ): Promise<IOrder | null> {
    return await Order.findOneAndUpdate({ _id }, orderData, {
      new: true,
    });
  }

  async cancelOrder(_id: string): Promise<IOrder | null> {
    return await Order.findOneAndUpdate(
      { _id },
      { status: OrderStatus.CANCELLED, updatedAt: new Date() },
      { new: true }
    );
  }

  async getOrdersByCustomerEmail(email: string): Promise<IOrder[]> {
    return await Order.find({ consumerId: email });
  }

  async getOrdersByFarmerEmail(email: string): Promise<IOrder[]> {
    return await Order.find({ farmerId: email });
  }
}
