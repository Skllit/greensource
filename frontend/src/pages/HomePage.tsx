import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    // Redirect to the login page
    navigate("/login");
  };
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 mt-16">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 py-16 min-h-[25rem] flex items-center justify-center">
          <div className="container mx-auto px-4 relative">
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-7xl font-bold mb-10">
                <span className="inline-block animate-bounce">
                  <span className="text-green-400 hover:text-green-300 transition-colors duration-300 animate-pulse">Green</span>
                  <span className="text-blue-300 hover:text-blue-200 transition-colors duration-300 animate-pulse">Source</span>
                </span>{" "}
                <span className="block mt-4 text-white opacity-90">Marketplace</span>
              </h1>
              <button
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-4 rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-white"
                onClick={handleGetStarted}
              >
                Start Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-gradient-to-b from-white to-green-50 -mt-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="text-green-600 text-5xl mb-6">🌾</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Direct from Farmers
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Purchase fresh produce directly from local farmers, ensuring
                  they receive fair compensation
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="text-green-600 text-5xl mb-6">🚛</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get your fresh produce delivered straight to your doorstep
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="text-green-600 text-5xl mb-6">💰</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Better Prices</h3>
                <p className="text-gray-600 leading-relaxed">
                  Eliminate middlemen and get better prices for both farmers and
                  consumers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-white py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="h-56 bg-gradient-to-br from-green-400 to-emerald-600"></div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 text-gray-800">Organic Vegetables</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Fresh from local farms
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 text-xl font-bold">$4.99/kg</span>
                      <button className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors shadow-md hover:shadow-lg">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-16">
              <div className="text-white md:w-1/2">
                <h2 className="text-4xl font-bold mb-4">Are you a farmer?</h2>
                <p className="text-lg opacity-90 mb-6 leading-relaxed">
                  Join our platform and start selling your produce directly to consumers. 
                  Enjoy better profits, transparent pricing, and a direct connection with your customers.
                </p>
                <button
                  className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
                  onClick={handleGetStarted}
                >
                  Register as Farmer
                </button>
              </div>
              <div className="md:w-1/2 flex justify-end">
                <div className="bg-white p-6 rounded-xl shadow-xl transform hover:-translate-y-2 transition-all duration-300 max-w-md">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-4xl">👨‍🌾</span>
                    <h3 className="text-xl font-bold text-gray-800">Benefits</h3>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Direct access to customers
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Better profit margins
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Simple inventory management
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer/>
      </div>
    </>
  );
};

export default HomePage;
