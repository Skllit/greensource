import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Farmer {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_verified: boolean;
  products?: {
    _id: string;
    name: string;
    currentPrice: number;
  }[];
  orders?: {
    _id: string;
    orderDate: string;
    totalAmount: number;
    status: string;
  }[];
}

export default function AdminFarmersView() {
  const { token } = useSelector(selectAuth);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: { products: boolean; orders: boolean };
  }>({});

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3800/api/farmers/api/farmers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const farmersWithDetails = await Promise.all(
        response.data.map(async (farmer: Farmer) => {
          const [productsRes, ordersRes] = await Promise.all([
            axios.get(
              `http://localhost:3800/api/farmers/api/farmers/${farmer.email}/get/products`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            axios.get(
              `http://localhost:3800/api/orders/api/orders/${farmer.email}/farmers`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
          ]);

          return {
            ...farmer,
            products: productsRes.data,
            orders: ordersRes.data,
          };
        })
      );

      setFarmers(farmersWithDetails);
      const initialExpandedState = farmersWithDetails.reduce(
        (acc, farmer) => ({
          ...acc,
          [farmer.email]: { products: false, orders: false },
        }),
        {}
      );
      setExpandedSections(initialExpandedState);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching farmers:", error);
      setError("Failed to fetch farmers data");
      setLoading(false);
    }
  };

  const handleVerifyFarmer = async (email: string, verify: boolean) => {
    try {
      await axios.put(
        `http://localhost:3800/api/farmers/api/farmers/${email}/update/is_verified`,
        { is_verified: verify },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchFarmers();
    } catch (error) {
      console.error("Error updating farmer verification:", error);
    }
  };

  const handleDeleteFarmer = async (email: string) => {
    try {
      await axios.delete(`http://localhost:3800/api/user/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const productsResponse = await axios.get(
        `http://localhost:3800/api/farmers/api/farmers/${email}/get/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const products = productsResponse.data;

      for (const product of products) {
        await axios.delete(`http://localhost:3800/api/products/${product.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      await axios.delete(
        `http://localhost:3800/api/orders/api/orders/${email}/farmers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await axios.delete(
        `http://localhost:3800/api/farmers/api/farmers/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchFarmers();
    } catch (error) {
      console.error("Error deleting farmer:", error);
    }
  };

  const toggleSection = (
    farmerEmail: string,
    section: "products" | "orders"
  ) => {
    setExpandedSections((prev) => ({
      ...prev,
      [farmerEmail]: {
        ...prev[farmerEmail],
        [section]: !prev[farmerEmail][section],
      },
    }));
  };

  const calculateTotalEarnings = (orders: any[]) => {
    const val = orders
      .filter((order) => order.status === "DELIVERED")
      .reduce((total, order) => total + order.totalAmount, 0);
    return val - (5 * val) / 100;
  };

  if (loading) return <div className="p-4 md:p-6 lg:p-8">Loading...</div>;
  if (error)
    return <div className="p-4 md:p-6 lg:p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Farmers Management</h1>

      <div className="flex flex-wrap gap-4 md:gap-6 items-start justify-start">
        {farmers.map((farmer) => (
          <div
            key={farmer.email}
            className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-200 min-w-[400px]"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">
                      {farmer.first_name.charAt(0)}
                      {farmer.last_name.charAt(0)}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold">
                    {farmer.first_name} {farmer.last_name}
                  </h2>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    {farmer.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Phone:</span>
                    {farmer.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`${
                        farmer.is_verified ? "text-green-600" : "text-red-600"
                      } font-medium`}
                    >
                      {farmer.is_verified ? "Verified" : "Not Verified"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Total Earnings:</span>
                    <span className="text-green-600 font-medium">
                    ₹{calculateTotalEarnings(farmer.orders || []).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                {!farmer.is_verified ? (
                  <>
                    <button
                      className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-full text-sm transition-colors duration-200"
                      onClick={() => handleVerifyFarmer(farmer.email, true)}
                    >
                      Verify
                    </button>
                    <button
                      className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-full text-sm transition-colors duration-200"
                      onClick={() => handleDeleteFarmer(farmer.email)}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-full text-sm transition-colors duration-200"
                    onClick={() => handleVerifyFarmer(farmer.email, false)}
                  >
                    Revoke Verification
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                onClick={() => toggleSection(farmer.email, "products")}
              >
                <h3 className="font-medium text-sm">
                  Products ({farmer.products?.length || 0})
                </h3>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/farmers/${farmer.email}/products`}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View All
                  </Link>
                  {expandedSections[farmer.email]?.products ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </div>
              </div>
              {expandedSections[farmer.email]?.products && (
                <div className="mt-2 space-y-2">
                  {farmer.products && farmer.products.length > 0 ? (
                    farmer.products.slice(0, 3).map((product) => (
                      <div
                        key={product._id}
                        className="bg-gray-50 p-3 rounded-md text-sm"
                      >
                        <p className="font-medium">{product.name}</p>
                        <p className="text-gray-600">
                          Price: ${product.currentPrice}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No products listed</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                onClick={() => toggleSection(farmer.email, "orders")}
              >
                <h3 className="font-medium text-sm">
                  Orders ({farmer.orders?.length || 0})
                </h3>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/farmers/${farmer.email}/orders`}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View All
                  </Link>
                  {expandedSections[farmer.email]?.orders ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </div>
              </div>
              {expandedSections[farmer.email]?.orders && (
                <div className="mt-2 space-y-2">
                  {farmer.orders && farmer.orders.length > 0 ? (
                    farmer.orders.slice(0, 3).map((order) => (
                      <div
                        key={order._id}
                        className="bg-gray-50 p-3 rounded-md text-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              Order #{order._id.slice(-6)}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.totalAmount}</p>
                            <p className="text-xs">{order.status}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No orders yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
