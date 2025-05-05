import mongoose, { Schema } from "mongoose";

export interface IDeliveryAgent {
  name: string;
  email: string;
  phoneNumber: string;
  orderCount: number;
  serviceLocations: string[]; // Array of city names
  deliveredOrders: string[]; // Array of order IDs
  isAvailable: boolean;
  idProof: {
    type: "aadhaar" | "pan" | "voter";
    value: string;
  };
  vehicle: {
    type: "bike" | "van" | "truck";
    model: string;
    registrationId: string;
  };
}

const DeliveryAgentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    orderCount: {
      type: Number,
      default: 0,
      max: 5,
    },
    serviceLocations: {
      type: [String],
      default: [],
      validate: [
        (val: string[]) => val && val.length <= 5,
        "Maximum 5 service locations allowed",
      ],
    },
    deliveredOrders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Delivery",
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    idProof: {
      type: {
        type: String,
        required: true,
        enum: ["aadhaar", "pan", "voter"],
      },
      value: {
        type: String,
        required: true,
      },
    },
    vehicle: {
      type: {
        type: String,
        required: true,
        enum: ["bike", "van", "truck"],
      },
      model: {
        type: String,
        required: true,
      },
      registrationId: {
        type: String,
        required: true,
        unique: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDeliveryAgent>(
  "DeliveryAgent",
  DeliveryAgentSchema
);
