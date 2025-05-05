import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 mt-16">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 py-16 min-h-[25rem] flex items-center justify-center">
          <div className="container mx-auto px-4 relative">
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-7xl font-bold mb-10">
                <span className="inline-block">
                  <span className="text-green-400">Green</span>
                  <span className="text-blue-300">Source</span>
                </span>{" "}
                <span className="block mt-4 text-white opacity-90">Admin Portal</span>
              </h1>
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-12 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                onClick={handleGetStarted}
              >
                Access Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Admin Features Section */}
        <div className="py-24 bg-gradient-to-b from-white to-blue-50 -mt-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="text-blue-600 text-5xl mb-6">👥</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  User Management
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Efficiently manage farmers and consumers. Control access, verify accounts,
                  and maintain user database.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="text-blue-600 text-5xl mb-6">📊</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Analytics Dashboard</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track platform metrics, monitor transactions, and analyze market trends
                  in real-time.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="text-blue-600 text-5xl mb-6">⚙️</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">System Controls</h3>
                <p className="text-gray-600 leading-relaxed">
                  Manage platform settings, moderate listings, and ensure quality control
                  across the marketplace.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Section */}
        <div className="bg-white py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
              Platform Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Active Users</h3>
                <p className="text-3xl font-bold">1,234</p>
                <p className="text-sm opacity-80">+12% from last month</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Total Sales</h3>
                <p className="text-3xl font-bold">$45,678</p>
                <p className="text-sm opacity-80">Last 30 days</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Active Listings</h3>
                <p className="text-3xl font-bold">567</p>
                <p className="text-sm opacity-80">Across all categories</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Support Tickets</h3>
                <p className="text-3xl font-bold">23</p>
                <p className="text-sm opacity-80">Pending resolution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button className="p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="block text-2xl mb-2">🔍</span>
                  <span className="font-semibold">Review Verifications</span>
                </button>
                <button className="p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="block text-2xl mb-2">📝</span>
                  <span className="font-semibold">Manage Products</span>
                </button>
                <button className="p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="block text-2xl mb-2">💬</span>
                  <span className="font-semibold">Support Tickets</span>
                </button>
                <button className="p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="block text-2xl mb-2">📊</span>
                  <span className="font-semibold">View Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-green-400">Green</span>
                <span className="text-blue-300">Source</span>
                <span className="text-gray-400 text-sm ml-2">Admin Portal</span>
              </h2>
              <p className="text-gray-400 text-sm">
                © 2024 GreenSource Marketplace. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
