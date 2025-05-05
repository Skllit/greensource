import mongoose, { Schema } from "mongoose";

export interface IDelivery {
  orderId: string;
  farmerId: string;
  consumerId: string;
  farmerPhoneNumber: string;
  consumerPhoneNumber: string;
  deliveryAgentId?: string;
  orderPrice: number;
  deliveryAddress: string;
  pickupAddress: string;
  status: "CONFIRMED" | "CANCELLED" | "DELIVERED" | "ONTHEWAY";
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    farmerId: {
      type: String,
      required: true,
    },
    consumerId: {
      type: String,
      required: true,
    },
    farmerPhoneNumber: {
      type: String,
      required: true,
    },
    consumerPhoneNumber: {
      type: String,
      required: true,
    },
    deliveryAgentId: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryAgent",
    },
    orderPrice: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED", "DELIVERED", "ONTHEWAY"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDelivery>("Delivery", DeliverySchema);
