import { useEffect, useState } from "react";
import { IProduct, ProductCategory, IProductImage } from "../types/Product";
import {
  getFarmerProducts,
  createProduct,
  addProductImage,
} from "../utils/services";
import FarmerProductCard from "./FarmerProductCard";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { Plus, X, Upload } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

interface Farmer {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  is_verified: boolean;
}

export default function FarmerProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<IProduct>>({
    name: "",
    description: "",
    basePrice: 0,
    currentPrice: 0,
    quantityAvailable: 0,
    unit: "",
    category: undefined,
  });

  const { user, token } = useSelector(selectAuth);

  useEffect(() => {
    const fetchFarmerAndProducts = async () => {
      try {
        // Fetch farmer details first
        const farmerResponse = await axios.get(
          `http://localhost:3800/api/farmers/api/farmers/${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFarmer(farmerResponse.data);

        // Then fetch products
        const data = await getFarmerProducts(
          token as string,
          user.email as string
        );
        setProducts(data);
        setLoading(false);
      } catch (err: unknown) {
        setError(`Failed to fetch data ${err}`);
        setLoading(false);
      }
    };

    fetchFarmerAndProducts();
  }, [user.email, token]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setProductImages((prevImages) => [...prevImages, ...files]);

      // Create preview URLs for the images
      const newImageUrls = files.map((file) => URL.createObjectURL(file));
      setImageUrls((prevUrls) => [...prevUrls, ...newImageUrls]);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "green_source");
    formData.append("cloud_name", "dwsqhfmkk");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dwsqhfmkk/image/upload",

        formData
      );
      console.log(response);

      if (!response.data) {
        throw new Error("Upload failed");
      }

      const data = await response.data;
      return data.secure_url;
    } catch (error) {
      console.log(error);
      console.error("Upload error:", error);
      throw error;
    }
  };

  const removeImage = (index: number) => {
    setProductImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImageUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // First create the product
      const productData = {
        ...newProduct,
        farmerId: user.email,
      };

      const createdProduct = await createProduct(token as string, productData);

      // Then upload images to Cloudinary and create product images
      const uploadPromises = productImages.map(async (image, index) => {
        const imageUrl = await uploadToCloudinary(image);

        const productImageData: Partial<IProductImage> = {
          productId: createdProduct._id,
          imageUrl: imageUrl,
          displayOrder: index,
        };

        return addProductImage(
          token as string,
          createdProduct._id,
          productImageData
        );
      });

      await Promise.all(uploadPromises);

      // Update local state
      setProducts([...products, createdProduct]);

      // Reset form
      setShowAddForm(false);
      setNewProduct({
        name: "",
        description: "",
        basePrice: 0,
        currentPrice: 0,
        quantityAvailable: 0,
        unit: "",
        category: undefined,
      });
      // toast.success("Product added successfully!");
      setProductImages([]);
      setImageUrls([]);
      setUploadProgress(0);
    } catch (err) {
      setError("Failed to add product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!farmer?.is_verified) {
    return (
      <div className="flex-grow px-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">Account Not Verified</p>
          <p>
            Your account needs to be verified by an admin before you can add
            products.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <p className="text-lg">Loading...</p>;
  }

  if (error) {
    return <p className="text-lg text-red-600">{error}</p>;
  }

  return (
    <div className="flex-grow px-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Products</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Overlay */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowAddForm(false)}
        />
      )}

      {/* Sliding Form Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[500px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          showAddForm ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <form onSubmit={handleAddProduct} className="h-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Product</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Product Images
                </label>
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload size={24} className="text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">
                      Click to upload images
                    </span>
                  </label>
                </div>
                {imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Product Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="Enter product description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="basePrice"
                  className="text-sm font-medium text-gray-700"
                >
                  Base Price
                </label>
                <input
                  id="basePrice"
                  type="number"
                  placeholder="Enter base price"
                  value={newProduct.basePrice}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      basePrice: Number(e.target.value),
                      currentPrice: Number(e.target.value),
                    })
                  }
                  className="border p-2 rounded"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="quantity"
                  className="text-sm font-medium text-gray-700"
                >
                  Quantity Available
                </label>
                <input
                  id="quantity"
                  type="number"
                  placeholder="Enter available quantity"
                  value={newProduct.quantityAvailable}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      quantityAvailable: Number(e.target.value),
                    })
                  }
                  className="border p-2 rounded"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="unit"
                  className="text-sm font-medium text-gray-700"
                >
                  Unit
                </label>
                <input
                  id="unit"
                  type="text"
                  placeholder="Enter unit (kg, piece, etc)"
                  value={newProduct.unit}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, unit: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      category: e.target.value as ProductCategory,
                    })
                  }
                  className="border p-2 rounded"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="VEGETABLES">Vegetables</option>
                  <option value="FRUITS">Fruits</option>
                  <option value="GRAINS">Grains</option>
                  <option value="DAIRY">Dairy</option>
                </select>
              </div>
            </div>
          </div>

          <div className="relative bottom-0 left-0 right-0 p-6 bg-white border-t">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap justify-start items-start gap-6">
        {products?.map((product) => (
          <div key={product._id}>
            <FarmerProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
