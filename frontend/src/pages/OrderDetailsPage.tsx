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

interface IDeliveryAgent {
  name: string;
  email: string;
  phoneNumber: string;
  orderCount: number;
  serviceLocations: string[]; // Array of city names
  deliveredOrders: string[]; // Array of order IDs
  isAvailable: boolean;
  idProof: {
    type: "aadhaar" | "pan" | "voter";
    value: string;
  };
  vehicle: {
    type: "bike" | "van" | "truck";
    model: string;
    registrationId: string;
  };
}

interface Delivery {
  _id: string;
  orderId: string;
  farmerId: string;
  customerId: string;
  agentId?: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "ONTHEWAY"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  deliveryLocation: DeliveryLocation;
}

interface DeliveryStatusUpdate {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "ONTHEWAY"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  location?: {
    coordinates: [number, number];
  };
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [deliveryAgent, setDeliveryAgent] = useState<IDeliveryAgent | null>(
    null
  );
  const [productNames, setProductNames] = useState<{ [key: string]: string }>(
    {}
  );
  const { token } = useSelector(selectAuth);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
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
        console.log("deliveryData", deliveryData);
        setDelivery(deliveryData);

        // Fetch delivery agent details if agentId exists
        if (deliveryData.deliveryAgentId) {
          const agentResponse = await axios.get(
            `http://localhost:3800/api/delivery/agents/${deliveryData.deliveryAgentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setDeliveryAgent(agentResponse.data);
        }

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

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, token]);

  const updateDeliveryStatus = async (statusUpdate: DeliveryStatusUpdate) => {
    try {
      const response = await axios.put(
        `http://localhost:3800/api/delivery/${delivery?._id}/status`,
        statusUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDelivery(response.data);
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  };

  const renderDeliveryAgentControls = () => {
    if (!delivery || !delivery.agentId) return null;

    return (
      <div className="mt-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Delivery Controls</h3>
        <div className="flex gap-4">
          {delivery.status === "CONFIRMED" && (
            <button
              onClick={() => updateDeliveryStatus({ status: "ONTHEWAY" })}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Mark as Picked Up
            </button>
          )}
          {delivery.status === "ONTHEWAY" && (
            <button
              onClick={() => updateDeliveryStatus({ status: "SHIPPED" })}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Start Delivery
            </button>
          )}
          {delivery.status === "SHIPPED" && (
            <button
              onClick={() => updateDeliveryStatus({ status: "DELIVERED" })}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Mark as Delivered
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!order) {
    return <div className="p-4">Loading...</div>;
  }

  console.log(order);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Order #{order._id}</h2>
        <p className="text-gray-600">
          <Clock className="inline-block w-4 h-4 mr-1" />
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      <OrderTracker order={order} status={delivery?.status as string} />

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Delivery Details</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-500 mt-1" />
              <div className="ml-3">
                <p className="font-medium">Delivery Address</p>
                <p className="text-gray-600">{order.shippingAddress.street}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postal_code}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Order Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between items-center"
              >
                <div className="flex items-center">
                  <Package className="w-4 h-4 text-gray-500 mr-2" />
                  <span>{productNames[item.productId]}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${item.unitPrice.toFixed(2)} x {item.quantity}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {delivery && deliveryAgent && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <User className="w-5 h-5 text-blue-500" />
            <div className="ml-3">
              <p className="font-medium">Delivery Agent</p>
              <p className="text-gray-600">Name: {deliveryAgent.name}</p>
              <p className="text-gray-600">
                Contact: {deliveryAgent.phoneNumber}
              </p>
            </div>
          </div>
        </div>
      )}

      {renderDeliveryAgentControls()}
    </div>
  );
}
