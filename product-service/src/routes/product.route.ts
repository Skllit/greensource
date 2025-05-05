import { Router } from "express";
import { ProductController } from "../controllers/product.controller";

const router = Router();
const productController = new ProductController();

// Middleware to set controller for all routes
router.use((req, res, next) => {
  res.locals.controller = productController;
  next();
});

// Product Management
router.get("/", async (req, res, next) => {
  try {
    await res.locals.controller.listProducts(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    await res.locals.controller.getProduct(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    await res.locals.controller.createProduct(req, res);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await res.locals.controller.updateProduct(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await res.locals.controller.deleteProduct(req, res);
  } catch (error) {
    next(error);
  }
});

// Product Images
router.get("/:id/images", async (req, res, next) => {
  try {
    await productController.getProductImages(req, res);
  } catch (error) {
    next(error);
  }
});
router.post(
  "/:id/images",
  productController.addProductImage.bind(productController)
);
router.delete("/:id/images/:imageId", async (req, res, next) => {
  try {
    await productController.deleteProductImage(req, res);
  } catch (error) {
    next(error);
  }
});

// Reviews
router.post(
  "/:id/reviews",
  productController.addReview.bind(productController)
);
router.get(
  "/:id/reviews",
  productController.getProductReviews.bind(productController)
);

// Search & Filter
router.get("/search", productController.searchProducts.bind(productController));
router.get(
  "/categories",
  productController.getCategories.bind(productController)
);

export default router;
