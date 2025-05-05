import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import AdminProductsCard from "./AdminProductsCard";
import { IProduct, IProductImage } from "../types/Product";

interface ProductWithDetails extends IProduct {
  farmerDetails?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  images?: IProductImage;
}

export default function AdminProducts() {
  const { token } = useSelector(selectAuth);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Get all products
      const response = await axios.get("http://localhost:3800/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Fetch additional details for each product
      const productsWithDetails = await Promise.all(
        response.data.map(async (product: IProduct) => {
          try {
            // Fetch farmer details
            const farmerRes = await axios.get(
              `http://localhost:3800/api/farmers/api/farmers/${product.farmerId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            console.log(farmerRes.data);
            // Fetch product images
            const imagesRes = await axios.get(
              `http://localhost:3800/api/products/${product._id}/images`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            console.log("images", imagesRes.data);
            return {
              ...product,
              farmerDetails: farmerRes.data,
              images: imagesRes.data,
            };
          } catch (error) {
            console.error(
              `Error fetching details for product ${product._id}:`,
              error
            );
            return {
              ...product,
              farmerDetails: undefined,
              images: [],
            };
          }
        })
      );
      console.log("productsWithDetails", productsWithDetails);
      setProducts(productsWithDetails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products data");
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await axios.delete(`http://localhost:3800/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) return <div className="p-4 md:p-6 lg:p-8">Loading...</div>;
  if (error)
    return <div className="p-4 md:p-6 lg:p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Products Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <AdminProductsCard
            key={product._id}
            product={product}
            onDelete={handleDeleteProduct}
          />
        ))}
      </div>
    </div>
  );
}
