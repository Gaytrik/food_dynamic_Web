import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  ChevronRight,
  FileDown,
  RefreshCcw,
  Truck,
  X,
  ShoppingBag,
  CheckCircle,
  CreditCard,
  CircleDollarSign,
  XCircle,
  Phone,
  Users,
  ClipboardList,
  MapPin,
  User,
  Mail,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import DialogBox from "../components/DialogBox";



import {
  AiOutlineDoubleLeft,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineDoubleRight,
} from "react-icons/ai";

/**
 * AdminOrderManagement
 * - Multi-select Confirmed orders → Download PDF + auto move to "On Delivery"
 * - Responsive detail modal (full info + status change)
 * - Mobile cards layout
 */

const API_BASE = "http://localhost:8080";

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Confirmed");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [selectedIds, setSelectedIds] = useState(() => new Set()); // adhijevanOrderId selected

  // Dialog state
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "info", // 'success'|'error'|'info'|'confirm'
    onConfirm: null,
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 0;

  // 🧾 Fetch Orders
  // 🧾 Fetch Orders — final working version
  // 🧾 Fetch Orders — frontend-only combined filtering (no backend change)
  // 🧾 Fetch Orders (final, sorted: newest first)
 // 🧾 Fetch Orders (newest first on FIRST page, no redirects)
const fetchOrders = async (page = 0, size = pageSize) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    // map UI tab -> backend status
    const statusMap = {
      Confirmed: "confirmed",
      "On Delivery": "on delivery",
      Completed: "completed",
      Cancelled: "cancelled",
    };
    const selectedStatus = statusMap[statusFilter];

    // ✅ ask backend for newest first
    const url = `${API_BASE}/api/orders/paged?page=${page}&size=${size}&sort=createdAt,desc${
      selectedStatus ? `&status=${encodeURIComponent(selectedStatus)}` : ""
    }`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let fetchedOrders = res.data?.content || [];

    // local search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      fetchedOrders = fetchedOrders.filter(
        (o) =>
          o.customerName?.toLowerCase().includes(q) ||
          o.customerPhone?.toLowerCase().includes(q) ||
          o.adhijevanOrderId?.toLowerCase().includes(q)
      );
    }

    // local date filter
    if (dateFilter.start || dateFilter.end) {
      const start = dateFilter.start ? new Date(dateFilter.start) : null;
      const end = dateFilter.end ? new Date(dateFilter.end) : null;

      fetchedOrders = fetchedOrders.filter((o) => {
        const createdAt = new Date(o.createdAt);
        if (start && createdAt < start) return false;
        if (end && createdAt > new Date(end.getTime() + 86400000)) return false; // include end date fully
        return true;
      });
    }

    // safety: keep newest → oldest even after local filtering
    fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // set state
    setOrders(fetchedOrders);
    setTotalCount(res.data?.totalElements ?? fetchedOrders.length);
    setCurrentPage(page);

    // keep only valid Confirmed selections
    const nextSel =
      statusFilter === "Confirmed"
        ? new Set(
            [...selectedIds].filter((id) =>
              fetchedOrders.some(
                (o) => o.adhijevanOrderId === id && o.orderStatus === "Confirmed"
              )
            )
          )
        : new Set();
    setSelectedIds(nextSel);
  } catch (err) {
    console.error(err);
    setDialog({
      open: true,
      title: "Load Failed",
      message: "Failed to load orders. Please try again.",
      type: "error",
      onConfirm: null,
    });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchOrders(0, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pageSize, searchQuery, dateFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setDateFilter({ start: "", end: "" });
    setStatusFilter("Confirmed");
    fetchOrders(0, pageSize);
  };

  // ✅ Select helpers (only for Confirmed)
  const pageConfirmed = useMemo(
    () => orders.filter((o) => o.orderStatus === "Confirmed"),
    [orders]
  );
  const allConfirmedSelected = useMemo(() => {
    if (!pageConfirmed.length) return false;
    return pageConfirmed.every((o) => selectedIds.has(o.adhijevanOrderId));
  }, [pageConfirmed, selectedIds]);

  const toggleSelectOne = (order) => {
    if (order.orderStatus !== "Confirmed") return;
    const id = order.adhijevanOrderId;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAllConfirmed = () => {
    if (!pageConfirmed.length) return;
    const next = new Set(selectedIds);
    if (allConfirmedSelected) {
      // unselect all on this page
      pageConfirmed.forEach((o) => next.delete(o.adhijevanOrderId));
    } else {
      // select all on this page
      pageConfirmed.forEach((o) => next.add(o.adhijevanOrderId));
    }
    setSelectedIds(next);
  };


 const generatePDF = (orders) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 12;
  const usableWidth = pageWidth - margin * 2;
  let y = 20;

  const addNewPageIfNeeded = (requiredSpace = 30) => {
    if (y + requiredSpace > 280) {
      doc.addPage();
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Aadhi Jevan Orders Summary", pageWidth / 2, 15, { align: "center" });
    doc.setDrawColor(180);
    doc.setLineWidth(0.4);
    doc.line(margin, 18, pageWidth - margin, 18);
    y = 25;
  };

  const drawFooter = () => {
    const date = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Generated on ${date}`, pageWidth / 2, 290, { align: "center" });
  };

  drawHeader();

  orders.forEach((order, index) => {
    addNewPageIfNeeded(60);

    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Order #${index + 1}`, margin, y);
    doc.setFontSize(11);
    doc.text(`ID: ${order.adhijevanOrderId}`, pageWidth - margin, y, { align: "right" });
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const addr = order.addresses?.[0];
    const addressText = addr
      ? `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`
      : "N/A";

    const infoLines = [
      `Customer: ${order.customerName || "N/A"}`,
      `Phone: ${order.customerPhone || "N/A"}`,
      `Address: ${addressText}`,
      `Payment: ${order.paymentStatus}`,
      `Status: ${order.orderStatus}`,
    ];

    infoLines.forEach((line) => {
      const split = doc.splitTextToSize(line, usableWidth);
      doc.text(split, margin, y);
      y += split.length * 5;
    });

    y += 3;

    addNewPageIfNeeded(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    // ✅ Reduced gray header bar height (from 8 to 6) and adjusted offset
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 4, usableWidth, 5, "F");

    const itemX = margin + 2;
    const qtyX = pageWidth / 2 - 15;
    const priceX = pageWidth / 2 + 10;
    const totalX = pageWidth - margin - 20;

    doc.text("Item", itemX, y);
    doc.text("Qty", qtyX, y);
    doc.text("Price", priceX, y);
    doc.text("Total (Rs)", totalX, y);

    y += 6;
    doc.setFont("helvetica", "normal");

    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach((item) => {
        addNewPageIfNeeded(12);
        const total = item.price * item.quantity;
        const itemName = doc.splitTextToSize(item.name, qtyX - itemX - 5);

        doc.text(itemName, itemX, y);
        doc.text(`${item.quantity}`, qtyX, y);
        doc.text(`Rs.${item.price}`, priceX, y);
        doc.text(`Rs.${total.toFixed(2)}`, totalX, y);
        y += itemName.length * 5 + 1;
      });
    } else {
      doc.text("No items found.", margin + 2, y);
      y += 6;
    }

    const totalsHeight = 25;
    addNewPageIfNeeded(totalsHeight + 10);
    y += 4;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    const totals = [
      {
        label: "Subtotal:",
        value: order.totalAmount - (order.tax || 0) - (order.deliveryFee || 0),
        bold: true,
      },
      { label: "Tax:", value: order.tax || 0 },
      { label: "Delivery Fee:", value: order.deliveryFee || 0 },
      {
        label: "Grand Total:",
        value: order.totalAmount || 0,
        bold: true,
        highlight: true,
      },
    ];

    totals.forEach((t) => {
      if (t.highlight) {
        doc.setFont("helvetica", "bold");
        doc.setFillColor(245, 245, 245);
        doc.rect(pageWidth / 2 + 10, y - 4.5, usableWidth / 2 - 10, 7, "F");
      } else {
        doc.setFont("helvetica", t.bold ? "bold" : "normal");
      }

      doc.setFontSize(10);
      doc.text(t.label, pageWidth / 2 + 10, y);
      doc.text(`Rs.${t.value.toFixed(2)}`, pageWidth - margin - 10, y, {
        align: "right",
      });
      y += 6;
    });

    y += 8;
    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  });

  drawFooter();
  doc.save(`adhijevan-orders-${Date.now()}.pdf`);
};



  // 🧾 Delivery Assignment PDF (for selected Confirmed only) + move to On Delivery
  // 🧾 Delivery Assignment PDF (for selected Confirmed only) + move to On Delivery
  const exportSelectedAndDispatch = async () => {
    const selectedOrders = orders.filter((o) => selectedIds.has(o.adhijevanOrderId));
    if (!selectedOrders.length) {
      setDialog({
        open: true,
        title: "No Orders Selected",
        message: "Please select one or more Confirmed orders before downloading the PDF.",
        type: "info",
        onConfirm: null,
      });
      return;
    }


    try {
      // ✅ Generate PDF manually
      generatePDF(selectedOrders);

      // ✅ Update order statuses after download
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedOrders.map((o) =>
          axios.put(
            `${API_BASE}/api/orders/${o.id}/status?status=On Delivery`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setDialog({
        open: true,
        title: "Dispatched",
        message: "PDF downloaded & orders moved to On Delivery",
        type: "success",
        onConfirm: null,
      });
      setSelectedIds(new Set());
      fetchOrders(currentPage, pageSize);
    } catch (err) {
      console.error(err);
      setDialog({
        open: true,
        title: "Export Failed",
        message: "Failed to export PDF or update order status. See console for details.",
        type: "error",
        onConfirm: null,
      });
    }
  };

  // 📦 Update Status (single)
  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Use id for backend lookups
      await axios.put(
        `${API_BASE}/api/orders/${orderId}/status?status=${encodeURIComponent(status)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDialog({
        open: true,
        title: "Status Updated",
        message: `Order status updated to ${status}`,
        type: "success",
        onConfirm: null,
      });

      fetchOrders(currentPage, pageSize);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Update status failed:", err.response || err);
      if (err.response?.status === 404) {
        setDialog({
          open: true,
          title: "Not Found",
          message: "Order not found — check if backend expects id or adhijevanOrderId",
          type: "error",
          onConfirm: null,
        });
      } else {
        setDialog({
          open: true,
          title: "Update Failed",
          message: "Failed to update order status. Please try again.",
          type: "error",
          onConfirm: null,
        });
      }
    }
  };


  // 💳 Update Payment
  const markAsPaid = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/orders/${orderId}/payment-status?paymentStatus=Paid`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDialog({
        open: true,
        title: "Payment Updated",
        message: "Payment marked as Paid",
        type: "success",
        onConfirm: null,
      });
      fetchOrders(currentPage, pageSize);
      setSelectedOrder(null);
    } catch {
      setDialog({
        open: true,
        title: "Update Failed",
        message: "Failed to update payment status.",
        type: "error",
        onConfirm: null,
      });
    }
  };

  return (
    <div className="flex md:mt-0 ">
      <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="sticky md:top-0 top-14 bg-white p-3 sm:p-3 md:p-3 shadow-sm z-30">
          <div className="flex flex-col gap-3">
            {/* Row 1: Title + Status Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              {/* Title Section */}
              <div className="flex-shrink-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800">
                  Order Management
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                  Manage and track all customer orders
                </p>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-gray-300  border rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 min-w-[120px] sm:min-w-[140px]"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="On Delivery">On Delivery</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Row 2: All Filters & Actions */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Date Filters */}
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, start: e.target.value })
                }
                className="border-gray-300  border  rounded-lg px-2 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 w-[calc(50%-4px)] sm:w-auto"
              />
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, end: e.target.value })
                }
                className="border-gray-300  border  rounded-lg px-2 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 w-[calc(50%-4px)] sm:w-auto"
              />

              {/* Search Input */}
              <div className="relative flex-1 min-w-[140px] sm:min-w-[180px]">
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border-gray-300  border  rounded-lg text-xs sm:text-sm w-full"
                />
              </div>

              {/* Select All Button */}
              <button
                onClick={toggleSelectAllConfirmed}
                className={`flex items-center gap-1 border-gray-300  border px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs whitespace-nowrap ${pageConfirmed.length
                  ? "bg-white hover:bg-gray-50 text-gray-600"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                disabled={!pageConfirmed.length}
                title="Select all Confirmed orders"
              >
                {allConfirmedSelected ? (
                  <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">
                  {allConfirmedSelected ? "Unselect All" : "Select All"}
                </span>
              </button>

              {/* Download PDF Button */}
              <button
                onClick={exportSelectedAndDispatch}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs whitespace-nowrap"
                title="Download PDF"
              >
                <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs whitespace-nowrap"
              >
                <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>


        {/* Orders List */}
        <div className="flex-1 overflow-hidden">
          <div className="w-full">
            {loading ? (
              <div className="bg-white shadow-md ">
                <LoadingSkeleton count={pageSize} />
              </div>
            ) : orders.length === 0 ? (
              <div className="  flex flex-col items-center justify-center p-12 text-gray-500 mx-auto my-8 w-4/5 sm:w-2/5 transition-all duration-300 ">
                <Package className="w-20 h-19 text-gray-300 mb-6" />
                <p className="text-lg font-medium">No Confirmed orders found</p>
              </div>

            ) : (
              <>
                {/* ---------------- Desktop Table ---------------- */}
                <div className="hidden md:flex flex-1 overflow-hidden">
                  <div
                    className="bg-white flex flex-col w-full"
                    style={{ height: "calc(68vh)" }}
                  >
                    {loading ? (
                      <LoadingSkeleton count={pageSize} />
                    ) : orders.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <Package className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No orders found</p>
                        {(searchQuery || statusFilter !== "ALL") && (
                          <button
                            onClick={resetFilters}
                            className="mt-4 px-6 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Table Header */}
                        <div className="sticky top-0 z-20 bg-gray-100 border-gray-200">
                          <div className="grid grid-cols-12 gap-4 pl-8 pr-0 py-3 text-sm font-semibold text-gray-600 uppercase items-center">
                            {orders.some((o) => o.orderStatus === "Confirmed") && (
                              <div className="col-span-1">Select</div>
                            )}
                            <div className="col-span-3">Customer</div>
                            <div className="col-span-2">Total</div>
                            <div className="col-span-2">Payment</div>
                            <div className="col-span-2">Placed On</div>
                            <div className="col-span-2 text-center">Status</div>
                          </div>
                        </div>

                        {/* Table Body */}
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 pl-8 pr-0 no-scrollbar">
                          {orders.map((order) => (
                            <div
                              key={order.id}
                              onClick={() => setSelectedOrder(order)}
                              className="grid grid-cols-12 gap-4 py-1.5 hover:bg-gray-50 cursor-pointer transition-all duration-100"
                            >
                              {order.orderStatus === "Confirmed" && (
                                <div
                                  className="col-span-1 flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => toggleSelectOne(order)}
                                    className={`p-1 rounded-md ${selectedIds.has(order.adhijevanOrderId)
                                      ? "bg-green-50"
                                      : "hover:bg-gray-100"
                                      }`}
                                  >
                                    {selectedIds.has(order.adhijevanOrderId) ? (
                                      <CheckSquare className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Square className="w-4 h-4 text-gray-500" />
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* Customer Info */}
                              <div className="col-span-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 text-green-600 flex items-center justify-center rounded-full font-bold">
                                  {order.customerName?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {order.customerName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {order.customerPhone}
                                  </p>
                                </div>
                              </div>

                              {/* Total */}
                              <div className="col-span-2 font-semibold text-gray-800">
                                ₹{toFixed2(order.totalAmount)}
                              </div>

                              {/* Payment */}
                              <div className="col-span-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === "Paid"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                    }`}
                                >
                                  {order.paymentStatus}
                                </span>
                              </div>

                              {/* Placed On */}
                              <div className="col-span-2 text-sm text-gray-600">
                                {formatDateTime(safeDate(order.createdAt))}
                              </div>

                               {/* Status */}
                               <div className="col-span-2 flex items-center justify-center">
                                <OrderStatusBadge status={order.orderStatus} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ---------------- Mobile Cards ---------------- */}
                <div className="block md:hidden md:pt-0 pt-14 grid grid-cols-1 ">
                  {orders.map((order) => (
                    <div
                      key={order.adhijevanOrderId}
                      className="bg-white shadow-md border border-gray-200  p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 border text-green-600 flex items-center justify-center rounded-full font-bold">
                            {order.customerName?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {order.customerName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.customerPhone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            ₹{toFixed2(order.totalAmount)}
                          </span>
                          {order.orderStatus === "Confirmed" ? (
                            <button
                              onClick={() => toggleSelectOne(order)}
                              className="p-2 rounded-md border hover:bg-gray-50"
                              title="Select this Confirmed order"
                            >
                              {selectedIds.has(order.adhijevanOrderId) ? (
                                <CheckSquare className="w-4 h-4 text-green-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <OrderStatusBadge status={order.orderStatus} />
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-sm text-green-700 font-medium flex items-center gap-1"
                        >
                          View Details <ChevronRight className="w-4 h-4" />
                        </button>
                        {/* {order.orderStatus === "Confirmed" && (
                          <button
                            onClick={exportSelectedAndDispatch}
                            className="text-sm bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                          >
                            <FileDown className="w-4 h-4" />
                            PDF & Dispatch
                          </button>
                        )} */}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>


        {/* Pagination */}
        {totalPages >= 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            fetchPage={fetchOrders}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        )}

        {/* Modal */}
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={updateOrderStatus}
            onMarkPaid={markAsPaid}
          />
        )}


      </div>

      <DialogBox
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
        onConfirm={() => {
          // If onConfirm was supplied, run it then close
          if (typeof dialog.onConfirm === "function") {
            const maybeP = dialog.onConfirm();
            // if promise returned, close after resolved to make UX smooth
            if (maybeP && maybeP.then) {
              maybeP.finally(() => setDialog((d) => ({ ...d, open: false })));
            } else {
              setDialog((d) => ({ ...d, open: false }));
            }
          } else {
            setDialog((d) => ({ ...d, open: false }));
          }
        }}
      />
    </div>
  );
};

 // 🧩 Pagination Component
// 🧩 Pagination Component
const Pagination = ({ totalPages, currentPage, fetchPage, pageSize, setPageSize }) => {
  const groupSize = 5;
  const currentGroup = Math.floor(currentPage / groupSize);
  const startPage = currentGroup * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, totalPages);

  return (
    <div
      className="
        bg-white h-14 px-4 w-full flex flex-wrap items-center justify-between z-20 shadow-sm
        sticky top-0 md:sticky md:top-0
        fixed bottom-0 md:relative
      "
      style={{ boxShadow: "0 -1px 4px rgba(0,0,0,0.08)" }}
    >
      <div className="text-sm text-gray-600">
        Page <b>{currentPage + 1}</b> of <b>{totalPages}</b>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 0}
          onClick={() => fetchPage(0, pageSize)}
          className="p-2 rounded-md border hover:bg-gray-100 disabled:opacity-50"
        >
          <AiOutlineDoubleLeft />
        </button>
        <button
          disabled={startPage <= 1}
          onClick={() => fetchPage(startPage - 2, pageSize)}
          className="p-2 rounded-md border hover:bg-gray-100 disabled:opacity-50"
        >
          <AiOutlineLeft />
        </button>

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
          (p) => (
            <button
              key={p}
              onClick={() => fetchPage(p - 1, pageSize)}
              className={`w-8 h-8 rounded-full border text-sm ${
                currentPage + 1 === p
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={endPage >= totalPages}
          onClick={() => fetchPage(endPage, pageSize)}
          className="p-2 rounded-md border hover:bg-gray-100 disabled:opacity-50"
        >
          <AiOutlineRight />
        </button>
        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => fetchPage(totalPages - 1, pageSize)}
          className="p-2 rounded-md border hover:bg-gray-100 disabled:opacity-50"
        >
          <AiOutlineDoubleRight />
        </button>

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="ml-2 border rounded-md px-2 py-1 text-sm"
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
};


// 🧩 Status Badge
const OrderStatusBadge = ({ status }) => {
  const color = {
    Confirmed: "bg-blue-100 text-blue-700",
    "On Delivery": "bg-yellow-100 text-yellow-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  }[status] || "bg-gray-100 text-gray-600";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
};

// 🧩 Order Modal (FULL details + editable status)
const OrderModal = ({ order, onClose, onUpdateStatus, onMarkPaid }) => {
  const [statusDraft, setStatusDraft] = useState(order.orderStatus || "Confirmed");
  const [loadingStatus, setLoadingStatus] = useState(false);


  const address = displayAddress(order);
  const email = order.customerEmail || order.email || "-";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Order #{order.adhijevanOrderId}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info label="Customer" value={order.customerName || "-"} icon={<User />} />
            <Info label="Phone" value={order.customerPhone || "-"} icon={<Phone />} />
            {/* <Info label="Email" value={email} icon={<Mail />} /> */}
            <Info label="Payment" value={order.paymentStatus || "-"} icon={<CreditCard />} />
            <Info
              label="Address"
              value={address}
              icon={<MapPin />}
            />
            <Info
              label="Created"
              value={formatDateTime(safeDate(order.createdAt))}
              icon={<CheckCircle />}
            />
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" /> Items
            </h3>
            <div className="bg-gray-50 rounded-xl p-3 divide-y">
              {(order.orderItems || []).map((i, idx) => (
                <div key={idx} className="flex justify-between py-2 text-sm">
                <div className="flex gap-3 items-center">
  <span className="font-medium">{i.name}</span>
</div>

                  <span className="tabular-nums">
                    {i.quantity} × ₹{toFixed2(i.price)} ={" "}
                    <b>₹{toFixed2((i.quantity ?? 0) * (Number(i.price) || 0))}</b>
                  </span>
                </div>
              ))}
            </div>
          </div>


          {/* Totals */}
          <div className="border-t pt-3 text-right space-y-1">
            <p>Tax: ₹{toFixed2(order.tax ?? 0)}</p>
            <p>Delivery Fee: ₹{toFixed2(order.deliveryFee ?? 0)}</p>
            <p className="text-lg font-bold">
              Grand Total: ₹{toFixed2(order.totalAmount ?? 0)}
            </p>
          </div>

          {/* Status editor */}
          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-sm text-gray-600">Order Status</label>
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                  className="w-full mt-1 border rounded-xl px-3 py-2"
                >
                  <option>Confirmed</option>
                  <option>On Delivery</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2 mt-7">
                <button
                  onClick={async () => {
                    setLoadingStatus(true);
                    await onUpdateStatus(order.id, statusDraft);
                    setLoadingStatus(false);
                  }}
                  className="flex-1 min-w-[130px] py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Truck className="w-5 h-5" />
                  Save Status
                </button>

                {order.paymentStatus !== "Paid" && (
                  <button
                    onClick={() => onMarkPaid(order.id)}
                    className="flex-1 min-w-[130px] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <CreditCard className="w-5 h-5" />
                    Mark as Paid
                  </button>
                )}

                {order.orderStatus !== "Cancelled" && (
                  <button
                    onClick={async () => {
                      setLoadingStatus(true);
                      await onUpdateStatus(order.id, "Cancelled");
                      setLoadingStatus(false);
                    }}
                    className="flex-1 min-w-[130px] py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel
                  </button>
                )}
              </div>

            </div>
          </div>
          {loadingStatus && (
            <div className="absolute inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            </div>
          )}


          {/* Helper hint */}
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Tip: To dispatch multiple Confirmed orders, select them in the list and use
            “Download Selected PDF”.
          </div>
        </div>
      </div>
    </div>
  );
};



// 🧩 Info Row
const Info = ({ label, value, icon }) => (
  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
    <div className="text-green-600 mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-all">{value}</p>
    </div>
  </div>
);

// 🧩 Loading Skeleton
const LoadingSkeleton = ({ count }) => (
  <div className="divide-y divide-gray-100">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="px-6 py-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* -------------------------- small utilities -------------------------- */

function toFixed2(n) {
  const num = Number(n || 0);
  return num.toFixed(2);
}

function money(n) {
  return `₹${toFixed2(n)}`;
}

function safeDate(v) {
  try {
    if (!v) return null;
    if (typeof v === "string" || v instanceof Date) return new Date(v);
    if (v.$date) return new Date(v.$date);
    return new Date(v);
  } catch {
    return null;
  }
}

function formatDateTime(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "-";
  }
}

function displayAddress(order) {
  const a = (order.addresses && order.addresses[0]) || {};
  const parts = [a.street, a.city, a.state, a.pincode].filter(Boolean);
  return parts.length ? parts.join(", ") : "-";
}

export default AdminOrderManagement;