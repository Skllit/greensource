import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAuth, logout } from "../store/slices/authSlice";
import {
  ShoppingCart,
  User,
  Package,
  Heart,
  Clock,
  Menu,
  Activity,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const ConsumerDashboard = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useSelector(selectAuth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const [cartCount, setCartCount] = useState(0);
  // const [savedCount, setSavedCount] = useState(0);
  // const [orderCount, setOrderCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignout = () => {
    dispatch(logout());
    navigate("/");
  };

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!token || !user?.email) {
        console.log("No token or email available");
        return;
      }

      try {
        const response = await axios({
          method: "GET",
          url: `http://localhost:3800/api/customers/api/customers/${user.email}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        // setCartCount(response.data.data.cart?.length);
        // setSavedCount(response.data.data.wishlist?.length);
        // setOrderCount(response.data.data.orders?.length);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching customer details:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });

          // Handle unauthorized access
          if (error.response?.status === 401) {
            dispatch(logout());
            navigate("/login");
          }
        } else {
          console.error("Error fetching customer details:", error);
        }
      }
    };
    fetchCustomerDetails();
  }, [user?.email, token, dispatch, navigate]);

  const menuItems = [
    {
      icon: <Package className="w-5 h-5" />,
      label: "Products",
      path: "/consumer/products",
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: "Cart",
      path: "/consumer/cart",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Orders",
      path: "/consumer/orders",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: "Saved",
      path: "/consumer/saved",
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "Profile",
      path: "/consumer/profile",
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: "Market Prices",
      path: "/consumer/market-prices",
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (user && user.userType === "farmer") {
    setTimeout(() => {
      navigate("/farmer/profile");
    }, 2000);
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">You are not authorized to access this page</h1>
        <h1 className="text-lg text-gray-600">Redirecting to farmer profile page...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-md text-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <span className="text-blue-600">Green</span>
          <span className="text-green-500">Source</span>
        </h1>
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed md:sticky md:top-0
        w-64 h-[100dvh]
        bg-white
        text-gray-800
        shadow-lg
        transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
        z-50
      `}
      >
        <div className="flex flex-col h-full">
          <div className="hidden md:block p-5 border-b border-gray-200">
            <h1 className="text-xl font-bold">
              <span className="text-blue-600">Green</span>
              <span className="text-green-500">Source</span>
            </h1>
          </div>

          <nav className="flex-1 p-4">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 mb-2 rounded-lg transition-all duration-200 font-semibold ${
                  item.path === window.location.pathname
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-end px-4 md:px-6 py-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm md:text-base">
                Welcome, {user?.username || "User"}
              </span>
              <button
                onClick={handleSignout}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 mt-16">{children}</main>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
