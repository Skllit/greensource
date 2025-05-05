import { Trash2 } from "lucide-react";
import { IProduct, IProductImage } from "../types/Product";

interface ProductWithDetails extends IProduct {
  farmerDetails?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  images?: IProductImage;
}

interface AdminProductsCardProps {
  product: ProductWithDetails;
  onDelete: (productId: string) => void;
}

export default function AdminProductsCard({
  product,
  onDelete,
}: AdminProductsCardProps) {
  const mainImage = product.images?.imageUrl;
  const farmerName = product.farmerDetails
    ? `${product.farmerDetails.first_name} ${product.farmerDetails.last_name}`
    : "Unknown Farmer";
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-2">
            {mainImage ? (
              <img
                src={mainImage}
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
                ₹{product.currentPrice}/{product.unit}
                </p>
                <p className="text-xs text-gray-500">
                  Base price: ₹{product.basePrice}/{product.unit}
                </p>
              </div>
              <p className="text-gray-500">
                Stock: {product.quantityAvailable} {product.unit}s
              </p>
            </div>
          </div>

          <div className="pt-2 border-t mt-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Farmer:</span> {farmerName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span>{" "}
              {product.farmerDetails?.email}
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
          onClick={() => onDelete(product._id)}
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
