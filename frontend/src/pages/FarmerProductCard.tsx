import React, { useState, useEffect } from "react";
import { IProduct } from "../types/Product";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import {  Trash2, Edit2 } from "lucide-react";

interface FarmerProductCardProps {
  product: IProduct;
  onProductUpdate: () => void;
}

const FarmerProductCard: React.FC<FarmerProductCardProps> = ({
  product,
  onProductUpdate ,
}) => {
  const { user, token } = useSelector(selectAuth);
  const [productImage, setProductImages] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<IProduct>(product);
  const [isDeleted, setIsDeleted] = useState(false);

  // Update editedProduct when product prop changes
  useEffect(() => {
    setEditedProduct(product);
  }, [product]);

  useEffect(() => {
    const fetchProductImages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3800/api/products/${product._id}/images`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data) {
          const images = await response.data;
          setProductImages(
            images.imageUrl ? images.imageUrl : "https://placehold.co/300x200"
          );
        }
      } catch (error) {
        console.error("Error fetching product images:", error);
      }
    };

    fetchProductImages();
  }, [product._id]);

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3800/api/farmers/api/farmers/${user.email}/delete/product/${product._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsDeleted(true);
      onProductUpdate();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3800/api/products/${product._id}`,
        editedProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update the local state with the response data
      setEditedProduct(response.data);
      setIsEditing(false);
      onProductUpdate();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProduct(product);
  };

  if (isDeleted) {
    return null;
  }

  if (isEditing) {
    return (
      <div className="w-[300px] p-4 flex flex-col rounded-lg shadow-md bg-white">
        <h2 className="text-lg font-semibold mb-4">Edit Product</h2>
        <form className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={editedProduct.description}
              onChange={(e) =>
                setEditedProduct({
                  ...editedProduct,
                  description: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              value={editedProduct.currentPrice}
              onChange={(e) =>
                setEditedProduct({
                  ...editedProduct,
                  currentPrice: parseFloat(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity Available
            </label>
            <input
              type="number"
              value={editedProduct.quantityAvailable}
              onChange={(e) =>
                setEditedProduct({
                  ...editedProduct,
                  quantityAvailable: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <input
              type="text"
              value={editedProduct.unit}
              onChange={(e) =>
                setEditedProduct({ ...editedProduct, unit: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-[300px] h-[370px] flex flex-col rounded-lg shadow-md bg-white">
      <div className="relative">
        <img
          className="w-full h-[200px] object-cover rounded-t-lg"
          src={
            productImage === null
              ? "https://placehold.co/300x200"
              : productImage
          }
          alt={editedProduct.name}
        />
      </div>
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-lg font-semibold mb-2">{editedProduct.name}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {editedProduct.description}
            </p>
          </div>
          <div className="flex gap-2 justify-start items-start">
            <button
              onClick={handleEdit}
              className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-blue-600">
          ₹{editedProduct.currentPrice.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">
            Category: {editedProduct.category}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Quantity Available: {editedProduct.quantityAvailable}{" "}
          {editedProduct.unit}
        </div>
      </div>
    </div>
  );
};

export default FarmerProductCard;
