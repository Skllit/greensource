// src/pages/FarmerProducts.tsx
import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
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
import { toast } from "react-toastify";

interface Farmer {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  is_verified: boolean;
}

interface MarketRecord {
  commodity: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

interface MarketApiResponse {
  records: MarketRecord[];
}

export default function FarmerProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // image‐upload states
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [farmer, setFarmer] = useState<Farmer | null>(null);

  // new product form state
  const [newProduct, setNewProduct] = useState<Partial<IProduct>>({
    name: "",
    description: "",
    basePrice: 0,
    currentPrice: 0,
    quantityAvailable: 0,
    unit: "",
    category: undefined,
  });

  // market‐suggestion state
  const [marketSuggestion, setMarketSuggestion] = useState<{
    avgMin: string;
    avgModal: string;
    avgMax: string;
  } | null>(null);

  const { user, token } = useSelector(selectAuth);

  // Data.gov.in API details
  const MARKET_API_URL =
    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
  const MARKET_API_KEY = "579b464db66ec23bdd000001f436e980073b4bdd6780e17e5677bcf6";

  // -- 1) fetch farmer + products
  const loadProducts = useCallback(async () => {
    try {
      const data = await getFarmerProducts(token as string, user.email as string);
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  }, [token, user.email]);

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const res = await axios.get<Farmer>(
          `http://localhost:3800/api/farmers/api/farmers/${user.email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFarmer(res.data);
      } catch (err) {
        console.error("Failed to fetch farmer", err);
        setError("Could not load your profile");
      }
    };

    fetchFarmer().then(loadProducts).finally(() => setLoading(false));
  }, [user.email, token, loadProducts]);

  // -- 2) fetch & compute market‐price suggestion
  const fetchMarketSuggestion = async (commodity: string) => {
    if (!commodity) {
      setMarketSuggestion(null);
      return;
    }
    try {
      const res = await axios.get<MarketApiResponse>(MARKET_API_URL, {
        params: {
          "api-key": MARKET_API_KEY,
          format: "json",
          limit: 50,
          "filters[commodity]": commodity,
        },
      });
      const recs = res.data.records;
      if (recs.length) {
        const sum = (field: keyof MarketRecord) =>
          recs.reduce((acc, r) => acc + Number(r[field]), 0);
        const avgMin = (sum("min_price") / recs.length).toFixed(2);
        const avgModal = (sum("modal_price") / recs.length).toFixed(2);
        const avgMax = (sum("max_price") / recs.length).toFixed(2);
        setMarketSuggestion({ avgMin, avgModal, avgMax });
      } else {
        setMarketSuggestion(null);
      }
    } catch (err) {
      console.error("Market suggestion error:", err);
      setMarketSuggestion(null);
    }
  };

  // -- 3) image upload handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setProductImages((prev) => [...prev, ...files]);
    setImageUrls((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (idx: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== idx));
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  // -- 4) handle form field changes
  const handleFieldChange = (
    field: keyof IProduct,
    value: string | number | ProductCategory
  ) => {
    setNewProduct((p) => ({
      ...p,
      [field]: value,
      // keep currentPrice in sync with basePrice if basePrice changes
      ...(field === "basePrice" ? { currentPrice: Number(value) } : {}),
    }));
    if (field === "name") {
      fetchMarketSuggestion(value as string);
    }
  };

  // -- 5) submit new product + images
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 5.1) create product record
      const created = await createProduct(token as string, {
        ...newProduct,
        farmerId: user.email,
      } as IProduct);

      // 5.2) upload images & link them
      await Promise.all(
        productImages.map(async (file, idx) => {
          const form = new FormData();
          form.append("file", file);
          form.append("upload_preset", "green_source");
          form.append("cloud_name", "dwsqhfmkk");

          const uploadRes = await axios.post(
            "https://api.cloudinary.com/v1_1/dwsqhfmkk/image/upload",
            form,
            {
              onUploadProgress: (ev) => {
                if (ev.total) {
                  setUploadProgress((ev.loaded / ev.total) * 100);
                }
              },
            }
          );

          const imgData: Partial<IProductImage> = {
            productId: created._id,
            imageUrl: uploadRes.data.secure_url,
            displayOrder: idx,
          };

          return addProductImage(token as string, created._id, imgData);
        })
      );

      toast.success("Product added — with live market suggestion! 🎉");
      setNewProduct({
        name: "",
        description: "",
        basePrice: 0,
        currentPrice: 0,
        quantityAvailable: 0,
        unit: "",
        category: undefined,
      });
      setProductImages([]);
      setImageUrls([]);
      setUploadProgress(0);
      setMarketSuggestion(null);
      loadProducts();
      setShowAddForm(false);
    } catch (err) {
      console.error("Add product failed:", err);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  // -- 6) render guards
  if (!farmer?.is_verified) {
    return (
      <div className="flex-grow px-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 text-yellow-700">
          <p className="font-bold">Account Not Verified</p>
          <p>Your account needs admin verification before adding products.</p>
        </div>
      </div>
    );
  }

  if (loading) return <p className="text-lg text-center mt-8">Loading…</p>;
  if (error) return <p className="text-lg text-red-600 text-center mt-8">{error}</p>;

  // -- 7) main UI
  return (
    <div className="flex-grow px-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Products</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-green-500 px-4 py-2 text-white rounded hover:bg-green-600"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {showAddForm && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddForm(false)}
          />

          {/* sliding panel */}
          <div
            className={`fixed right-0 top-0 z-50 h-full w-full md:w-[500px] bg-white transform transition-transform ${
              showAddForm ? "translate-x-0" : "translate-x-full"
            } overflow-auto`}
          >
            <form onSubmit={handleAddProduct} className="h-full flex flex-col">
              <div className="p-6 flex justify-between items-center border-b">
                <h3 className="text-xl font-semibold">Add New Product</h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                {/* market suggestion */}
                {marketSuggestion && (
                  <div className="rounded border bg-blue-50 p-4">
                    <p className="font-medium">
                      Market suggestion for “{newProduct.name} Per Quintal”:
                    </p>
                    <p className="text-sm">
                      Min: ₹{marketSuggestion.avgMin} | Modal: ₹
                      {marketSuggestion.avgModal} | Max: ₹
                      {marketSuggestion.avgMax}
                    </p>
                  </div>
                )}

                {/* image upload */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Product Images
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 p-4 rounded-lg">
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                    <div className="flex flex-col items-center justify-center h-24">
                      <Upload size={24} className="text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        Click to select images
                      </span>
                    </div>
                  </div>
                  {imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${i}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2 h-2.5 w-full bg-gray-200 rounded-full">
                      <div
                        className="h-2.5 rounded-full bg-green-500"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* product fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name / Commodity
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      placeholder="e.g. Banana, Wheat..."
                      className="mt-1 block w-full border p-2 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newProduct.description}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                      placeholder="Short description"
                      className="mt-1 block w-full border p-2 rounded"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Base Price
                      </label>
                      <input
                        type="number"
                        value={newProduct.basePrice}
                        onChange={(e) =>
                          handleFieldChange("basePrice", Number(e.target.value))
                        }
                        className="mt-1 block w-full border p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity Available
                      </label>
                      <input
                        type="number"
                        value={newProduct.quantityAvailable}
                        onChange={(e) =>
                          handleFieldChange(
                            "quantityAvailable",
                            Number(e.target.value)
                          )
                        }
                        className="mt-1 block w-full border p-2 rounded"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={newProduct.unit}
                        onChange={(e) =>
                          handleFieldChange("unit", e.target.value)
                        }
                        placeholder="kg, piece..."
                        className="mt-1 block w-full border p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        value={newProduct.category}
                        onChange={(e) =>
                          handleFieldChange(
                            "category",
                            e.target.value as ProductCategory
                          )
                        }
                        className="mt-1 block w-full border p-2 rounded"
                        required
                      >
                        <option value="">Select</option>
                        <option value="VEGETABLES">Vegetables</option>
                        <option value="FRUITS">Fruits</option>
                        <option value="GRAINS">Grains</option>
                        <option value="DAIRY">Dairy</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 p-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {loading ? "Adding…" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-6">
        {products.map((product) => (
          <FarmerProductCard
            key={product._id}
            product={product}
            onProductUpdate={loadProducts}
          />
        ))}
      </div>
    </div>
  );
}
