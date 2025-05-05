import React, { useEffect, useState } from "react";
import { IProduct } from "../types/Product";
import { getProducts } from "../utils/services";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { Frown, Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToWishlist } from "../store/slices/wishlistSlice";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { token } = useSelector(selectAuth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts(token || "");
        setProducts(data);
        setLoading(false);
      } catch (err: unknown) {
        setError(`Failed to fetch products ${err}`);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  const handleAddToWishlist = (product: IProduct) => {
    dispatch(addToWishlist(product));
  };

  const categories = [
    "all",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <p className="text-lg">Loading...</p>;
  }

  if (error) {
    return <p className="text-lg text-red-600">{error}</p>;
  }

  return (
    <div className="flex-grow p-4 md:p-6 lg:p-8">
      <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="relative flex-grow md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-48 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap justify-start items-start gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToWishlist={() => handleAddToWishlist(product)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-10 h-96">
            <Frown className="size-20 text-gray-600" />
            <span className="text-center">
              {searchTerm || selectedCategory !== "all"
                ? "No products found matching your criteria."
                : "No Products available as of now. Please try again later."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
