import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { User, Truck, ShieldCheck, PackageCheck, Clock, Calendar } from 'lucide-react';

interface IdProof {
  type: string;
  value: string;
}

interface Vehicle {
  type: string;
  model: string;
  registrationId: string;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  orderCount: number;
  serviceLocations: string[];
  deliveredOrders: string[];
  isAvailable: boolean;
  idProof: IdProof;
  vehicle: Vehicle;
  createdAt: string;
  updatedAt: string;
}

const AgentProfile: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const { user, token } = useSelector(selectAuth);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3800/api/delivery/agent/email/${user?.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAgent(res.data);
      } catch (err) {
        console.error('Error fetching agent:', err);
      }
    };

    if (user?.email) {
      fetchAgent();
    }
  }, [user?.email, token]);

  if (!agent) return <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 p-8">Loading...</div>;

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
              {agent.name}
            </h1>
            <div className="mt-2 flex items-center">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${agent.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {agent.isAvailable ? 'Available' : 'Not Available'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Agent Details Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Agent Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">Email</div>
                  <div className="w-2/3 font-semibold">{agent.email}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">Phone</div>
                  <div className="w-2/3 font-semibold">{agent.phoneNumber}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">Orders Delivered</div>
                  <div className="w-2/3 font-semibold flex items-center">
                    <PackageCheck className="mr-2 text-emerald-600" size={18} />
                    {agent.orderCount}
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">Service Areas</div>
                  <div className="w-2/3">
                    {agent.serviceLocations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {agent.serviceLocations.map((location, index) => (
                          <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                            {location}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No service areas specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-6">
                <Truck className="text-emerald-600 mr-2" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Vehicle Information
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">Type</div>
                  <div className="w-2/3 font-semibold">{agent.vehicle?.type || 'Not specified'}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">Model</div>
                  <div className="w-2/3 font-semibold">{agent.vehicle?.model || 'Not specified'}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">Registration</div>
                  <div className="w-2/3 font-semibold">{agent.vehicle?.registrationId || 'Not specified'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* ID Proof Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-6">
                <ShieldCheck className="text-emerald-600 mr-2" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  ID Proof
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">Type</div>
                  <div className="w-2/3 font-semibold">{agent.idProof?.type || 'Not provided'}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">ID Number</div>
                  <div className="w-2/3 font-semibold">{agent.idProof?.value || 'Not provided'}</div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-6">
                <Clock className="text-emerald-600 mr-2" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Activity
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">Member Since</div>
                  <div className="w-2/3 font-semibold flex items-center">
                    <Calendar className="mr-2 text-emerald-600" size={18} />
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-gray-600 font-medium">Last Updated</div>
                  <div className="w-2/3 font-semibold flex items-center">
                    <Calendar className="mr-2 text-emerald-600" size={18} />
                    {new Date(agent.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivered Orders Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-6">
                <PackageCheck className="text-emerald-600 mr-2" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Deliveries
                </h2>
              </div>
              <div className="max-h-60 overflow-y-auto pr-2">
                {agent.deliveredOrders.length > 0 ? (
                  <ul className="space-y-2">
                    {agent.deliveredOrders.slice(0, 5).map((id, index) => (
                      <li key={index} className="p-2 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">Order #{id}</div>
                      </li>
                    ))}
                    {agent.deliveredOrders.length > 5 && (
                      <li className="text-center text-sm text-gray-500 mt-2">
                        +{agent.deliveredOrders.length - 5} more deliveries
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No deliveries yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentProfile;