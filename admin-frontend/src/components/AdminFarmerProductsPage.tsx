import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { Trash2 } from "lucide-react";

enum ProductCategory {
  VEGETABLES = "VEGETABLES",
  FRUITS = "FRUITS",
  DAIRY = "DAIRY",
  MEAT = "MEAT",
  GRAINS = "GRAINS",
}

interface IProduct {
  _id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  quantityAvailable: number;
  unit: string;
  category: ProductCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IProductImage {
  _id: string;
  productId: string;
  imageUrl: string;
  displayOrder: number;
}

export default function AdminFarmerProductsPage() {
  const { farmerId } = useParams();
  const { token } = useSelector(selectAuth);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productImages, setProductImages] = useState<IProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [farmerId]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3800/api/farmers/api/farmers/${farmerId}/get/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts(response.data);

      const imagePromises = response.data.map(async (product: IProduct) => {
        try {
          const imageResponse = await axios.get(
            `http://localhost:3800/api/products/${product._id}/images`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return imageResponse.data;
        } catch (error) {
          console.error(
            `Error fetching image for product ${product._id}:`,
            error
          );
          return [];
        }
      });
      const images = await Promise.all(imagePromises);
      setProductImages(images);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products");
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete(`http://localhost:3800/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product");
    }
  };

  if (loading) return <div className="p-4 md:p-6 lg:p-8">Loading...</div>;
  if (error) return <div className="p-4 md:p-6 lg:p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Farmer Products Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2">
                  {productImages?.find((data) => data.productId === product._id)?.imageUrl ? (
                    <img
                      src={productImages.find((data) => data.productId === product._id)?.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p className="line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-600">
                        ${product.currentPrice}/{product.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Base price: ${product.basePrice}/{product.unit}
                      </p>
                    </div>
                    <p className="text-gray-500">
                      Stock: {product.quantityAvailable} {product.unit}s
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Farmer:</span> {product.farmerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status:{" "}
                    {product.isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                className="text-red-500 hover:text-red-600 transition-colors duration-200"
                onClick={() => handleDeleteProduct(product._id)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
