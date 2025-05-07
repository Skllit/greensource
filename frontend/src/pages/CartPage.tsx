import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  getCustomerCart,
  removeFromCart,
  createOrder,
} from "../utils/services";
import { selectAuth } from "../store/slices/authSlice";
import { IProduct } from "../types/Product";
import { Address } from "../types/Customer";
import { IOrder, OrderStatus } from "../types/Order";

interface CartItem extends IProduct {
  quantity: number;
  stock: number;
}

interface StockError {
  productId: string;
  availableStock: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useSelector(selectAuth);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [stockErrors, setStockErrors] = useState<StockError[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (token && user.email) {
      fetchCartItems();
      fetchAddresses();
    }
  }, [token, user.email]);

  useEffect(() => {
    // overall total
    const total = cartItems.reduce(
      (sum, item) => sum + item.currentPrice * item.quantity,
      0
    );
    setTotalAmount(total);
  }, [cartItems]);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const resp = await getCustomerCart(token!, user.email!);
      const qtyMap = resp.data.reduce((m: any, it: any) => {
        m[it.productId] = (m[it.productId] || 0) + Number(it.quantity);
        return m;
      }, {});
      const uniqueIds = Array.from(
        new Set(resp.data.map((i: any) => i.productId))
      );

      const detailed = (
        await Promise.all(
          uniqueIds.map(async (pid) => {
            try {
              const p = await axios.get(
                `http://localhost:3800/api/products/${pid}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return {
                ...p.data,
                quantity: qtyMap[pid],
                stock: p.data.quantityAvailable,
              };
            } catch {
              return null;
            }
          })
        )
      ).filter((i): i is CartItem => !!i);

      setCartItems(detailed);
    } catch {
      setError("Failed to fetch cart items");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const resp = await axios.get(
        `http://localhost:3800/api/customers/api/customers/${user.email}/addresses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(resp.data.data);
      const def = resp.data.data.find((a: Address) => a.isDefault);
      if (def) setSelectedAddress(def);
    } catch {
      // ignore
    }
  };

  // grouping by farmer
  const grouped = cartItems.reduce(
    (acc: Record<string, CartItem[]>, it) => {
      (acc[it.farmerId] = acc[it.farmerId] || []).push(it);
      return acc;
    },
    {}
  );

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }
    setLoading(true);
    setError("");

    try {
      for (const farmerId of Object.keys(grouped)) {
        const items = grouped[farmerId];
        const subTotal = items.reduce(
          (s, i) => s + i.currentPrice * i.quantity,
          0
        );

        const orderData: Omit<IOrder, "_id"> = {
          consumerId: user.email!,
          farmerId,
          status: OrderStatus.PENDING,
          totalAmount: subTotal,
          shippingAddress: {
            street: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postal_code: selectedAddress.postal_code,
            country: selectedAddress.country,
          },
          items: items.map((i) => ({
            productId: i._id,
            quantity: i.quantity,
            unitPrice: i.currentPrice,
            totalPrice: i.currentPrice * i.quantity,
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const resp = await createOrder(token!, orderData);
        const oid = resp.data._id;
        await axios.post(
          `http://localhost:3800/api/customers/api/customers/${user.email}/orders`,
          { orderId: oid },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await axios.delete(
        `http://localhost:3800/api/customers/api/customers/${user.email}/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems([]);
      navigate("/consumer/orders");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to process one of the orders"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Your cart is empty</p>
        </div>
      ) : (
        <>          
          {/* Render items grouped by farmer */}
          {Object.entries(grouped).map(([farmerId, items]) => (
            <div key={farmerId} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Seller: {items[0].farmerName}
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center border rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-600">{item.description}</p>
                      <p className="text-sm text-gray-500">
                        ₹{item.currentPrice.toFixed(2)} / {item.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">
                        ₹{(item.currentPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-end">
                <span className="text-base font-semibold">
                  Subtotal: ₹
                  {items
                    .reduce((s, i) => s + i.currentPrice * i.quantity, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          {/* Address selection (same as before) */}
          {/* ...existing address JSX... */}

          {/* Overall total & checkout */}
          <div className="mt-8 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCheckout}
                disabled={loading || stockErrors.length > 0}
                className={`bg-green-600 text-white px-6 py-3 rounded-lg transition-colors ${
                  loading || stockErrors.length
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-700"
                }`}
              >
                {loading ? "Processing..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
