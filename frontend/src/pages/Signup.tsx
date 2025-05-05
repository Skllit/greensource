import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupStart, signupFailure } from "../store/slices/authSlice";
import axios from "axios";
import type { RootState } from "../store";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [userType, setUserType] = useState<"consumer" | "farmer">("consumer");
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      isDefault: true,
    },
  });

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear validation errors when user types
    if (Object.keys(validationErrors).includes(name)) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character";
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (userType === "farmer" && !phoneRegex.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(signupStart());

    const signupData = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
      role: userType,
    };

    try {
      const response = await axios.post(
        "http://localhost:3800/api/auth/register",
        signupData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      let responseData;
      if (userType === "farmer") {
        responseData = await axios.post(
          "http://localhost:3805/api/farmers",
          {
            addresses: showAddressForm ? [formData.address] : [],
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            is_verified: false,
            list_products: [],
            list_sales: [],
          },
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${response.data.token}`,
            },
          }
        );
        console.log('Address',formData.address);
        console.log('Farmer data = ',responseData);
      } else {
        console.log('Customer data = ', formData.phone);
        responseData = await axios.post(
          "http://localhost:3806/api/customers",
          {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            role: userType,
            cart: [],
            wishlist: [],
            orders: [],
            addresses: showAddressForm ? [formData.address] : [],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${response.data.token}`,
            },
          }
        );
      }

      if (response.data && responseData.data) {
        dispatch({
          type: "auth/signupSuccess",
          payload: response.data,
        });

        navigate("/login");
      }
    } catch (error) {
      dispatch(
        signupFailure(error instanceof Error ? error.message : "Signup failed")
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      <Navbar />
      <div className="mt-20"></div>
      <div className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 transform hover:scale-[1.01] transition-all duration-300 animate-fadeIn border border-blue-100">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Create Account
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 shadow-lg animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* User Type Selection */}
            <div className="flex justify-center space-x-8 mb-4">
              <label className="inline-flex items-center group cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="consumer"
                  checked={userType === "consumer"}
                  onChange={(e) =>
                    setUserType(e.target.value as "consumer" | "farmer")
                  }
                  className="form-radio h-4 w-4 text-blue-500 focus:ring-blue-400"
                />
                <span className="ml-2 text-gray-700 group-hover:text-blue-600 transition-colors">
                  Consumer
                </span>
              </label>
              <label className="inline-flex items-center group cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="farmer"
                  checked={userType === "farmer"}
                  onChange={(e) =>
                    setUserType(e.target.value as "consumer" | "farmer")
                  }
                  className="form-radio h-4 w-4 text-green-500 focus:ring-green-400"
                />
                <span className="ml-2 text-gray-700 group-hover:text-green-600 transition-colors">
                  Farmer
                </span>
              </label>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="transform transition-all duration-200 hover:translate-x-1">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="transform transition-all duration-200 hover:translate-x-1">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="transform transition-all duration-200 hover:translate-x-1">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="transform transition-all duration-200 hover:translate-x-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border ${
                  validationErrors.email ? "border-red-500" : "border-blue-200"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div className="transform transition-all duration-200 hover:translate-x-1">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required  // Required for both
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border ${
                  validationErrors.phone
                    ? "border-red-500"
                    : "border-blue-200"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
              />
              {validationErrors.phone && (
                <p className="mt-1 text-xs text-red-500">
                  {validationErrors.phone}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="transform transition-all duration-200 hover:translate-x-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border ${
                    validationErrors.password
                      ? "border-red-500"
                      : "border-blue-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                />
                {validationErrors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {validationErrors.password}
                  </p>
                )}
              </div>
              <div className="transform transition-all duration-200 hover:translate-x-1">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border ${
                    validationErrors.confirmPassword
                      ? "border-red-500"
                      : "border-blue-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                />
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Address Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="addAddress"
                checked={showAddressForm}
                onChange={(e) => setShowAddressForm(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <label htmlFor="addAddress" className="text-sm text-gray-700">
                Add address now
              </label>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <div className="space-y-3 p-3 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50/50 to-green-50/50">
                <h3 className="text-base font-medium bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Address Details
                </h3>
                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <label
                    htmlFor="street"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="address.street"
                    required={showAddressForm}
                    value={formData.address.street}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="address.city"
                      required={showAddressForm}
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700"
                    >
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="address.state"
                      required={showAddressForm}
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="address.country"
                      required={showAddressForm}
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label
                      htmlFor="postal_code"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      name="address.postal_code"
                      required={showAddressForm}
                      value={formData.address.postal_code}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-1.5 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-1.5 px-4 rounded-lg font-medium text-base hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transform transition-all duration-300 ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20"
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          <div>
            <p className="text-center mt-4 text-gray-600 text-sm">
              Already have an account?{" "}
              <NavLink
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent font-medium hover:from-blue-700 hover:to-green-700 transition-colors hover:underline"
              >
                Sign in
              </NavLink>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-10"></div>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Signup;
