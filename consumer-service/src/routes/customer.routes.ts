import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";

const router = Router();
const customerController = new CustomerController();

router.post("/", customerController.addCustomer);
router.get("/", customerController.getAllCustomers);
router.get("/:email", customerController.getCustomerProfile);
router.post("/login", customerController.loginCustomer);
router.put("/:email", customerController.updateCustomerProfile);
router.delete("/:email", customerController.deleteCustomerProfile);

// Order routes
router.post("/:email/orders", customerController.addOrder);
router.get("/:email/orders", customerController.getOrders);
router.post("/:email/orders/:orderId/cancel", customerController.cancelOrder);

// Cart routes
router.get("/:email/cart", customerController.getCart);
router.post("/:email/cart", customerController.addToCart);
router.delete("/:email/cart", customerController.removeFromCart);
router.put("/:email/cart/:productId", customerController.updateCart);
router.delete(
  "/:email/cart/:productId",
  customerController.removeProductFromCart
);

// Address routes
router.get("/:email/addresses", customerController.getAddresses);
router.post("/:email/addresses", customerController.addAddress);
router.put("/:email/addresses/:addressId", customerController.updateAddress);
router.delete("/:email/addresses/:addressId", customerController.deleteAddress);

// Wishlist routes without authentication
router.get("/:email/wishlist", customerController.getWishlist);
router.post("/:email/wishlist", customerController.addToWishlist);
router.delete(
  "/:email/wishlist/:productId",
  customerController.removeFromWishlist
);

export default router;
