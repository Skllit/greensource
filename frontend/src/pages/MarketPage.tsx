import axios from "axios";
import { useEffect, useState, useCallback, useRef } from "react";
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

interface Record {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

interface ApiResponse {
  records: Record[];
}

export default function MarketPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [displayedRecords, setDisplayedRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");

  // Unique values for filters
  const [states, setStates] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);

  // Infinite scroll states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 12;
  const observer = useRef<IntersectionObserver>();
  const lastRecordElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001f436e980073b4bdd6780e17e5677bcf6&format=json&limit=9374"
      );
      setRecords(response.data.records);
      
      const uniqueStates = [...new Set(response.data.records.map(record => record.state))];
      const uniqueCommodities = [...new Set(response.data.records.map(record => record.commodity))].sort();
      
      const currentDate = new Date();
      const formattedDateTime = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
      setLastRefreshed(formattedDateTime);
      
      localStorage.setItem('marketData', JSON.stringify({
        records: response.data.records,
        states: uniqueStates,
        commodities: uniqueCommodities,
        timestamp: new Date().getTime(),
        lastRefreshed: formattedDateTime
      }));

      setStates(uniqueStates);
      setCommodities(uniqueCommodities);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch market data");
      setLoading(false);
    }
  };

  // Debounced search handler
  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, 300);

  // Throttled filter handlers
  const throttledStateFilter = throttle((state: string) => {
    setSelectedState(state);
    setPage(1);
  }, 300);

  const handleCommoditySelect = (commodity: string) => {
    setSelectedCommodity(commodity);
    setPage(1);
  };

  useEffect(() => {
    const cachedData = localStorage.getItem('marketData');
    
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      setRecords(parsedData.records);
      setStates(parsedData.states);
      setCommodities(parsedData.commodities);
      setLastRefreshed(parsedData.lastRefreshed);
      setLoading(false);
    } else {
      fetchData();
    }
  }, []);

  useEffect(() => {
    const filteredRecords = records.filter((record) => {
      const matchesSearch = 
        record.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.market.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesState = selectedState ? record.state === selectedState : true;
      const matchesCommodity = selectedCommodity ? record.commodity === selectedCommodity : true;

      return matchesSearch && matchesState && matchesCommodity;
    });

    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    setDisplayedRecords(filteredRecords.slice(startIndex, endIndex));
    setHasMore(endIndex < filteredRecords.length);
  }, [records, searchTerm, selectedState, selectedCommodity, page]);

  const handleRefresh = () => {
    fetchData();
    setPage(1);
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center">Market Commodity Prices</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last refreshed: {lastRefreshed}
          </span>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search commodities, states or markets..."
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          onChange={(e) => debouncedSearch(e.target.value)}
        />
        
        <select 
          onChange={(e) => throttledStateFilter(e.target.value)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All States</option>
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        <select
          value={selectedCommodity}
          onChange={(e) => handleCommoditySelect(e.target.value)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Commodities</option>
          {commodities.map(commodity => (
            <option key={commodity} value={commodity}>{commodity}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedRecords.map((record, index) => (
          <div
            key={index}
            ref={index === displayedRecords.length - 1 ? lastRecordElementRef : null}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
          >
            <div className="p-4">
              <h3 className="text-xl font-bold mb-4">{record.commodity}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium ">Variety:</p>
                  <p className="text-sm text-gray-500">{record.variety}</p>
                </div>
                <div>
                  <p className="font-medium ">District:</p>
                  <p className="text-sm text-gray-500">{record.district}</p>
                </div>
                <div>
                  <p className="font-medium ">State:</p>
                  <p className="text-sm text-gray-500">{record.state}</p>
                </div>
                <div>
                  <p className="font-medium ">Market:</p>
                  <p className="text-sm text-gray-500">{record.market}</p>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Min Price</p>
                    <p className="font-bold text-green-600">₹{record.min_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Max Price</p>
                    <p className="font-bold text-red-600">₹{record.max_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Modal Price</p>
                    <p className="font-bold text-blue-600">₹{record.modal_price}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">Price per quintal</p>
                <div className="text-right mt-2 text-sm text-gray-500">
                  Date: {record.arrival_date}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && page > 1 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}
