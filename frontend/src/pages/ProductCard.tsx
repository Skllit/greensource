import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IProduct } from "../types/Product";
import { selectAuth } from "../store/slices/authSlice";
import { addToCartService, addToWishlistService } from "../utils/services";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

interface ProductCardProps {
  product: IProduct;
  onAddToWishlist: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToWishlist,
}) => {
  const { user, token } = useSelector(selectAuth);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishing, setIsWishing] = useState(false);
  const [productImages, setProductImages] = useState<string>();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

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

    const fetchWishlist = async () => {
      if (!user.email || !token) {
        console.error("User email or token is missing.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3800/api/customers/api/customers/${user.email}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data);
        setWishlist(response.data.data.wishlist);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    const fetchProductReviews = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3800/api/products/${product._id}/reviews`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const reviews = response.data;
        if (reviews.length > 0) {
          const avgRating = reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length;
          setRating(avgRating);
          setReviewCount(reviews.length);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchWishlist();
    fetchProductImages();
    fetchProductReviews();
  }, [product._id, user.email, token]);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      const response = await addToCartService(
        product._id,
        token as string,
        user.email as string
      );

      if (response) {
        toast.success(`${product.name} added to cart successfully!`, {
          position: "bottom-right",
          duration: 3800,
          style: {
            fontSize: '1.2rem',
            padding: '16px',
            minWidth: '300px'
          }
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to cart";
      console.error(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        duration: 3800,
        style: {
          fontSize: '1.2rem',
          padding: '16px',
          minWidth: '300px'
        }
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      setIsWishing(true);

      if (wishlist.includes(product._id)) {
        // Remove from wishlist
        const response = await axios.delete(
          `http://localhost:3800/api/customers/api/customers/${user.email}/wishlist/${product._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response) {
          setWishlist((prev) => prev.filter((id) => id !== product._id));
          onAddToWishlist(); // Notify parent component
        }
      } else {
        // Add to wishlist
        const response = await addToWishlistService(
          product._id,
          token as string,
          user.email as string
        );

        if (response) {
          setWishlist((prev) => [...prev, product._id]);
          onAddToWishlist(); // Notify parent component
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update wishlist";
      console.error(errorMessage);
    } finally {
      setIsWishing(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-500">({reviewCount})</span>
      </div>
    );
  };

  return (
    <>
      <div className="w-[300px] h-fit flex flex-col rounded-lg shadow-md bg-white">
        <div className="relative">
          <img
            className="w-full h-[200px] object-cover rounded-t-lg"
            src={
              productImages === ""
                ? "https://placehold.com/300x200"
                : productImages
            }
            alt={product.name}
          />
          <button
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white"
            aria-label={
              wishlist.includes(product._id)
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            onClick={handleWishlistToggle}
            disabled={isWishing}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                wishlist.includes(product._id)
                  ? "text-red-500"
                  : "hover:text-red-500 text-gray-600"
              } ${isWishing ? "animate-spin" : ""}`}
              fill={wishlist.includes(product._id) ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
        <div className="p-4 flex-grow">
          <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
          {renderStars(rating)}
          <div className="flex flex-col justify-between items-start w-full mb-2">
            <span className="text-sm text-gray-600 mb-1">
              {product.description}
            </span>
            <span className="text-xs text-gray-600">
              Seller: {product.farmerName}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-blue-600">
              ${product.currentPrice.toFixed(2)}
              <span className="text-xs text-gray-500">/{product.unit}</span>
            </span>
            <span className="text-xs text-gray-500">
              Category: {product.category}
            </span>
          </div>
          <button
            className={`w-full py-2 rounded-md transition-colors ${
              isAdding
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label="Add to cart"
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </>
  );
};

export default ProductCard;
