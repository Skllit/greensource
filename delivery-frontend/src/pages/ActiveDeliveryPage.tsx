import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { IDelivery } from "../types/Delivery";

interface Delivery extends IDelivery {
  _id: string;
}

export default function ActiveDeliveryPage() {
  const { user, token } = useSelector(selectAuth);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const agent = await axios.get(
          `http://localhost:3800/api/delivery/agent/email/${user?.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(agent);
        const response = await axios.get(
          `http://localhost:3800/api/delivery/agents/${agent?.data?._id}/activeDeliveries`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response);
        setDeliveries(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch deliveries");
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const handleCancel = async (deliveryId: string) => {
    try {
      await axios.patch(
        `http://localhost:3800/api/delivery/${deliveryId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh deliveries after cancellation
      const updatedDeliveries = deliveries.map((delivery) =>
        delivery._id === deliveryId
          ? { ...delivery, status: "CANCELLED" }
          : delivery
      ) as Delivery[];
      setDeliveries(updatedDeliveries);
    } catch (err) {
      setError("Failed to cancel delivery");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Active Deliveries</h1>

      {deliveries.length === 0 ? (
        <p className="text-gray-600">No active deliveries found</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {deliveries.map((delivery) => (
            <div
              key={delivery._id}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col w-[400px]"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Order #{delivery.orderId}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {new Date(delivery.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    delivery.status === "DELIVERED"
                      ? "bg-green-100 text-green-800"
                      : delivery.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {delivery.status}
                </span>
              </div>

              <div className="flex-1 space-y-4">
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Pickup Details:</h3>
                  <p className="text-sm text-gray-600">
                    {delivery.pickupAddress}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">
                      Farmer: {delivery.farmerId}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {delivery.farmerPhoneNumber}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Delivery Details:</h3>
                  <p className="text-sm text-gray-600">
                    {delivery.deliveryAddress}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">
                      Customer: {delivery.consumerId}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {delivery.consumerPhoneNumber}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 flex gap-2">
                  <button
                    onClick={() =>
                      (window.location.href = `/delivery/${delivery._id}`)
                    }
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    View Details
                  </button>
                  {delivery.status !== "CANCELLED" &&
                    delivery.status !== "DELIVERED" && (
                      <button
                        onClick={() => handleCancel(delivery._id)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
