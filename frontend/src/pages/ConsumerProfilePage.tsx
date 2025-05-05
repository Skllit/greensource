import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import axios from "axios";
import { selectAuth } from "../store/slices/authSlice";
import { useSelector } from "react-redux";

interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  isDefault: boolean;
}

interface CustomerProfile {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: Address[];
}

const ConsumerProfilePage: React.FC = () => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerProfile>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    addresses: [],
  });
  const [newAddress, setNewAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    isDefault: false,
  });

  // Get user email from localStorage
  const { user } = useSelector(selectAuth);
  const userEmail = user?.email;

  const fetchCustomerProfile = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3806/api/customers/${userEmail}`
      );
      const profileData = response.data.data;
      setCustomerData({
        email: profileData.email || "",
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phone: profileData.phone || "",
        addresses: profileData.addresses || [],
      });
    } catch (error) {
      console.error("Error fetching customer profile:", error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchCustomerProfile();
    }
  }, [userEmail]);

  const handleProfileUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3806/api/customers/${userEmail}`,
        {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
        }
      );

      setCustomerData({
        ...customerData,
        ...response.data,
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAddAddress = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3806/api/customers/${userEmail}/addresses`,
        newAddress
      );
      const newAddressWithId = response.data.data;

      // Fetch updated profile data to ensure we have the latest state
      await fetchCustomerProfile();

      setIsAddingAddress(false);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        isDefault: false,
      });
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      // Call the delete address endpoint
      await axios.delete(
        `http://localhost:3806/api/customers/${userEmail}/addresses/${addressId}`
      );

      // Fetch updated profile data to ensure we have the latest state
      await fetchCustomerProfile();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  if (!customerData.email) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <User size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {customerData.firstName} {customerData.lastName}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Details Card */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Profile Details
                </h2>
                {isEditingProfile ? (
                  <button
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-md"
                    onClick={handleProfileUpdate}
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-white disabled:border-transparent transition-all text-xl font-bold text-gray-900"
                    placeholder="First Name"
                    value={customerData.firstName}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        firstName: e.target.value,
                      })
                    }
                    disabled={!isEditingProfile}
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-white disabled:border-transparent transition-all text-xl font-bold text-gray-900"
                    placeholder="Last Name"
                    value={customerData.lastName}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        lastName: e.target.value,
                      })
                    }
                    disabled={!isEditingProfile}
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-white disabled:border-transparent transition-all text-xl font-bold text-gray-900"
                    placeholder="Phone Number"
                    value={customerData.phone}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        phone: e.target.value,
                      })
                    }
                    disabled={!isEditingProfile}
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-xl font-bold text-gray-900"
                    value={customerData.email}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 h-[400px] relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Delivery
                  <br />
                  Addresses
                </h2>
                <button
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-md text-sm"
                  onClick={() => setIsAddingAddress(true)}
                >
                  Add New
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto h-[300px] pr-2">
                {customerData.addresses.map((address, index) => (
                  <div
                    key={address._id || index}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900">
                          {address.street}
                        </p>
                        <p className="text-gray-800 font-medium">
                          {address.city}, {address.state}
                        </p>
                        <p className="text-gray-800 font-medium">
                          {address.country}, {address.postal_code}
                        </p>
                        {address.isDefault && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            Default Address
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(address._id!)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {isAddingAddress && (
                <div className="absolute inset-0 bg-white rounded-2xl p-6 z-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Add New Address
                  </h3>
                  <div className="space-y-4 overflow-y-auto h-[280px] pr-2">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">
                        Street
                      </label>
                      <input
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            street: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">
                        City
                      </label>
                      <input
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">
                        State
                      </label>
                      <input
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">
                        Country
                      </label>
                      <input
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newAddress.country}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            country: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">
                        Zip Code
                      </label>
                      <input
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newAddress.postal_code}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            postal_code: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={newAddress.isDefault}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            isDefault: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <label
                        htmlFor="isDefault"
                        className="ml-2 text-sm font-medium text-gray-900"
                      >
                        Set as default address
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-4">
                    <button
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                      onClick={() => setIsAddingAddress(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-md"
                      onClick={handleAddAddress}
                    >
                      Add Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerProfilePage;
