import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Package, Clock, User } from "lucide-react";
import { OrderTracker } from "./OrderTracker";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { IOrder } from "../types/Order";

interface DeliveryLocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface Order extends IOrder {
  _id: string;
}

interface Delivery {
  _id: string;
  orderId: string;
  farmerId: string;
  customerId: string;
  deliveryAgentId?: string;
  status: "PENDING" | "CONFIRMED" | "ONTHEWAY" | "SHIPPED" | "DELIVERED";
  deliveryLocation: DeliveryLocation;
  pickupAddress?: string;
}

interface DeliveryStatusUpdate {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "ONTHEWAY"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
}

export default function OrderDetailsPage() {
  const { deliveryId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [productNames, setProductNames] = useState<{ [key: string]: string }>(
    {}
  );
  const { token } = useSelector(selectAuth);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const deliveryRes = await axios.get(
          `http://localhost:3800/api/delivery/${deliveryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const deliveryResData = await deliveryRes.data;
        setDelivery(deliveryResData);

        const orderId = deliveryResData.orderId;

        // Fetch order details from order service
        const orderResponse = await axios.get(
          `http://localhost:3800/api/orders/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const orderData = await orderResponse.data;
        setOrder(orderData);

        // Fetch delivery details from delivery service
        const deliveryResponse = await axios.get(
          `http://localhost:3800/api/delivery/order/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const deliveryData = await deliveryResponse.data;
        setDelivery(deliveryData);

        // Fetch product names for all items
        const names: { [key: string]: string } = {};
        for (const item of orderData.items) {
          const response = await axios.get(
            `http://localhost:3800/api/products/${item.productId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          names[item.productId] = response.data?.name || "Unknown Product";
        }
        setProductNames(names);
      } catch (error) {}
    };

    if (deliveryId) {
      fetchOrderDetails();
    }
  }, [deliveryId, token]);

  const updateDeliveryStatus = async (statusUpdate: DeliveryStatusUpdate) => {
    try {
      // Update delivery status
      const deliveryResponse = await axios.put(
        `http://localhost:3800/api/delivery/${delivery?._id}/status`,
        statusUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (statusUpdate.status === "DELIVERED") {
        const orderCountUpdate = await axios.put(
          `http://localhost:3809/agents/${delivery?.deliveryAgentId}/orderCount/decrease`
          // {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          //   },
          // }
        );
        const addedDeliveryId = await axios.put(
          `http://localhost:3809/add/${delivery?.deliveryAgentId}/delivery/${delivery?._id}`
          // {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          //   },
          // }
        );
        console.log(addedDeliveryId);
        console.log(orderCountUpdate);
      }
      setDelivery(deliveryResponse.data);

      // Update order status to match delivery status
      if (order) {
        let orderStatus = statusUpdate.status;
        if (statusUpdate.status === "ONTHEWAY") {
          orderStatus = "CONFIRMED";
        }

        await axios.put(
          `http://localhost:3800/api/orders/api/orders/${order._id}`,
          { status: orderStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh order data
        const orderResponse = await axios.get(
          `http://localhost:3800/api/orders/api/orders/${order._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrder(orderResponse.data);
      }
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  };

  const renderDeliveryAgentControls = (delivery: Delivery) => {
    console.log(delivery.status);
    return (
      <div className="mt-8 space-y-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-3">
          Delivery Controls
        </h3>
        <div className="flex flex-wrap gap-4">
          {delivery.status === "CONFIRMED" && (
            <button
              onClick={() => updateDeliveryStatus({ status: "ONTHEWAY" })}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
            >
              Mark as Picked Up
            </button>
          )}
          {delivery.status === "ONTHEWAY" && (
            <button
              onClick={() => updateDeliveryStatus({ status: "SHIPPED" })}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:from-indigo-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
            >
              Start Delivery
            </button>
          )}
          {delivery.status === "SHIPPED" && (
            <button
              onClick={() => updateDeliveryStatus({ status: "DELIVERED" })}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200"
            >
              Mark as Delivered
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Order #{order._id}
            </h2>
            <p className="text-gray-600 flex items-center">
              <Clock className="inline-block w-5 h-5 mr-2 text-blue-500" />
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <OrderTracker order={order} status={delivery?.status as string} />

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">
                Delivery Details
              </h3>
              <div className="flex flex-col gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-blue-500 mt-1" />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">
                        Pickup Address
                      </p>
                      <p className="text-gray-600 mt-1">
                        {delivery?.pickupAddress || "Loading pickup address..."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm">
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-purple-500 mt-1" />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">
                        Delivery Address
                      </p>
                      <p className="text-gray-600 mt-1">
                        {order.shippingAddress.street}
                      </p>
                      <p className="text-gray-600">
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postal_code}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Order Summary</h3>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-500 mr-3" />
                      <span className="font-medium text-gray-800">
                        {productNames[item.productId]}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${item.unitPrice.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {delivery && delivery.deliveryAgentId && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <User className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="font-semibold text-gray-900 text-lg">
                    Delivery Agent
                  </p>
                  <p className="text-gray-600 mt-1">
                    Your order will be delivered by Agent #
                    {delivery.deliveryAgentId}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Status:{" "}
                    <span className="font-medium text-blue-600">
                      {delivery.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {delivery !== null && renderDeliveryAgentControls(delivery)}
        </div>
      </div>
    </div>
  );
}
