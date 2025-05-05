import mongoose, { Schema } from 'mongoose';
import { IProduct, ProductCategory } from '../types/product.types';

const productSchema = new Schema<IProduct>({
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  quantityAvailable: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { 
    type: String, 
    enum: Object.values(ProductCategory),
    required: true 
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Product = mongoose.model<IProduct>('Product', productSchema);