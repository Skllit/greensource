import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { selectAuth } from "../store/slices/authSlice";
import { IOrder, OrderStatus } from "../types/Order";
import { Link } from "react-router-dom";

interface Order extends IOrder {
  _id: string;
}

export default function FarmerOrdersPage() {
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, user } = useSelector(selectAuth);

  // Filtered orders
  const activeOrders = orders.filter(
    (order) =>
      ![OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)
  );
  const completedOrders = orders.filter((order) =>
    [OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)
  );

  // Data fetching
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3800/api/orders/api/orders/${user.email}/farmers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sortedOrders = response.data.sort(
        (a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(sortedOrders);
    } catch (error) {
      setError("Failed to fetch orders");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Order status handlers
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus
  ) => {
    try {
      const order = await getOrderDetails(orderId);

      if (status === OrderStatus.CONFIRMED) {
        await processOrderConfirmation(order);
      } else if (
        status === OrderStatus.CANCELLED &&
        order.status === OrderStatus.CONFIRMED
      ) {
        await processOrderCancellation(order);
      }

      await updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      setError("Failed to update order status");
      console.error("Error updating order:", error);
    }
  };

  // Helper functions for order status updates
  const getOrderDetails = async (orderId: string) => {
    const response = await axios.get(
      `http://localhost:3800/api/orders/api/orders/${orderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus
  ) => {
    await axios.put(
      `http://localhost:3800/api/orders/api/orders/${orderId}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const processOrderConfirmation = async (order: Order) => {
    // Decrease product quantities
    for (const item of order.items) {
      await adjustProductQuantity(item.productId, -item.quantity);
    }

    // Prepare delivery data
    const deliveryData = await prepareDeliveryData(order);
    console.log("delivery data", deliveryData);

    // Create delivery entry
    await axios.post(
      "http://localhost:3800/api/delivery",
      deliveryData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update delivery agent's order count
    if (deliveryData.deliveryAgentId) {
      await axios.put(
        `http://localhost:3809/agents/${deliveryData.deliveryAgentId}/orderCount/increase`
      );
    }
  };

  const processOrderCancellation = async (order: Order) => {
    // Restore product quantities
    for (const item of order.items) {
      await adjustProductQuantity(item.productId, item.quantity);
    }
  };

  const adjustProductQuantity = async (
    productId: string,
    quantityChange: number
  ) => {
    const productResponse = await axios.get(
      `http://localhost:3800/api/products/${productId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const product = productResponse.data;
    const newQuantity = product.quantityAvailable + quantityChange;

    await axios.put(
      `http://localhost:3800/api/products/${productId}`,
      { quantityAvailable: newQuantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  // Updated prepareDeliveryData: fallback to any agent if no one is marked 'available'
  const prepareDeliveryData = async (order: Order) => {
    // Fetch farmer & consumer details
    const [farmerAddressRes, farmerDetailsRes, consumerDetailsRes] =
      await Promise.all([
        axios.get(
          `http://localhost:3800/api/farmers/api/farmers/${order.farmerId}/get/address`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `http://localhost:3800/api/farmers/api/farmers/${order.farmerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `http://localhost:3806/api/customers/${order.consumerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

    const farmerAddressData = farmerAddressRes.data[0];
    const farmerAddress = formatAddress(farmerAddressData);
    const farmerPhoneNumber = farmerDetailsRes.data.phone;

    const consumerAddressData = consumerDetailsRes.data.data.addresses[0];
    const consumerAddress = formatAddress(consumerAddressData);
    const consumerPhoneNumber = consumerDetailsRes.data.data.phone;

    // Try to fetch 'available' agents first
    let agentId;
    try {
      const availRes = await axios.get(
        `http://localhost:3800/api/delivery/api/agents/available`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (Array.isArray(availRes.data) && availRes.data.length > 0) {
        agentId = availRes.data[0]._id;
      } else {
        // fallback: fetch all agents and pick the one with the fewest orders
        const allRes = await axios.get(
          `http://localhost:3809/agents`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const agents = allRes.data;
        if (Array.isArray(agents) && agents.length > 0) {
          agents.sort((a: any, b: any) => a.orderCount - b.orderCount);
          agentId = agents[0]._id;
        }
      }
    } catch (err) {
      console.error("Error fetching agents, no assignment:", err);
    }

    return {
      orderId: order._id.toString(),
      farmerId: order.farmerId,
      consumerId: order.consumerId,
      deliveryAddress: consumerAddress,
      pickupAddress: farmerAddress,
      deliveryAgentId: agentId,
      orderPrice: order.totalAmount,
      farmerPhoneNumber,
      consumerPhoneNumber,
      status: "CONFIRMED",
    };
  };

  const formatAddress = (addressData: any) => {
    return `${addressData.street}, ${addressData.city}, ${addressData.state}, ${addressData.country}, ${addressData.postal_code}`;
  };

  // Order Card Component
  const OrderCard = ({ order }: { order: Order }) => {
    const [orderDetails, setOrderDetails] = useState<{ [key: string]: any }>({});
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
      const fetchOrderDetails = async () => {
        if (orderDetails[order._id]) return;
        try {
          const itemDetails = await Promise.all(
            order.items.map(async (item) => {
              const response = await axios.get(
                `http://localhost:3800/api/products/${item.productId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return { ...item, productDetails: response.data };
            })
          );
          setOrderDetails((prev) => ({ ...prev, [order._id]: itemDetails }));
        } catch (error) {
          console.error("Error fetching order details:", error);
        }
      };
      fetchOrderDetails();
    }, [order._id]);

    const canCancel = [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status);

    return (
      <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col h-full justify-between">
        <div className="flex-grow">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2 flex-wrap">
                Order <span className="text-gray-500 text-xs">#{order._id}</span>
              </h3>
              <p className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-sm ${
              order.status === OrderStatus.DELIVERED
                ? "bg-green-600 text-white"
                : order.status === OrderStatus.CONFIRMED
                ? "bg-green-200 text-green-800"
                : order.status === OrderStatus.PENDING || order.status === OrderStatus.ONTHEWAY || order.status === OrderStatus.SHIPPED
                ? "bg-yellow-100 text-yellow-800"
                : order.status === OrderStatus.CANCELLED
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}>{order.status}</span>
          </div>
          {/* Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {orderDetails[order._id]?.map((item: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded flex flex-col justify-between">
                <div>
                  <p className="font-medium text-sm">{item.productDetails.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div><p className="text-xs text-gray-500">Unit Price</p><p className="font-medium text-sm">₹{item.unitPrice.toFixed(2)}</p></div>
                  <div><p className="text-xs text-gray-500">Total</p><p className="font-medium text-sm">₹{item.totalPrice.toFixed(2)}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-sm">Total Amount:</span>
            <span className="font-bold text-base">₹{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {order.status === OrderStatus.PENDING && (
              <>              
                <button onClick={() => handleUpdateOrderStatus(order._id, OrderStatus.CONFIRMED)} className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 flex-1">Accept</button>
                <button onClick={() => handleUpdateOrderStatus(order._id, OrderStatus.CANCELLED)} className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 flex-1">Reject</button>
              </>
            )}
            {canCancel && order.status !== OrderStatus.PENDING && (
              <button onClick={() => handleUpdateOrderStatus(order._id, OrderStatus.CANCELLED)} disabled={cancelling} className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:bg-red-300 flex-1">
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
            <Link to={`/farmer/orders/${order._id}`} className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 text-center flex-1">View Details</Link>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"><div className="text-center text-gray-600">Loading...</div></div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Active Orders</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {activeOrders.length > 0 ? activeOrders.map((order) => <OrderCard key={order._id} order={order} />) : <p className="text-gray-500 text-center py-4 col-span-full">No active orders</p>}
      </div>

      <h2 className="text-xl md:text-2xl font-bold mb-6 mt-8">Completed & Cancelled Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedOrders.length > 0 ? completedOrders.map((order) => <OrderCard key={order._id} order={order} />) : <p className="text-gray-500 text-center py-4 col-span-full">No completed or cancelled orders</p>}
      </div>
    </div>
  );
}
