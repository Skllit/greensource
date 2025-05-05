import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import { toast } from "react-toastify";
import { loginStart, loginFailure } from "../store/slices/authSlice";
import axios, { AxiosResponse } from "axios";
import type { RootState } from "../store";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    userType: "consumer",
  });

  const [validationErrors, setValidationErrors] = useState({
    identifier: "",
    password: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear validation errors when user starts typing
    setValidationErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    const emailError = validateEmail(formData.identifier);

    setValidationErrors({
      identifier: emailError,
      password: "",
    });

    if (emailError) {
      return;
    }

    dispatch(loginStart());

    const loginData = {
      email: formData.identifier,
      password: formData.password,
      role: formData.userType,
    };

    try {
      const response = await axios.post(
        "http://localhost:3800/api/auth/login",
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const validateResponse = await axios.get(
        "http://localhost:3800/api/auth/validate",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${response.data.token}`,
          },
        }
      );
      console.log(response.data, validateResponse.data);
      let url;
      if (formData.userType === "consumer") {
        url = `http://localhost:3806/api/customers/login`;
      } 
      else if (formData.userType === "farmer") {
        url = `http://localhost:3805/api/login`;
      }

      let responseData: AxiosResponse<never, never>;
     
      if (url) {
       
        responseData = await axios.post(url, loginData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log(responseData.data);
      } else {
        throw new Error("URL not defined for the specified user type");
      }

      if (response.data && response.data.token && responseData.data) {
        dispatch({
          type: "auth/loginSuccess",
          payload: response.data,
        });
        //  toast.success("Logged in successfully!", {
        //   position: "bottom-center"
        // });
        if (formData.userType === "consumer") {     
          navigate("/consumer/products");
        } else {
          navigate("/farmer/products");
        }
      }
    } catch (error) {
      dispatch(
        loginFailure(error instanceof Error ? error.message : "Login failed")
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      <div className="mt-10"></div>
      <div className="container mx-auto px-4 max-w-md pt-20">
        <div className="bg-white shadow-lg rounded-2xl p-10 transform hover:scale-[1.01] transition-all duration-300 animate-fadeIn border border-blue-100">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Welcome Back!</h1>
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 shadow-lg animate-shake">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center space-x-8 mb-6">
              <label className="inline-flex items-center group cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="consumer"
                  checked={formData.userType === "consumer"}
                  onChange={handleInputChange}
                  className="form-radio h-5 w-5 text-blue-500 focus:ring-blue-400"
                />
                <span className="ml-3 text-gray-700 group-hover:text-blue-600 transition-colors">Consumer</span>
              </label>
              <label className="inline-flex items-center group cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="farmer"
                  checked={formData.userType === "farmer"}
                  onChange={handleInputChange}
                  className="form-radio h-5 w-5 text-green-500 focus:ring-green-400"
                />
                <span className="ml-3 text-gray-700 group-hover:text-green-600 transition-colors">Farmer</span>
              </label>
            </div>
            <div className="space-y-4">
              <div className="transform transition-all duration-200 hover:translate-x-1">
                <input
                  type="email"
                  id="identifier"
                  name="identifier"
                  required
                  autoFocus
                  value={formData.identifier}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-green-50 border ${
                    validationErrors.identifier ? 'border-red-500' : 'border-blue-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500`}
                  placeholder="Email"
                />
                {validationErrors.identifier && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.identifier}</p>
                )}
              </div>
              <div className="transform transition-all duration-200 hover:translate-x-1">
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-6 rounded-lg font-medium text-lg hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transform transition-all duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20"
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div>
            <p className="text-center mt-8 text-gray-600">
              Don't have an account?{" "}
              <NavLink
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent font-medium hover:from-blue-700 hover:to-green-700 transition-colors hover:underline"
              >
                Sign up
              </NavLink>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20"></div>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Login;
