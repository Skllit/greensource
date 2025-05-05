import { Request, Response } from "express";
import Farmer from "../model/farmer.model";
import Address from "../model/address.model";
import axios from "axios";

// Create a new Farmer
export const createFarmer = async (req: Request, res: Response) => {
  try {
    // Step 1: Create addresses
    const addressData = req.body.addresses; // Assuming addresses data is in req.body.addresses
    const addressDocs = await Address.insertMany(addressData);
    const addressIds = addressDocs.map((address) => address._id); // Get address IDs
    // Step 2: Create Farmer with address IDs
    const farmerData = {
      ...req.body,
      addresses: addressIds, // Associate address IDs with the Farmer
    };
    const farmer = new Farmer(farmerData);
    await farmer.save();
    res.status(201).json(farmer);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating Farmer:", error.message); // Log the error message
      res
        .status(500)
        .json({ message: "Error creating Farmer", error: error.message });
    } else {
      // Fallback if error is not of type Error
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

// Get all Farmers
export const getFarmers = async (req: Request, res: Response) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
    //console.log("Farmer details fetched successfully");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching Farmer:", error.message); // Log the error message
      res
        .status(500)
        .json({ message: "Error fetching Farmer", error: error.message });
    } else {
      // Fallback if error is not of type Error
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

// Get a single Farmer
export const getFarmer = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.findOne({ email: req.params.email });
    res.json(farmer);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching Farmer:", error.message); // Log the error message
      res
        .status(500)
        .json({ message: "Error fetching Farmer", error: error.message });
    } else {
      // Fallback if error is not of type Error
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

// get farmer address by email
export const getFarmerAddress = async (req: Request, res: Response) => {
  const farmer = await Farmer.findOne({ email: req.params.email });
  const addresses = await Address.find({ _id: { $in: farmer?.addresses } });
  res.json(addresses);
};

// Update a Farmer
export const updateFarmer = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true }
    );
    res.json(farmer);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating Farmer:", error.message); // Log the error message
      res
        .status(500)
        .json({ message: "Error updating Farmer", error: error.message });
    } else {
      // Fallback if error is not of type Error
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

// Delete a Farmer
export const deleteFarmer = async (req: Request, res: Response) => {
  try {
    await Farmer.findOneAndDelete({ email: req.params.email });
    res.json({ message: "Farmer deleted" });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting Farmer:", error.message); // Log the error message
      res
        .status(500)
        .json({ message: "Error deleting Farmer", error: error.message });
    } else {
      // Fallback if error is not of type Error
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

// Add Product - communicates with product service
export const addProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body; // Get product data from request body
    const farmerId = req.params.email; // Get farmer ID from request parameters
    // Include the farmer ID in the product data

    const farmer = await Farmer.findOne({ email: farmerId });

    const farmerName = farmer
      ? `${farmer.first_name} ${farmer.last_name}`
      : null;

    productData.farmerId = farmerId;
    productData.farmerName = farmerName;

    // Send POST request to product service
    const response = await axios.post("http://localhost:3807/", productData);

    // Update the Farmer's list_products with the new product ID
    const productId = response.data._id; // Assuming the product ID is returned in the response
    await Farmer.findOneAndUpdate(
      { email: farmerId },
      { $push: { list_products: productId } }
    );
    res.status(201).json(response.data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error communicating with product service:", error.message);
      res.status(500).json({
        message: "Error communicating with product service",
        error: error.message,
      });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    // Get Farmer ID from request parameters
    // Find the farmer and retrieve their product IDs
    const farmer = await Farmer.findOne({ email: req.params.email });
    if (!farmer) {
      res.status(404).json({ message: "Farmer not found" });
      return;
    }
    const productIds = farmer.list_products; // Assuming this contains the product IDs
    const products = [];
    // Fetch products one by one
    for (const productId of productIds) {
      const response = await axios.get(`http://localhost:3807/${productId}`);
      products.push(response.data); // Collect product data
    }
    res.json(products); // Return the fetched product data
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error: error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { email, productId } = req.params;

    // Send DELETE request to product service
    await axios.delete(`http://localhost:3807/${productId}`);

    // Remove product ID from the farmer's list_products
    await Farmer.findOneAndUpdate(
      { email: email },
      { $pull: { list_products: productId } }
    );

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error communicating with product service:", error.message);
      res.status(500).json({
        message: "Error communicating with product service",
        error: error.message,
      });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

export const addFarmerAddress = async (req: Request, res: Response) => {
  try {
    const id = req.params.email; // Get Farmer ID from request parameters
    const addressData = req.body; // Get address data from request body

    // Create a new address
    const newAddress = new Address(addressData);
    await newAddress.save(); // Save the address to the database

    // Update the Farmer to include the new address ID
    await Farmer.findOneAndUpdate(
      { email: id },
      { $push: { addresses: newAddress._id } },
      { new: true }
    );

    res.status(201).json(newAddress); // Respond with the created address
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error adding Farmer address:", error.message);
      res
        .status(500)
        .json({ message: "Error adding Farmer address", error: error.message });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

// Delete a farmer's address
export const deleteFarmerAddress = async (req: Request, res: Response) => {
  try {
    const { email, addressId } = req.params;

    // Remove address ID from farmer's addresses array
    await Farmer.findOneAndUpdate(
      { email: email },
      { $pull: { addresses: addressId } }
    );

    // Delete the address from Address collection
    await Address.findByIdAndDelete(addressId);

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting farmer address:", error.message);
      res.status(500).json({
        message: "Error deleting farmer address",
        error: error.message,
      });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

// Update Farmer name
export const updateFarmerName = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.findOneAndUpdate(
      { email: req.params.email },
      { first_name: req.body.firstName, last_name: req.body.lastName },
      { new: true }
    );
    if (!farmer) {
      res.status(404).json({ message: "Farmer not found" });
    }
    res.json(Farmer);
  } catch (error) {
    console.error("Error updating Farmer name:", error);
    res.status(500).json({
      message: "Error updating Farmer name",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

export const getEarnings = async (req: Request, res: Response) => {
  const response = await axios.get(
    `http://localhost:3808/api/orders/${req.params.email}/farmers`
  );
  try {
    const orders = response.data;
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const earnings = {
      today: 0,
      week: 0,
      month: 0,
      allTime: 0,
    };

    orders.forEach((order: any) => {
      // Only calculate earnings for delivered orders
      if (order.status === "DELIVERED") {
        const orderDate = new Date(order.createdAt);
        const amount = order.totalAmount;

        // Add to all time earnings
        earnings.allTime += amount;

        // Check if order is from today
        if (orderDate >= startOfToday) {
          earnings.today += amount;
        }

        // Check if order is from this week
        if (orderDate >= startOfWeek) {
          earnings.week += amount;
        }

        // Check if order is from this month
        if (orderDate >= startOfMonth) {
          earnings.month += amount;
        }
      }
    });

    res.json(earnings);
  } catch (error) {
    console.error("Error calculating earnings:", error);
    res.status(500).json({
      message: "Error calculating earnings",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

// Update Farmer phone
export const updateFarmerPhone = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.findOneAndUpdate(
      { email: req.params.email },
      { phone: req.body.phone },
      { new: true }
    );
    if (!farmer) {
      res.status(404).json({ message: "Farmer not found" });
    }
    res.json(Farmer);
  } catch (error) {
    console.error("Error updating Farmer phone:", error);
    res.status(500).json({
      message: "Error updating Farmer phone",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

// Update Farmer email
export const updateFarmerEmail = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.findOneAndUpdate(
      { email: req.params.email },
      { email: req.body.email },
      { new: true }
    );
    if (!farmer) {
      res.status(404).json({ message: "Farmer not found" });
    }
    res.json(Farmer);
  } catch (error) {
    console.error("Error updating Farmer email:", error);
    res.status(500).json({
      message: "Error updating Farmer email",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

// Update Farmer address by ID
export const updateFarmerAddress = async (req: Request, res: Response) => {
  try {
    const updatedAddress = await Address.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true }
    );
    if (!updatedAddress) {
      res.status(404).json({ message: "Address not found" });
    }
    res.json(updatedAddress);
  } catch (error) {
    console.error("Error updating Farmer address:", error);
    res.status(500).json({
      message: "Error updating Farmer address",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  const orders = await Farmer.find({ farmerEmail: req.params.email });
  res.json(orders);
};

export const addOrder = async (req: Request, res: Response) => {
  const order = await Farmer.findOneAndUpdate(
    { email: req.params.email },
    {
      $push: {
        list_sales: {
          orderId: req.body.orderId,
          amount: req.body.amount,
        },
      },
    },
    { new: true }
  );
  res.json(order);
};

// Update Farmer verified status
export const updateFarmerVerifiedStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const farmer = await Farmer.findOneAndUpdate(
      { email: req.params.email },
      { is_verified: req.body.is_verified },
      { new: true }
    );
    if (!farmer) {
      res.status(404).json({ message: "Farmer not found" });
    }
    res.json(Farmer);
  } catch (error) {
    console.error("Error updating Farmer verified status:", error);
    res.status(500).json({
      message: "Error updating Farmer verified status",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

// Update Farmer role
export const updateFarmerRole = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.findOneAndUpdate(
      { email: req.params.email },
      { role: req.body.role },
      { new: true }
    );
    if (!farmer) {
      res.status(404).json({ message: "Farmer not found" });
    }
    res.json(farmer);
  } catch (error) {
    console.error("Error updating Farmer role:", error);
    res.status(500).json({
      message: "Error updating Farmer role",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

export const loginFarmer = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.findOne({ email: req.body.email });
    if (!farmer) {
      res.status(400).json({ message: "Farmer not found" });
    } else {
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Error logging in Farmer:", error);
    res.status(500).json({
      message: "Error logging in Farmer",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};
