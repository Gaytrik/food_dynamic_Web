import React, { useState, useEffect, useContext } from 'react';
import InvoiceGen from "../components/InvoiceGen";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";



import {
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Filter,
  Layers,
  Loader,
  X,
  AlertTriangle,
  FileDown,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Function to determine color and icon based on status
const getStatusInfo = (status) => {
  switch (status) {
    case 'Delivered':
    case 'Confirmed':
      return {
        text: 'Delivered',
        // Theme Applied: Text color is accent, background is primary-like green
        color: 'bg-[var(--primary)]/50 text-[var(--accent)] border-[var(--primary)]/200',
        icon: CheckCircle,
      };
    case 'Preparing':
    case 'Payment Initiated':
    case 'Pending':
      return {
        text: 'Preparing',
        // Theme Applied: Text color is accent, background is yellow-like
        color: 'bg-yellow-100 text-[var(--accent)] border-yellow-200',
        icon: Clock,
      };
    case 'Cancelled':
    case 'Failed':
      return {
        text: 'Cancelled',
        // Theme Applied: Text color is accent, background is red-like
        color: 'bg-red-100 text-[var(--accent)] border-red-200',
        icon: XCircle,
      };
    default:
      return {
        text: status,
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: Clock,
      };
  }
};

const OrderCard = ({ order, onCancelOrder }) => {
  const createSlug = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-'); // replaces spaces & special chars with dashes
  };

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [itemImages, setItemImages] = useState({});
  const [loadingImages, setLoadingImages] = useState(false);
  const statusInfo = getStatusInfo(order.orderStatus || order.status);
  const Icon = statusInfo.icon;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate total from order items
  const calculateTotal = (orderItems) => {
    if (!orderItems || !Array.isArray(orderItems)) return 0;
    return orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Check if order can be cancelled (within 20 minutes)
  const canCancelOrder = () => {
    const orderDate = new Date(order.createdAt || order.date);
    const currentTime = new Date();
    const timeDifference = (currentTime - orderDate) / (1000 * 60); // difference in minutes

    const cancellableStatuses = ['Pending', 'Payment Initiated', 'Preparing', 'Confirmed'];

    return timeDifference <= 20 && cancellableStatuses.includes(order.orderStatus);
  };

  // Fetch images for order items
  const fetchItemImages = async () => {
    if (!order.orderItems || order.orderItems.length === 0) return;

    setLoadingImages(true);
    try {
      const token = localStorage.getItem("token");
      const imagePromises = order.orderItems.map(async (item) => {
        if (item.menuItemId && item.type !== 'fruitPlate' && item.type !== 'customizedTiffin') {
          try {
            const response = await fetch(`http://localhost:8080/api/menu/${item.menuItemId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const menuData = await response.json();
              return {
                menuItemId: item.menuItemId,
                imageUrl: menuData.imageUrl || '/Images/default-food.jpg'
              };
            }
          } catch (error) {
            console.error(` Error fetching image for ${item.menuItemId}:`, error);
          }
        }
        return {
          menuItemId: item.menuItemId,
          imageUrl: '/Images/default-food.jpg'
        };
      });

      const images = await Promise.all(imagePromises);
      const imagesMap = {};
      images.forEach(img => {
        if (img.menuItemId) {
          imagesMap[img.menuItemId] = img.imageUrl;
        }
      });

      console.log('Images map:', imagesMap);
      setItemImages(imagesMap);
    } catch (error) {
      console.error('Error fetching item images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Fetch images when details are opened
  useEffect(() => {
    if (isOpen && order.orderItems && order.orderItems.length > 0 && Object.keys(itemImages).length === 0) {
      fetchItemImages();
    }
  }, [isOpen]);

  const totalAmount = order.totalAmount || calculateTotal(order.orderItems);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await onCancelOrder(order._id || order.id);
      setShowCancelConfirm(false);
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  // Get image URL for an item
  const getItemImage = (item) => {
    // Try multiple possible sources for image
    return item.imageUrl ||
      item.menuData?.imageUrl ||
      itemImages[item.menuItemId] ||
      '/Images/default-food.jpg';
  };

  // Calculate remaining time for cancellation
  const getRemainingTime = () => {
    const orderDate = new Date(order.createdAt || order.date);
    const currentTime = new Date();
    const timeDifference = (currentTime - orderDate) / (1000 * 60);
    const remainingTime = 20 - timeDifference;
    return Math.max(0, Math.floor(remainingTime));
  };

  // Format address for display
  const formatAddress = (addresses) => {
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return 'No address provided';
    }

    const address = addresses[0]; // Get the first address
    if (typeof address === 'string') return address;

    // If it's an object, format it properly
    return `${address.street || ''}, ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '');
  };

  return (
    // Theme Applied: Use secondary color for card background
    <div className="bg-(--secondary) duration-300 mb-6 border border-gray-100 overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow">

      {/* Main Order Header */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">

          {/* Order ID & Date */}
          <div className="flex flex-col sm:flex-row sm:space-x-12 text-sm mb-4 lg:mb-0">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Order ID
              </p>
              {/* Theme Applied: Accent color for bold text */}
              <p className="text-lg font-bold text-[var(--accent)] mt-1">
                {order.adhijevanOrderId || order.id || `#${order._id?.slice(-6) || 'N/A'}`}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Date
              </p>
              {/* Theme Applied: Accent color for bold text */}
              <p className="text-lg font-bold text-[var(--accent)] mt-1">
                {formatDate(order.createdAt || order.date)}
              </p>
            </div>
          </div>

          {/* Total & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-4 sm:space-y-0">
            {/* Total */}
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Total Paid
              </p>
              {/* Theme Applied: Primary color for total paid */}
              <p className="text-2xl text-[var(--dark)] mt-1">
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>

            {/* Status Badge */}
            <div
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold tracking-wide ${statusInfo.color} border rounded-lg`}
            >
              <Icon size={18} />
              <span>{statusInfo.text}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <User size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Customer
              </p>
              <p className="font-semibold text-[var(--accent)]">
                {order.customerName || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Phone
              </p>
              <p className="font-semibold text-[var(--accent)]">
                {order.customerPhone || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mt-4 flex items-start space-x-3">
          <MapPin size={16} className="text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Delivery Address
            </p>
            <p className="font-semibold text-[var(--accent)] text-sm">
              {formatAddress(order.addresses)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center bg-gray-50 border-t border-gray-200 space-y-3 sm:space-y-0">

        {/* Details Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          // Theme Applied: Primary color for button text
          className="flex items-center text-sm font-semibold text-[var(--primary)] transition duration-150"
        >
          <Layers size={18} className="mr-1.5" />
          {isOpen ? 'Hide Order Details' : 'View Order Details'}
          {isOpen ? (
            <ChevronUp size={20} className="ml-1" />
          ) : (
            <ChevronDown size={20} className="ml-1" />
          )}
        </button>

        <div className="flex flex-wrap gap-3">
          {/* Cancel Order Button */}
          {canCancelOrder() && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition duration-200"
              title={`Cancel order (${getRemainingTime()} minutes remaining)`}
            >
              <X size={16} className="mr-1.5" />
              Cancel Order ({getRemainingTime()}m)
            </button>
          )}

          {/* Download Invoice Button */}
          <button
            onClick={() => InvoiceGen(order)}
            // Theme Applied: Primary color for button background
            style={{ backgroundColor: 'var(--primary)' }}
            className="flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg hover:brightness-110 transition duration-200"
          >
            <FileDown size={16} className="mr-1.5" />
            Download Invoice
          </button>



        </div>
      </div>

      {/* Details Section */}
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {/* Theme Applied: Accent color for details header */}
          <h3 className="text-lg font-bold mb-4 text-[var(--accent)] border-b pb-2">
            Order Items
          </h3>

          {loadingImages && (
            <div className="flex justify-center py-4">
              {/* Theme Applied: Primary color for loader */}
              <Loader className="w-6 h-6 animate-spin text-[var(--primary)]" />
            </div>
          )}

          {order.orderItems && order.orderItems.length > 0 ? (
            <div className="space-y-3">
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    const type = item.type?.toLowerCase();

                    // Redirect to /menu if it's a special item type
                    if (type === 'fruit-plate' || type === 'customized-tiffin') {
                      navigate('/menu');
                    } else {
                      navigate(`/item/${item.slug || createSlug(item.name)}`);
                    }
                  }}

                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-gray-200 space-y-3 sm:space-y-0 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="relative flex-shrink-0">
                      <img
                        src={getItemImage(item)}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-300 hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="flex-1">
                      <span className="font-semibold text-[var(--accent)] block hover:underline">
                        {item.name || `Item #${item.menuItemId}`}
                      </span>
                      <span className="text-sm text-[var(--dark)] ">
                        Quantity: {item.quantity} × ₹{item.price?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No items found in this order</p>
          )}

          {/* Order Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex gap-2">
                <span className="font-medium text-gray-600">Payment Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.paymentStatus === 'Paid'
                  // Theme Applied: Use primary color for paid status text
                  ? 'bg-[var(--primary)]/50 text-[var(--primary)]'
                  : order.paymentStatus === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : order.paymentStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : order.paymentStatus === 'Unpaid'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                  {order.paymentStatus || 'Unknown'}
                </span>
              </div>


              {order.deliveryFee > 0 && (
                <div className="flex gap-2 ">
                  <span className="font-medium text-gray-600">Delivery Fee:</span>
                  <span className="font-semibold text-[var(--accent)]">₹{order.deliveryFee?.toFixed(2)}</span>
                </div>
              )}

              {order.tax > 0 && (
                <div className="flex gap-2">
                  <span className="font-medium text-gray-600">Tax:</span>
                  <span className="font-semibold text-[var(--accent)]">₹{order.tax?.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total Amount */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg">
                <span>Order Total:</span>
                {/* Theme Applied: Primary color for order total */}
                <span className="text-[var(--dark)]">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Cancellation Notice */}
            {canCancelOrder() && (
              <div className="mt-4 p-3 bg-[var(--primary)]/10 border border-[var(--primary)] rounded-lg">
                <div className="flex items-center space-x-2 text-[var(--dark)]">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium">
                    You can cancel this order within 20 minutes of placement. {getRemainingTime()} minutes remaining.
                    {order.paymentStatus === 'Paid' && ' Amount will not be refunded for online payments.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Theme Applied: Secondary color for modal background */}
          <div className="bg-[var(--secondary)] rounded-xl p-6 max-w-md w-full border border-gray-200 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-bold text-[var(--accent)]">Cancel Order?</h3>
            </div>

            <p className="text-gray-600 mb-2">
              Are you sure you want to cancel this order?
            </p>

            {order.paymentStatus === 'Paid' && (
              <p className="text-red-500 text-sm mb-4">
                Note: Amount paid will not be refunded as per our cancellation policy.
              </p>
            )}

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-600">
                <strong>Order ID:</strong> {order.adhijevanOrderId || order.id}<br />
                <strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}<br />
                <strong>Time Remaining:</strong> {getRemainingTime()} minutes
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex items-center space-x-2 justify-center"
              >
                {cancelling ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <X size={16} />
                    <span>Cancel Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function OrderHistory() {
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter options
  const filters = [
    'All Orders',
    'Confirmed',
    'Preparing',
    'Delivered',
    'Cancelled',
    'Pending'
  ];

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          toast.error("Please login to view your orders");
          setError("User not logged in");
          setLoading(false);
          return;
        }

        console.log(" Fetching orders from backend...");

        let response;
        try {
          // Try user-specific endpoint first
          response = await axios.get(`http://localhost:8080/api/orders/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(" User-specific orders data received:", response.data);
        } catch (userError) {
          console.log(" User-specific endpoint failed, trying all orders...");
          response = await axios.get('http://localhost:8080/api/orders', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(" All orders data received:", response.data);
        }

        if (response.data && Array.isArray(response.data)) {
          // Filter orders by userId if we got all orders
          let userOrders = response.data;
          if (!response.config.url.includes('/user/')) {
            userOrders = response.data.filter(order => order.userId === userId);
          }

          // Sort orders by date (newest first)
          const sortedOrders = userOrders.sort((a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
          );
          setOrders(sortedOrders);
        } else {
          setOrders([]);
        }

      } catch (error) {
        console.error(" Error fetching orders:", error);
        setError("Failed to load orders. Please try again.");
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("User ID not found. Please login again.");
        return false;
      }

      const response = await axios.put(
        `http://localhost:8080/api/orders/${orderId}/cancel`,
        { userId: userId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Update the order status in local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId || order.id === orderId
              ? {
                ...order,
                orderStatus: 'Cancelled',
                paymentStatus: 'Cancelled',
                updatedAt: new Date().toISOString()
              }
              : order
          )
        );
        return true;
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      console.error(" Error cancelling order:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel order';
      throw new Error(errorMessage);
    }
  };

  // Filter orders based on active filter
  const filteredOrders = activeFilter === 'All Orders'
    ? orders
    : orders.filter(order => order.orderStatus === activeFilter);

  if (loading) {
    return (
      // Theme Applied: Use gray-50 for component background
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              {/* Theme Applied: Primary color for loader */}
              <Loader className="w-12 h-12 animate-spin text-[var(--primary)] mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Theme Applied: Secondary color for error card background */}
          <div className="text-center p-12 bg-[var(--secondary)] rounded-2xl shadow-xl mt-10 border border-dashed border-gray-300">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-gray-600">{error}</p>
            <p className="text-md text-gray-400 mt-3">
              Please try refreshing the page or check your connection.
            </p>
            <button
              onClick={() => window.location.reload()}
              // Theme Applied: Primary color for button background
              style={{ backgroundColor: 'var(--primary)' }}
              className="mt-4 px-6 py-2 text-white rounded-lg hover:brightness-110 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        {/* Theme Applied: Secondary color for header background */}
        <header className="mb-8 p-6 bg-[var(--secondary)] rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              {/* Theme Applied: Accent color for main title, Primary color for icon */}
              <h1 className="text-3xl font-bold text-[var(--accent)] flex items-center">
                <ShoppingBag size={32} className="mr-3 text-[var(--primary)]" />
                My Orders
              </h1>
              <p className="text-gray-600 mt-2">
                A comprehensive look at all your past delicious meals.
              </p>
            </div>


          </div>

          {/* Filter Tabs */}
          <div className="mt-6 flex overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 px-4 py-2 mr-2 rounded-lg text-sm font-medium transition duration-200 ${
                  // Theme Applied: Active filter uses Primary color
                  activeFilter === filter
                    ? 'bg-[var(--primary)] text-white'
                    // Theme Applied: Inactive filter uses Secondary/Gray background and Accent text
                    : 'bg-gray-100 text-[var(--accent)] hover:bg-gray-200'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </header>

        {/* Orders List */}
        <section>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id || order._id}
                order={order}
                onCancelOrder={handleCancelOrder}
              />
            ))
          ) : (
            // Theme Applied: Secondary color for empty state card background
            <div className="text-center p-12 bg-[var(--secondary)] rounded-2xl shadow-sm mt-10 border border-dashed border-gray-300">
              <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-2xl font-semibold text-gray-600">
                {orders.length === 0 ? 'No orders found' : 'No orders matching this filter'}
              </p>
              <p className="text-md text-gray-400 mt-3">
                {orders.length === 0
                  ? 'Your order history is empty. Start ordering delicious food!'
                  : 'Try selecting a different filter to see more orders.'}
              </p>
              <button
                onClick={() => window.location.href = '/menu'}
                // Theme Applied: Primary color for button background
                style={{ backgroundColor: 'var(--primary)' }}
                className="mt-4 px-6 py-2 text-white rounded-lg hover:brightness-110 transition"
              >
                Browse Menu
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}