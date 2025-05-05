import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { IProduct } from "../types/Product";
import axios from "axios";
import ProductCard from "./ProductCard";

export default function ConsumerSavedPage() {
  const { user, token } = useSelector(selectAuth);
  const [wishlistItems, setWishlistItems] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user.email || !token) {
        console.error("User email or token is missing.");
        return;
      }

      try {
        // First, get the wishlist product IDs
        const wishlistResponse = await axios.get(
          `http://localhost:3800/api/customers/api/customers/${user.email}/wishlist`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const productIds = wishlistResponse.data.data;

        // Then fetch details for each product
        const productDetails = await Promise.all(
          productIds.map(async (productId: string) => {
            try {
              const response = await axios.get(
                `http://localhost:3800/api/products/${productId}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              return response.data;
            } catch (error) {
              console.error(`Error fetching product ${productId}:`, error);
              return null;
            }
          })
        );

        setWishlistItems(productDetails.filter(Boolean));
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user.email, token]);

  const handleWishlistUpdate = async (product: IProduct) => {
    try {
      await axios.delete(
        `http://localhost:3800/api/customers/api/customers/${user.email}/wishlist/${product._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the product from the local state
      setWishlistItems((prev) =>
        prev.filter((item) => item._id !== product._id)
      );
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-grow px-8">
      <h1 className="text-2xl font-bold mb-6">My Saved Products</h1>
      <div className="flex flex-wrap justify-start items-start gap-6">
        {wishlistItems.length > 0 ? (
          wishlistItems.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToWishlist={() => handleWishlistUpdate(product)}
            />
          ))
        ) : (
          <div className="w-full text-center text-gray-500">
            Your wishlist is empty
          </div>
        )}
      </div>
    </div>
  );
}
