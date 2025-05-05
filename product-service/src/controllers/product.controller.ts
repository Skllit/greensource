import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import axios from "axios";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  async listProducts(req: Request, res: Response) {
    try {
      const products = await this.productService.listProducts(req.query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  async getProduct(req: Request, res: Response) {
    try {
      const product = await this.productService.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res
          .status(500)
          .json({ error: "Failed to create product", message: error.message });
      } else {
        res.status(500).json({
          error: "Failed to create product",
          message: "An unknown error occurred",
        });
      }
    }
  }
  async updateProduct(req: Request, res: Response) {
    try {
      const product = await this.productService.updateProduct(
        req.params.id,
        req.body
      );
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const product = await this.productService.deleteProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  }

  async getProductImages(req: Request, res: Response) {
    try {
      const images = await this.productService.getProductImages(req.params.id);
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product images" });
    }
  }

  async addProductImage(req: Request, res: Response) {
    try {
      const image = await this.productService.addProductImage(
        req.params.id,
        req.body
      );
      res.status(201).json(image);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  }

  async deleteProductImage(req: Request, res: Response) {
    try {
      const image = await this.productService.deleteProductImage(
        req.params.id,
        req.params.imageId
      );
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete image" });
    }
  }

  async addReview(req: Request, res: Response) {
    try {
      const review = await this.productService.addReview(
        req.params.id,
        req.body
      );
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to add review" });
    }
  }

  async getProductReviews(req: Request, res: Response) {
    try {
      const reviews = await this.productService.getProductReviews(
        req.params.id
      );
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  }

  async searchProducts(req: Request, res: Response) {
    try {
      const products = await this.productService.searchProducts(
        req.query.q as string
      );
      res.json(products);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res
          .status(500)
          .json({ error: "Failed to search products", message: error.message });
      } else {
        res.status(500).json({
          error: "Failed to search products",
          message: "An unknown error occurred",
        });
      }
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await this.productService.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }
}
