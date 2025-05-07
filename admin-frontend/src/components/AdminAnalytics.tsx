import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";

interface Analytics {
  consumers: {
    total: number;
    activeThisMonth: number;
    newThisMonth: number;
  };
  farmers: {
    total: number;
    verified: number;
    pendingVerification: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
    byCategory: {
      [key: string]: number;
    };
  };
  orders: {
    total: number;
    delivered: number;
    pending: number;
    totalRevenue: number;
    adminCommission: number;
  };
}

export default function AdminAnalytics() {
  const { token } = useSelector(selectAuth);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      // Fetch all services in parallel
      const [customersRes, farmersRes, productsRes, ordersRes] =
        await Promise.all([
          axios.get("http://localhost:3800/api/customers/api/customers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3800/api/farmers/api/farmers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3800/api/products", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3800/api/orders/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      const customers = customersRes.data.data;
      const farmers = farmersRes.data;
      const products = productsRes.data;
      const orders = ordersRes.data;

      // Date calculations
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Consumer analytics
      const activeCustomers = Array.from(
        new Set(
          orders
            .filter((o: any) => new Date(o.createdAt) >= firstOfMonth)
            .map((o: any) => o.consumerId || o.customerEmail)
        )
      );
      const newCustomers = customers.filter(
        (c: any) => new Date(c.createdAt) >= firstOfMonth
      );

      // Product analytics with correct field
      const totalProducts = products.length;
      const activeProducts = products.filter((p: any) => p.isActive).length;
      const outOfStock = products.filter(
        (p: any) => p.quantityAvailable <= 0
      ).length;
      const byCategory = products.reduce((acc: any, p: any) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});

      // Order analytics
      const totalRevenue = orders.reduce(
        (sum: number, o: any) => sum + (o.totalAmount || 0),
        0
      );
      const adminCommission = totalRevenue * 0.05;

      // Compose analytics
      const analyticsData: Analytics = {
        consumers: {
          total: customers.length,
          activeThisMonth: activeCustomers.length,
          newThisMonth: newCustomers.length,
        },
        farmers: {
          total: farmers.length,
          verified: farmers.filter((f: any) => f.is_verified).length,
          pendingVerification: farmers.filter((f: any) => !f.is_verified)
            .length,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          outOfStock,
          byCategory,
        },
        orders: {
          total: orders.length,
          delivered: orders.filter((o: any) =>
            ["DELIVERED", "delivered"].includes(o.status)
          ).length,
          pending: orders.filter((o: any) =>
            ["PENDING", "pending"].includes(o.status)
          ).length,
          totalRevenue,
          adminCommission,
        },
      };

      setAnalytics(analyticsData);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError("Failed to fetch analytics data");
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!analytics) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Consumers */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Consumer Analytics</h2>
          <p>Total: {analytics.consumers.total}</p>
          <p>Active This Month: {analytics.consumers.activeThisMonth}</p>
          <p>New This Month: {analytics.consumers.newThisMonth}</p>
        </div>
        {/* Farmers */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Farmer Analytics</h2>
          <p>Total: {analytics.farmers.total}</p>
          <p>Verified: {analytics.farmers.verified}</p>
          <p>Pending: {analytics.farmers.pendingVerification}</p>
        </div>
        {/* Products */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Product Analytics</h2>
          <p>Total: {analytics.products.total}</p>
          <p>Active: {analytics.products.active}</p>
          <p>Out of Stock: {analytics.products.outOfStock}</p>
        </div>
        {/* Orders */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Income Analytics</h2>
          <p>Total Orders: {analytics.orders.total}</p>
          <p>Delivered: {analytics.orders.delivered}</p>
          <p>Total Revenue: ₹{analytics.orders.totalRevenue.toFixed(2)}</p>
          <p className="text-green-600 font-semibold">
            Commission: ₹{analytics.orders.adminCommission.toFixed(2)}
          </p>
        </div>
      </div>
      {/* Category Distribution */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(analytics.products.byCategory).map(
            ([cat, cnt]) => (
              <div key={cat} className="text-center">
                <p className="font-medium">{cat}</p>
                <p className="text-gray-600">{cnt}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
