import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/slices/authSlice";
import { DollarSign, TrendingUp, Calendar, Clock } from "lucide-react";

interface EarningsData {
  today: number;
  week: number;
  month: number;
  allTime: number;
}

export default function FarmerEarnings() {
  const [earnings, setEarnings] = useState<EarningsData>({
    today: 0,
    week: 0,
    month: 0,
    allTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { token, user } = useSelector(selectAuth);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3800/api/farmers/api/farmers/${user.email}/get/earnings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEarnings(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching earnings:", error);
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, [token]);

  const EarningsCard = ({
    title,
    amount,
    icon,
  }: {
    title: string;
    amount: number;
    icon: React.ReactNode;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className="p-2 bg-green-100 rounded-full">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900">₹{amount.toFixed(2)}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full mt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Earnings Overview</h1>
        <p className="text-gray-600">
          Track your earnings across different time periods
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EarningsCard
          title="Today's Earnings"
          amount={earnings.today}
          icon={<Clock className="w-6 h-6 text-green-600" />}
        />
        <EarningsCard
          title="This Week"
          amount={earnings.week}
          icon={<Calendar className="w-6 h-6 text-green-600" />}
        />
        <EarningsCard
          title="This Month"
          amount={earnings.month}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        <EarningsCard
          title="All Time"
          amount={earnings.allTime}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
        />
      </div>
    </div>
  );
}
