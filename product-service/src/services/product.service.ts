import { Product } from "../models/product.model";
import { ProductImage } from "../models/product-image.model";
import { Review } from "../models/review.model";
import { IProduct, IProductImage, IReview } from "../types/product.types";

export class ProductService {
  async listProducts(query: any = {}) {
    return Product.find({ isActive: true, ...query });
  }

  async getProduct(id: string) {
    return Product.findById(id);
  }

  async createProduct(productData: Partial<IProduct>) {
    const product = new Product(productData);
    return product.save();
  }

  async updateProduct(id: string, productData: Partial<IProduct>) {
    return Product.findByIdAndUpdate(id, productData, { new: true });
  }

  async deleteProduct(id: string) {
    return Product.deleteOne({ _id: id });
  }

  async getProductImages(productId: string) {
    return ProductImage.findOne({ productId: productId });
  }

  async addProductImage(productId: string, imageData: Partial<IProductImage>) {
    const image = new ProductImage({ ...imageData, productId });
    return image.save();
  }

  async deleteProductImage(productId: string, imageId: string) {
    return ProductImage.deleteOne({ _id: imageId, productId });
  }

  async addReview(productId: string, reviewData: Partial<IReview>) {
    const review = new Review({ ...reviewData, productId });
    return review.save();
  }

  async getProductReviews(productId: string) {
    return Review.find({ productId });
  }

  async searchProducts(query: string) {
    return Product.find({
      isActive: true,
      $and: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
  }

  async getCategories() {
    return Product.distinct("category");
  }
}
