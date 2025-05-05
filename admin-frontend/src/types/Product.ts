export enum ProductCategory {
  VEGETABLES = "VEGETABLES",
  FRUITS = "FRUITS",
  DAIRY = "DAIRY",
  MEAT = "MEAT",
  GRAINS = "GRAINS",
}

export interface IProduct {
  _id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  quantityAvailable: number;
  unit: string;
  category: ProductCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductImage {
  _id: string;
  productId: string;
  imageUrl: string;
  displayOrder: number;
}

export interface IReview {
  _id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
