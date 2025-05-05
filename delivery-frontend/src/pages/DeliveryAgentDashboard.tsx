import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth, logout } from "../store/slices/authSlice";
import {
  Truck,
  ClipboardCheck,
  User,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";

const DeliveryAgentDashboard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignout = () => {
    dispatch(logout());
    navigate("/");
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Overview",
      path: "/delivery",
    },
    {
      icon: <Truck className="w-5 h-5" />,
      label: "Active Deliveries",
      path: "/delivery/active",
    },
    {
      icon: <ClipboardCheck className="w-5 h-5" />,
      label: "Completed Deliveries",
      path: "/delivery/completed",
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "My Profile",
      path: "/delivery/profile",
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-md text-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <span className="text-blue-600">Green</span>
          <span className="text-green-500">Source</span>
        </h1>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
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
        w-72 h-[100dvh]
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
              <div key={item.path}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3 mb-2 rounded-lg transition-all duration-200 font-semibold ${
                    item.path === window.location.pathname
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </button>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-end px-4 md:px-6 py-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 font-semibold text-sm md:text-base">
                Welcome, {user?.username || "Delivery Agent"}
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

export default DeliveryAgentDashboard;
