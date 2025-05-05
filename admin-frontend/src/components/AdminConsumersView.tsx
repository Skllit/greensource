import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface Consumer {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  orders?: {
    _id: string;
    orderDate: string;
    totalAmount: number;
    status: string;
  }[];
}

export default function AdminConsumersView() {
  const { token } = useSelector(selectAuth);
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: { orders: boolean };
  }>({});

  useEffect(() => {
    fetchConsumers();
  }, []);

  const fetchConsumers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3800/api/customers/api/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const consumersWithDetails = await Promise.all(
        response.data.data.map(async (consumer: Consumer) => {
          const ordersRes = await axios.get(
            `http://localhost:3800/api/orders/api/orders/${consumer.email}/customers`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          return {
            ...consumer,
            orders: ordersRes.data,
          };
        })
      );

      setConsumers(consumersWithDetails);
      const initialExpandedState = consumersWithDetails.reduce(
        (acc, consumer) => ({
          ...acc,
          [consumer.email]: { orders: false },
        }),
        {}
      );
      setExpandedSections(initialExpandedState);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching consumers:", error);
      setError("Failed to fetch consumers data");
      setLoading(false);
    }
  };

  const handleDeleteConsumer = async (email: string) => {
    try {
      await axios.delete(`http://localhost:3800/api/user/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await axios.delete(
        `http://localhost:3800/api/orders/api/orders/${email}/customers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await axios.delete(
        `http://localhost:3800/api/customers/api/customers/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchConsumers();
    } catch (error) {
      console.error("Error deleting consumer:", error);
    }
  };

  const toggleSection = (consumerEmail: string, section: "orders") => {
    setExpandedSections((prev) => ({
      ...prev,
      [consumerEmail]: {
        ...prev[consumerEmail],
        [section]: !prev[consumerEmail][section],
      },
    }));
  };

  if (loading) return <div className="p-4 md:p-6 lg:p-8">Loading...</div>;
  if (error)
    return <div className="p-4 md:p-6 lg:p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Consumers Management</h1>

      <div className="flex flex-wrap gap-4 md:gap-6 items-start justify-start">
        {consumers.map((consumer) => (
          <div
            key={consumer.email}
            className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-200 min-w-[400px]"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {consumer.firstName[0]}
                      {consumer.lastName[0]}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold">
                    {consumer.firstName} {consumer.lastName}
                  </h2>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    {consumer.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Phone:</span>
                    {consumer.phone}
                  </p>
                </div>
              </div>
              <button
                className="w-20 float-end md:w-auto bg-red-500 hover:bg-red-600 text-white flex items-center justify-center font-medium p-4 rounded-full text-sm transition-colors duration-200"
                onClick={() => handleDeleteConsumer(consumer.email)}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                onClick={() => toggleSection(consumer.email, "orders")}
              >
                <h3 className="font-medium text-sm">
                  Orders ({consumer.orders?.length || 0})
                </h3>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/consumers/${consumer.email}/orders`}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View All
                  </Link>
                  {expandedSections[consumer.email]?.orders ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </div>
              </div>
              {expandedSections[consumer.email]?.orders && (
                <div className="mt-2 space-y-2">
                  {consumer.orders && consumer.orders.length > 0 ? (
                    consumer.orders.slice(0, 3).map((order) => (
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
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                order.status === "DELIVERED"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-2">
                      No orders yet
                    </p>
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
