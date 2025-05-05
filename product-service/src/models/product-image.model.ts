import mongoose, { Schema } from 'mongoose';
import { IProductImage } from '../types/product.types';

const productImageSchema = new Schema<IProductImage>({
  productId: { type: String, required: true },
  imageUrl: { type: String, required: true },
  displayOrder: { type: Number, required: true },
});

export const ProductImage = mongoose.model<IProductImage>('ProductImage', productImageSchema);