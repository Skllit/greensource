import mongoose, { Schema, Document } from "mongoose";
import { Customer, Address, CartItem } from "../types/customer";

const AddressSchema = new Schema<Address>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postal_code: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CartItemSchema = new Schema<CartItem>({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const CustomerSchema = new Schema<Customer>(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    cart: [CartItemSchema],
    orders: [{ type: String }],
    addresses: [AddressSchema],
    wishlist: [{ type: String }],
  },
  { timestamps: true }
);

export const CustomerModel = mongoose.model<Customer>(
  "Customer",
  CustomerSchema
);
