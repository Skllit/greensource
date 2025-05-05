import { Schema, model } from "mongoose";
import { IOrder, OrderStatus } from "../types/order";

// First, check and clean up any existing problematic indexes
// const cleanupIndexes = async () => {
//   try {
//     const Order = model("Order");
//     await Order.collection.dropIndex("id_1");
//   } catch (error) {
//     // Index might not exist, which is fine
//   }
// };

// cleanupIndexes().catch(console.error);

const orderSchema = new Schema<IOrder>({
  consumerId: { type: String, required: true },
  farmerId: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  },
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postal_code: String,
    country: String,
  },
  items: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Order = model<IOrder>("Order", orderSchema);
