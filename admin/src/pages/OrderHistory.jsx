import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBox,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import ORDERS_DATA from "../data/orderHistory.json";
import Pagination from "../components/Pagination"; // ✅ import your pagination component

const statusColors = {
  Delivered: "text-green-600 bg-green-100",
  Pending: "text-yellow-600 bg-yellow-100",
  Cancelled: "text-red-600 bg-red-100",
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    setOrders(ORDERS_DATA);
  }, []);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "All" || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <FaCheckCircle className="text-green-500 inline mr-1" />;
      case "Pending":
        return <FaClock className="text-yellow-500 inline mr-1" />;
      case "Cancelled":
        return <FaTimesCircle className="text-red-500 inline mr-1" />;
      default:
        return null;
    }
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-6xl mx-auto mt-20 md:mt-4 px-4 ">
      {/* Header */}
      <div className="bg-[var(--secondary)] p-3 rounded-xl shadow-md border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-[var(--accent)] flex items-center gap-2">
          <FaBox className="text-[var(--primary)]" /> Order History
        </h2>

        {/* Search */}
        <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-2 w-full sm:w-72">
          <FaSearch className="text-gray-400 w-5 h-5 mr-2" />
          <input
            type="text"
            placeholder="Search Order ID or Name"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent focus:outline-none text-sm flex-1"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex mt-3 border-b border-gray-100 text-sm font-semibold text-gray-600 overflow-x-auto">
        {["All", "Delivered", "Pending", "Cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFilter(tab);
              setCurrentPage(1);
            }}
            className={`py-3 px-6 border-b-2 transition-all duration-200 whitespace-nowrap ${
              filter === tab
                ? "text-[var(--primary)] border-[var(--primary)]"
                : "border-transparent hover:text-[var(--primary)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ✅ Desktop Table View with Scrollbar */}
      <div
        className="hidden md:block mt-3 bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto max-h-[450px] overflow-y-auto
        scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50 hover:scrollbar-thumb-gray-400"
      >
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold sticky top-0 z-10 border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-all"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {order.id}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{order.customer}</td>
                  <td className="py-3 px-4 text-gray-500">{order.date}</td>
                  <td className="py-3 px-4 text-gray-600">{order.items}</td>
                  <td className="py-3 px-4 font-semibold text-[var(--primary)]">
                    {order.total}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}
                    >
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-gray-500 italic"
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Mobile Card View */}
      <div className="md:hidden mt-4 space-y-4">
        {currentOrders.length > 0 ? (
          currentOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800">
                  #{order.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}
                >
                  {getStatusIcon(order.status)} {order.status}
                </span>
              </div>

              <div className="text-gray-700 text-sm">
                <p>
                  <strong>Customer:</strong> {order.customer}
                </p>
                <p>
                  <strong>Date:</strong> {order.date}
                </p>
                <p>
                  <strong>Items:</strong> {order.items}
                </p>
                <p>
                  <strong>Total:</strong>{" "}
                  <span className="font-semibold text-[var(--primary)]">
                    {order.total}
                  </span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 italic">No orders found.</p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-sm text-gray-500">
        Showing {currentOrders.length} of {filteredOrders.length} filtered orders
      </div>

      {/* ✅ Pagination Component */}
      <div className="mt-4 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          itemsPerPage={ordersPerPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default OrderHistory;
