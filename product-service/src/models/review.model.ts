import mongoose, { Schema } from 'mongoose';
import { IReview } from '../types/product.types';

const reviewSchema = new Schema<IReview>({
  productId: { type: String, required: true },
  userId: { type: String, required: true },
  orderId: { type: String, required: true },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  comment: { type: String, required: true },
}, { timestamps: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema);