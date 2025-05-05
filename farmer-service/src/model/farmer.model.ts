import { Schema, Types, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const FarmerSchema = new Schema(
  {
    id: { type: String, default: uuidv4, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    addresses: [{ type: Types.ObjectId, ref: "Address" }],
    list_products: [{ type: Types.ObjectId }],
    list_sales: [
      {
        orderId: { type: String },
        amount: { type: Number },
      },
    ],
    is_verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Farmer", FarmerSchema);
