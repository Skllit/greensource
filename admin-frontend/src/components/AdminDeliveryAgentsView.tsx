import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

interface DeliveryAgent {
  _id: string;
  email: string;
  name: string;
  phoneNumber: string;
  serviceLocations: string[];
  orderCount: number;
  isAvailable: boolean;
  idProof: {
    type: "aadhaar" | "pan" | "voter";
    value: string;
  };
  vehicle: {
    type: "bike" | "van" | "truck";
    model: string;
    registrationId: string;
  };
  deliveries?: {
    _id: string;
    orderId: string;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminDeliveryAgentsView() {
  const { token } = useSelector(selectAuth);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState<Partial<DeliveryAgent>>({
    serviceLocations: [],
    orderCount: 0,
    isAvailable: true,
    idProof: {
      type: "aadhaar",
      value: "",
    },
    vehicle: {
      type: "bike",
      model: "",
      registrationId: "",
    },
  });

  useEffect(() => {
    fetchDeliveryAgents();
  }, []);

  const fetchDeliveryAgents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3800/api/delivery/agents",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const agentsWithDetails = await Promise.all(
        response.data.map(async (agent: DeliveryAgent) => {
          const deliveriesRes = await axios.get(
            `http://localhost:3800/api/delivery/agents/${agent._id}/deliveries`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          return {
            ...agent,
            deliveries: deliveriesRes.data,
          };
        })
      );

      setDeliveryAgents(agentsWithDetails);
      const initialExpandedState = agentsWithDetails.reduce(
        (acc, agent) => ({
          ...acc,
          [agent._id]: false,
        }),
        {}
      );
      setExpandedSections(initialExpandedState);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching delivery agents:", error);
      setError("Failed to fetch delivery agents data");
      setLoading(false);
    }
  };

  const handleAddAgent = async () => {
    try {
      await axios.post("http://localhost:3800/api/delivery/agents", newAgent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddModal(false);
      setNewAgent({
        serviceLocations: [],
        orderCount: 0,
        isAvailable: true,
        idProof: {
          type: "aadhaar",
          value: "",
        },
        vehicle: {
          type: "bike",
          model: "",
          registrationId: "",
        },
      });
      await axios.post("http://localhost:3800/api/auth/register", {
        username: newAgent.name,
        email: newAgent.email,
        password: "agent@123",
        role: "delivery_agent",
      }, { headers: { "Content-Type": "application/json" } });
      fetchDeliveryAgents();
    } catch (error) {
      console.error("Error adding delivery agent:", error);
      setError("Failed to add delivery agent");
    }
  };
  console.log(deliveryAgents)

  const handleDeleteAgent = async (agentId: string) => {
    try {
      console.log(agentId)
      await axios.delete(
        `http://localhost:3800/api/delivery/agents/${agentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchDeliveryAgents();
    } catch (error) {
      console.error("Error deleting delivery agent:", error);
      setError("Failed to delete delivery agent");
    }
  };

  const toggleSection = (agentId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Delivery Agents Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors text-sm"
        >
          <Plus size={16} />
          Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliveryAgents.map((agent) => (
          <div
            key={agent.email}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 w-full"
          >
            <div className="flex flex-col gap-4">
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {agent.name.split(" ")[0].charAt(0)}
                      {agent.name.split(" ")[1]?.charAt(0)}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold">{agent.name}</h2>
                </div>
                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span className="break-all">{agent.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Phone:</span>
                    {agent.phoneNumber}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`${
                        agent.isAvailable ? "text-green-600" : "text-red-600"
                      } font-medium`}
                    >
                      {agent.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteAgent(agent._id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium p-2 rounded-full text-sm transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <div
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                onClick={() => toggleSection(agent._id)}
              >
                <h3 className="font-medium text-xs sm:text-sm">
                  Deliveries ({agent.deliveries?.length || 0})
                </h3>
                {expandedSections[agent._id] ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
              {expandedSections[agent._id] && (
                <div className="mt-2 space-y-2">
                  {agent.deliveries && agent.deliveries.length > 0 ? (
                    agent.deliveries.slice(0, 3).map((delivery) => (
                      <div
                        key={delivery._id}
                        className="bg-gray-50 p-2 sm:p-3 rounded-md text-xs sm:text-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              Delivery #{delivery._id.slice(-6)}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {new Date(
                                delivery.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs">{delivery.status}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs sm:text-sm">No deliveries yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Add New Delivery Agent</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 border rounded text-sm"
                onChange={(e) =>
                  setNewAgent({ ...newAgent, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded text-sm"
                onChange={(e) =>
                  setNewAgent({ ...newAgent, email: e.target.value })
                }
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full p-2 border rounded text-sm"
                onChange={(e) =>
                  setNewAgent({ ...newAgent, phoneNumber: e.target.value })
                }
              />
              <select
                className="w-full p-2 border rounded text-sm"
                value={newAgent.idProof?.type}
                onChange={(e) =>
                  setNewAgent({
                    ...newAgent,
                    idProof: {
                      ...newAgent.idProof!,
                      type: e.target.value as "aadhaar" | "pan" | "voter",
                    },
                  })
                }
              >
                <option value="">Select ID Proof Type</option>
                <option value="aadhaar">Aadhaar</option>
                <option value="pan">PAN</option>
                <option value="voter">Voter ID</option>
              </select>
              <input
                type="text"
                placeholder="ID Proof Value"
                className="w-full p-2 border rounded text-sm"
                onChange={(e) =>
                  setNewAgent({
                    ...newAgent,
                    idProof: {
                      ...newAgent.idProof!,
                      value: e.target.value,
                    },
                  })
                }
              />
              <select
                className="w-full p-2 border rounded text-sm"
                value={newAgent.vehicle?.type}
                onChange={(e) =>
                  setNewAgent({
                    ...newAgent,
                    vehicle: {
                      ...newAgent.vehicle!,
                      type: e.target.value as "bike" | "van" | "truck",
                    },
                  })
                }
              >
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
              <input
                type="text"
                placeholder="Vehicle Model"
                className="w-full p-2 border rounded text-sm"
                onChange={(e) =>
                  setNewAgent({
                    ...newAgent,
                    vehicle: {
                      ...newAgent.vehicle!,
                      model: e.target.value,
                    },
                  })
                }
              />
              <input
                type="text"
                placeholder="Vehicle Registration ID"
                className="w-full p-2 border rounded text-sm"
                onChange={(e) =>
                  setNewAgent({
                    ...newAgent,
                    vehicle: {
                      ...newAgent.vehicle!,
                      registrationId: e.target.value,
                    },
                  })
                }
              />
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAgent}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Add Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
