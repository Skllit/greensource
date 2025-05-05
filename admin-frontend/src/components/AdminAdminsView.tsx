import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { Plus, Trash2 } from "lucide-react";

interface Admin {
  email: string;
  username: string;
  password: string;
  role: string;
}

export default function AdminAdminsView() {
  const { token } = useSelector(selectAuth);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    username: "",
    password: "",
    role: "admin",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3800/api/auth/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response)
      setAdmins(response.data.filter((admin: Admin) => admin.role === "admin"));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to fetch admins data");
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    try {
      await axios.delete(`http://localhost:3800/api/auth/delete/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3800/api/auth/register",
        {
          ...newAdmin,
          role: "admin",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewAdmin({
        email: "",
        username: "",
        password: "",
        role: "admin",
      });
      setShowAddForm(false);
      fetchAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Admins Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors text-sm"
        >
          <Plus size={16} />
          Add Admin
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Add New Admin</h2>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={newAdmin.username}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newAdmin.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={newAdmin.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-sm sm:text-base"
                required
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm sm:text-base"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins && admins?.map((admin) => (
          <div
            key={admin.email}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 w-full"
          >
            <div className="flex flex-col gap-4">
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm sm:text-base">
                      {admin.username.split(" ")[0].charAt(0)}
                      {admin.username.split(" ")[1]?.charAt(0)}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold">{admin.username}</h2>
                </div>
                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span className="break-all">{admin.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteAdmin(admin.email)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium p-2 rounded-full text-sm transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
