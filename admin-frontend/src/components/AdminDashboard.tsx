import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth, logout } from "../store/slices/authSlice";
import {
  Users,
  ShoppingBag,
  Activity,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  PackageCheck,
} from "lucide-react";
import { useState } from "react";

const AdminDashboard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  const handleSignout = () => {
    dispatch(logout());
    navigate("/");
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Overview",
      path: "/admin/dashboard",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Users",
      path: "/admin/users",
      subItems: [
        {
          label: "Farmers",
          path: "/admin/users/farmers",
        },
        {
          label: "Consumers",
          path: "/admin/users/consumers",
        },
        {
          label: "Delivery Agents",
          path: "/admin/users/delivery-agents",
        },
        {
          label: "Admins",
          path: "/admin/users/admins",
        }
      ],
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: "Products",
      path: "/admin/products",
    },
    {
      icon: <PackageCheck className="w-5 h-5" />,
      label: "Orders",
      path: "/admin/orders",
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: "Analytics",
      path: "/admin/analytics",
    },
    // {
    //   icon: <Settings className="w-5 h-5" />,
    //   label: "Settings",
    //   path: "/admin/settings",
    // },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleUsers = () => {
    setIsUsersOpen(!isUsersOpen);
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
              <div key={item.path}>
                <button
                  onClick={() => {
                    if (item.subItems) {
                      toggleUsers();
                    } else {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3 mb-2 rounded-lg transition-all duration-200 font-semibold ${
                    item.path === window.location.pathname ||
                    (item.subItems &&
                      item.subItems.some(
                        (sub) => sub.path === window.location.pathname
                      ))
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.subItems &&
                    (isUsersOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    ))}
                </button>

                {item.subItems && isUsersOpen && (
                  <div className="ml-8">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.path}
                        onClick={() => {
                          navigate(subItem.path);
                          setIsSidebarOpen(false);
                        }}
                        className={`flex items-center w-full px-4 py-2 mb-2 rounded-lg transition-all duration-200 font-semibold ${
                          subItem.path === window.location.pathname
                            ? "bg-blue-500 text-white shadow-lg"
                            : "text-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-end px-4 md:px-6 py-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 font-semibold text-sm md:text-base">
                Welcome, {user?.username || "Admin"}
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

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
