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
      // Fetch data from all services in parallel
      const [customers, farmers, products, orders] = await Promise.all([
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

      // Calculate active customers this month
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      const activeCustomers = orders.data
        .filter((order: any) => new Date(order.createdAt) >= firstDayOfMonth)
        .map((order: any) => order.customerEmail)
        .filter(
          (value: string, index: number, self: string[]) =>
            self.indexOf(value) === index
        );

      // Calculate new customers this month
      const newCustomers = customers.data.data.filter(
        (customer: any) => new Date(customer.createdAt) >= firstDayOfMonth
      );

      // Calculate product statistics
      const productStats = {
        total: products.data.length,
        active: products.data.filter((p: any) => p.isActive).length,
        outOfStock: products.data.filter((p: any) => p.quantity === 0).length,
        byCategory: products.data.reduce((acc: any, product: any) => {
          acc[product.category] = (acc[product.category] || 0) + 1;
          return acc;
        }, {}),
      };

      // Calculate order statistics
      const totalRevenue = orders.data.reduce(
        (sum: number, order: any) => sum + order.totalAmount,
        0
      );
      const adminCommission = totalRevenue * 0.05; // 5% commission

      const analyticsData = {
        consumers: {
          total: customers.data.data.length,
          activeThisMonth: activeCustomers.length,
          newThisMonth: newCustomers.length,
        },
        farmers: {
          total: farmers.data.length,
          verified: farmers.data.filter((f: any) => f.is_verified).length,
          pendingVerification: farmers.data.filter((f: any) => !f.is_verified)
            .length,
        },
        products: productStats,
        orders: {
          total: orders.data.length,
          delivered: orders.data.filter((o: any) => o.status === "delivered")
            .length,
          pending: orders.data.filter((o: any) => o.status === "pending")
            .length,
          totalRevenue,
          adminCommission,
        },
      };

      setAnalytics(analyticsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to fetch analytics data");
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 md:p-6 lg:p-8">Loading...</div>;
  if (error)
    return <div className="p-4 md:p-6 lg:p-8 text-red-500">{error}</div>;
  if (!analytics) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Consumer Analytics */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Consumer Analytics</h2>
          <div className="space-y-2">
            <p>Total Consumers: {analytics.consumers.total}</p>
            <p>Active This Month: {analytics.consumers.activeThisMonth}</p>
            <p>New This Month: {analytics.consumers.newThisMonth}</p>
          </div>
        </div>

        {/* Farmer Analytics */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Farmer Analytics</h2>
          <div className="space-y-2">
            <p>Total Farmers: {analytics.farmers.total}</p>
            <p>Verified Farmers: {analytics.farmers.verified}</p>
            <p>Pending Verification: {analytics.farmers.pendingVerification}</p>
          </div>
        </div>

        {/* Product Analytics */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Product Analytics</h2>
          <div className="space-y-2">
            <p>Total Products: {analytics.products.total}</p>
            <p>Active Products: {analytics.products.active}</p>
            <p>Out of Stock: {analytics.products.outOfStock}</p>
          </div>
        </div>

        {/* Income Analytics */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Income Analytics</h2>
          <div className="space-y-2">
            <p>Total Orders: {analytics.orders.total}</p>
            <p>Delivered Orders: {analytics.orders.delivered}</p>
            <p>Total Revenue: ${analytics.orders.totalRevenue.toFixed(2)}</p>
            <p className="text-green-600 font-semibold">
              Company Revenue: ${analytics.orders.adminCommission.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Product Categories Distribution */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">
          Product Categories Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(analytics.products.byCategory).map(
            ([category, count]) => (
              <div key={category} className="text-center">
                <p className="font-medium">{category}</p>
                <p className="text-gray-600">{count} products</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
