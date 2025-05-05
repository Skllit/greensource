import { Router } from "express";
import {
  getOrders,
  createFarmer,
  getFarmers,
  getFarmer,
  updateFarmer,
  deleteFarmer,
  addFarmerAddress,
  updateFarmerName,
  updateFarmerPhone,
  updateFarmerAddress,
  updateFarmerEmail,
  updateFarmerVerifiedStatus,
  addProduct,
  getProducts,
  loginFarmer,
  deleteProduct,
  addOrder,
  getEarnings,
  deleteFarmerAddress,
  getFarmerAddress,
} from "../controllers/farmer.controller";
import {
  createAddress,
  deleteAddress,
  getAddress,
  getAddresses,
  updateAddress,
} from "../controllers/address.controller";

const router = Router();
router.post("/farmers", createFarmer);
router.put("/farmers/:email/addAddress", addFarmerAddress);
router.get("/farmers/:email/get/address", getFarmerAddress);
router.get("/farmers", getFarmers);
router.get("/farmers/:email", getFarmer);
router.put("/farmers/:email", updateFarmer);
router.put("/farmers/:email/update/name", updateFarmerName);
router.put("/farmers/:email/update/phone", updateFarmerPhone);
router.put("/farmers/update/Address/:email", updateFarmerAddress);
router.put("/farmers/:email/update/email", updateFarmerEmail);
router.put("/farmers/:email/update/is_verified", updateFarmerVerifiedStatus);
router.post("/farmers/:email/add/product/", addProduct);
router.delete("/farmers/:email/delete/product/:productId", deleteProduct);
router.delete("/farmers/:email/delete/address/:addressId", deleteFarmerAddress);
router.get("/farmers/:email/get/earnings", getEarnings);
router.get("/farmers/:email/get/products", getProducts);
router.get("/farmers/:email/get/orders", getOrders);
router.post("/farmers/:email/add/order", addOrder);
router.delete("/farmers/:email", deleteFarmer);
router.post("/address", createAddress);
router.get("/address", getAddresses);
router.get("/address/:id", getAddress);
router.put("/address/:id", updateAddress);
router.post("/login", loginFarmer);
router.delete("/address/:id", deleteAddress);

export default router;
