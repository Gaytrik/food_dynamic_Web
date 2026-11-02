import React, { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingBag,
  Award,
  DollarSign,
  TrendingUp as TrendIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import DialogBox from "../components/DialogBox";

const Statistics = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueFilter, setRevenueFilter] = useState("all");

  // Date range filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [dialog, setDialog] = useState({
  isOpen: false,
  type: "",       // e.g. "loginError", "validationError", etc.
  message: "",    // custom message if needed
});

const closeDialog = () =>
  setDialog({ isOpen: false, type: "", message: "" });


  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
setDialog({
  isOpen: true,
  type: "notLoggedIn", // Dialog Type
  message: "Please login to access statistics", // Optional
});
          setLoading(false);
          return;
        }

        const ordersResponse = await fetch("http://localhost:8080/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const usersResponse = await fetch("http://localhost:8080/api/auth", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const productsResponse = await fetch("http://localhost:8080/api/menu/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const ordersData = await ordersResponse.json();
        const usersData = await usersResponse.json();
        const productsData = await productsResponse.json();

        if (ordersData && Array.isArray(ordersData)) {
          setOrders(ordersData);
        }

        if (usersData && Array.isArray(usersData)) {
          setUsers(usersData);
        }

        if (productsData && Array.isArray(productsData)) {
          setProducts(productsData);
        }

        console.log("✅ All data loaded successfully");
      } catch (error) {
        console.error("❌ Error fetching data:", error);
setDialog({
  isOpen: true,
  type: "validationError",
  message: "Failed to load statistics data",
});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter orders by date range
  const filterOrdersByDateRange = (orders) => {
    if (!startDate && !endDate) return orders;

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      } else if (start) {
        return orderDate >= start;
      } else if (end) {
        end.setHours(23, 59, 59, 999);
        return orderDate <= end;
      }
      return true;
    });
  };

  // Filter orders by date
  const filterOrdersByDate = (orders, filter) => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      switch (filter) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "yesterday":
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          return orderDate.toDateString() === yesterday.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        case "year":
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return orderDate >= yearAgo;
        default:
          return true;
      }

    });
  };

  // Apply date range filter first
  const dateRangeFilteredOrders = useMemo(() => {
    // Only include completed orders
    const completedOrders = orders.filter(order => order.orderStatus === "Completed");
    return filterOrdersByDateRange(completedOrders);
  }, [orders, startDate, endDate]);


  // Calculate statistics
  const statistics = useMemo(() => {
    // ✅ If manual date range is applied, ignore dropdown filter
    const activeOrders =
      startDate || endDate
        ? dateRangeFilteredOrders
        : filterOrdersByDate(dateRangeFilteredOrders, revenueFilter);

    // ✅ Only completed orders considered
    const filteredRevenue = activeOrders.filter(order => order.orderStatus === "Completed");

    const totalRevenue = filteredRevenue.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const previousRevenue = 0; // you can keep your previous logic if needed

    const revenueGrowth = 0; // same, or keep your existing growth calc if desired

    const totalDeliveryFees = filteredRevenue.reduce(
      (sum, order) => sum + (order.deliveryFee || 0),
      0
    );

    const totalTaxes = filteredRevenue.reduce(
      (sum, order) => sum + (order.tax || 0),
      0
    );

    const totalUsers = users.length;
    const totalProducts = products.length;

    const avgOrderValue =
      filteredRevenue.length > 0 ? totalRevenue / filteredRevenue.length : 0;

    return {
      totalRevenue,
      revenueGrowth,
      totalUsers,
      totalProducts,
      avgOrderValue,
      totalDeliveryFees,
      totalTaxes,
    };
  }, [dateRangeFilteredOrders, users, products, revenueFilter, startDate, endDate]);


  // Revenue Trend Chart (Last 7 Days)
  const revenueTrendData = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // ✅ Only include completed orders from last 7 days
    const last7DaysOrders = orders.filter(order => {
      if (order.orderStatus !== "Completed") return false;
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate >= sevenDaysAgo && orderDate <= now;
    });

    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayOrders = last7DaysOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === date.getTime();
      });

      const dailyRevenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const dailyOrders = dayOrders.length;

      dailyData.push({
        date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        revenue: dailyRevenue,
        orders: dailyOrders,
      });
    }

    return dailyData;
  }, [orders]);


  // Top 10 Popular Items
  // ✅ Top 10 Popular Items - follows both date range and dropdown filters
  const topPopularItems = useMemo(() => {
    const itemCount = {};

    // ✅ Use same logic as revenue: manual date range overrides dropdown
    const activeOrders =
      startDate || endDate
        ? dateRangeFilteredOrders
        : filterOrdersByDate(dateRangeFilteredOrders, revenueFilter);

    activeOrders.forEach((order) => {
      order.orderItems?.forEach((item) => {
        const itemId = item.menuItemId || item.id;
        if (itemCount[itemId]) {
          itemCount[itemId].quantity += item.quantity || 1;
        } else {
          itemCount[itemId] = {
            name: item.name || "Unknown",
            quantity: item.quantity || 1,
          };
        }
      });
    });

    return Object.values(itemCount)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [dateRangeFilteredOrders, revenueFilter, startDate, endDate]);


  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-600 text-lg mt-4 font-medium">Loading statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:mt-0 mt-13">
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Enhanced Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Business Analytics
          </h1>
          <p className="text-gray-600 text-sm">
            Comprehensive insights and performance metrics
          </p>
        </div>

        {/* Compact Date Range Filter */}
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-md border border-gray-100 mb-6">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Filter by Date Range</h3>

          {/* Flex layout instead of grid */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Start Date */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setRevenueFilter("all"); // ✅ Switch dropdown to All Time automatically
              }}
              placeholder="Start Date"
              className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            {/* End Date */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setRevenueFilter("all"); // ✅ Switch dropdown to All Time automatically
              }}
              placeholder="End Date"
              className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            <button
              onClick={clearDateFilter}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-sm font-medium whitespace-nowrap"
            >
              Clear Filter
            </button>
          </div>

          {(startDate || endDate) && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Active:</span>{" "}
                {startDate && `From ${new Date(startDate).toLocaleDateString()}`}
                {startDate && endDate && " - "}
                {endDate && `To ${new Date(endDate).toLocaleDateString()}`}
              </p>
            </div>
          )}
        </div>


        {/* Main Statistics Cards - 2 Cards per Row on Mobile, 3 on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6">
          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-medium opacity-90 uppercase tracking-wider">Total Revenue</p>
                <p className="text-lg md:text-3xl font-bold mt-1 md:mt-2 break-words">₹{statistics.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-white/20 p-2 md:p-2.5 rounded-lg backdrop-blur-sm ml-2">
                <ShoppingBag className="w-5 h-5 md:w-7 md:h-7" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">
             
              <select
                value={revenueFilter}
                onChange={(e) => {
                  setRevenueFilter(e.target.value);
                  // ✅ Clear manual date filters if dropdown is used
                  setStartDate("");
                  setEndDate("");
                }}
                className="bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs px-2 md:px-2.5 py-1 rounded-lg border-none outline-none cursor-pointer hover:bg-white/30 transition-colors"
              >
                <option value="today" className="text-gray-800">Today</option>
                <option value="yesterday" className="text-gray-800">Yesterday</option>
                <option value="week" className="text-gray-800">Week</option>
                <option value="month" className="text-gray-800">Month</option>
                <option value="year" className="text-gray-800">Year</option>
                <option value="all" className="text-gray-800">All Time</option>
              </select>


            </div>
          </div>

          {/* Total Users Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-medium opacity-90 uppercase tracking-wider">Total Users</p>
                <p className="text-lg md:text-3xl font-bold mt-1 md:mt-2">{statistics.totalUsers}</p>
              </div>
              <div className="bg-white/20 p-2 md:p-2.5 rounded-lg backdrop-blur-sm ml-2">
                <Users className="w-5 h-5 md:w-7 md:h-7" />
              </div>
            </div>
            <p className="text-[10px] md:text-xs opacity-80 mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">Registered members</p>
          </div>

          {/* Total Products Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-medium opacity-90 uppercase tracking-wider">Total Products</p>
                <p className="text-lg md:text-3xl font-bold mt-1 md:mt-2">{statistics.totalProducts}</p>
              </div>
              <div className="bg-white/20 p-2 md:p-2.5 rounded-lg backdrop-blur-sm ml-2">
                <Package className="w-5 h-5 md:w-7 md:h-7" />
              </div>
            </div>
            <p className="text-[10px] md:text-xs opacity-80 mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">Menu items available</p>
          </div>

          {/* Avg Order Value Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-medium opacity-90 uppercase tracking-wider">Avg Order Value</p>
                <p className="text-lg md:text-3xl font-bold mt-1 md:mt-2 break-words">₹{statistics.avgOrderValue.toFixed(2)}</p>
              </div>
              <div className="bg-white/20 p-2 md:p-2.5 rounded-lg backdrop-blur-sm ml-2">
                <TrendIcon className="w-5 h-5 md:w-7 md:h-7" />
              </div>
            </div>
            <p className="text-[10px] md:text-xs opacity-80 mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">Per transaction</p>
          </div>

          {/* Delivery Fees Card */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-medium opacity-90 uppercase tracking-wider">Delivery Fees</p>
                <p className="text-lg md:text-3xl font-bold mt-1 md:mt-2 break-words">₹{statistics.totalDeliveryFees.toFixed(2)}</p>
              </div>
              <div className="bg-white/20 p-2 md:p-2.5 rounded-lg backdrop-blur-sm ml-2">
                <DollarSign className="w-5 h-5 md:w-7 md:h-7" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">
             
              <span className="text-[10px] md:text-xs opacity-80">Synced with revenue</span>
            </div>
          </div>

          {/* Tax Collected Card */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-700 p-4 md:p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-medium opacity-90 uppercase tracking-wider">Tax Collected</p>
                <p className="text-lg md:text-3xl font-bold mt-1 md:mt-2 break-words">₹{statistics.totalTaxes.toFixed(2)}</p>
              </div>
              <div className="bg-white/20 p-2 md:p-2.5 rounded-lg backdrop-blur-sm ml-2">
                <Award className="w-5 h-5 md:w-7 md:h-7" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">
             
              
              <span className="text-[10px] md:text-xs opacity-80">Synced with revenue</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Revenue Trend Chart */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Revenue Trend</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Last 7 days</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value, name, props) => {
                    const orderCount = props.payload?.orders || 0;
                    return [
                      <>
                        ₹{value.toFixed(2)}
                        <br />
                        {orderCount} orders
                      </>,
                      "Revenue"
                    ];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>

          </div>

          {/* Top 10 Popular Items - Bar Chart */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Popular Items</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {startDate || endDate
                    ? `From ${startDate || "?"} to ${endDate || "?"}`
                    : revenueFilter === "all"
                      ? "All Time"
                      : revenueFilter === "today"
                        ? "Today"
                        : revenueFilter === "yesterday"
                          ? "Yesterday"
                          : `This ${revenueFilter.charAt(0).toUpperCase() + revenueFilter.slice(1)}`}
                </p>

              </div>
              
            </div>
            {topPopularItems.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPopularItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    stroke="#6b7280"
                    style={{ fontSize: "10px", fontWeight: 500 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: "9px", fontWeight: 500 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value) => [`${value} orders`, "Quantity"]}
                  />
                  <Bar dataKey="quantity" radius={[0, 8, 8, 0]}>
                    {topPopularItems.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${220 + index * 15}, 70%, 55%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

<DialogBox
  isOpen={dialog.isOpen}
  onClose={closeDialog}
  type={dialog.type}
  customMessage={dialog.message}
/>


    </div>
  );
};

export default Statistics;
