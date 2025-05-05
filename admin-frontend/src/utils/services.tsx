import axios from "axios";
// import { IProduct } from "../types/Product";
import { IProductImage } from "../types/Product";

export const getProducts = async (token: string) => {
  const response = await axios.get("http://localhost:3800/api/products", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createProduct = async (token: string, productData: any) => {
  try {
    // Then add the product to farmer's list_products
    const productResponse = await axios.post(
      `http://localhost:3800/api/farmers/api/farmers/${productData.farmerId}/add/product`,
      { ...productData },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return productResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to create product"
      );
    }
    throw new Error("Failed to create product");
  }
};

export const getFarmerProducts = async (token: string, email: string) => {
  console.log("email", email);
  console.log("token", token);
  const response = await axios.get(
    `http://localhost:3800/api/farmers/api/farmers/${email}/get/products`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const addToCartService = async (
  productId: string,
  token: string,
  email: string
) => {
  try {
    console.log(token, email, productId);
    const productData = { productId: productId, quantity: 1 };
    const response = await axios.post(
      `http://localhost:3800/api/customers/api/customers/${email}/cart`,
      productData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to add to cart");
    }
    throw new Error("Failed to add to cart");
  }
};

export const addToWishlistService = async (
  productId: string,
  token: string,
  email: string
) => {
  try {
    console.log(token, email, productId);
    const productData = { productId: productId };
    const response = await axios.post(
      `http://localhost:3800/api/customers/api/customers/${email}/wishlist`,
      productData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to add to cart");
    }
    throw new Error("Failed to add to cart");
  }
};

export const getCartItems = async (token: string) => {
  try {
    const response = await axios({
      method: "GET",
      url: `http://localhost:3800/api/customers/api/customers//cart`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch cart items"
      );
    }
    throw new Error("Failed to fetch cart items");
  }
};

export const addProductImage = async (
  token: string,
  productId: string,
  imageData: Partial<IProductImage>
) => {
  try {
    const response = await axios.post(
      `http://localhost:3800/api/products/${productId}/images`,
      imageData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to add product image"
      );
    }
    throw new Error("Failed to add product image");
  }
};

export const getCustomerCart = async (token: string, email: string) => {
  try {
    const response = await axios.get(
      `http://localhost:3800/api/customers/api/customers/${email}/cart`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch cart");
    }
    throw new Error("Failed to fetch cart");
  }
};

export const removeFromCart = async (
  token: string,
  email: string,
  productId: string
) => {
  try {
    const response = await axios.delete(
      `http://localhost:3800/api/customers/api/customers/${email}/cart/${productId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to remove item from cart"
      );
    }
    throw new Error("Failed to remove item from cart");
  }
};

export const createOrder = async (
  token: string,
  email: string,
  orderData: any
) => {
  try {
    const response = await axios.post(
      `http://localhost:3800/api/customers/api/customers/${email}/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to create order"
      );
    }
    throw new Error("Failed to create order");
  }
};
