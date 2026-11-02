import React, { useState, useMemo, useEffect } from 'react';
// Assuming useCart, API_BASE_URL, and necessary icons are imported from context/files
// NOTE: I am redefining the context/icon imports here for completeness.
import {
  MapPin,
  CreditCard,
  ShoppingCart,
  Truck,
  Wallet,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Package,
  Loader,
  Edit,
  Trash2,
  Plus,
  Home,
  Briefcase,
  Navigation,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { FaEdit, FaPlus } from "react-icons/fa";
import DialogBox from "../components/DialogBox"; // adjust the path if needed
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

// Mock context/constant imports for a standalone file (replace with actual imports if needed)
// const useCart = () => ({ clearCart: () => console.log("Cart Cleared") });
const API_BASE_URL = 'http://localhost:8080/api/orders';

// --- Utility Components (Themed) ---

const CheckoutCard = ({ title, icon: Icon, children }) => (
  <div className="bg-[var(--secondary)] p-5 rounded-xl shadow-lg border border-gray-200 mb-4">
    <div className="flex items-center space-x-3 mb-3 border-b pb-2 border-gray-200">
      <Icon className="w-6 h-6 text-[var(--primary)]" />
      <h2 className="text-lg font-semibold text-[var(--accent)]">{title}</h2>
    </div>
    {children}
  </div>
);

const PrimaryButton = ({ children, onClick, disabled = false, loading = false }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full py-3 px-5 rounded-xl font-bold transition duration-300 transform 
      ${disabled || loading
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-[var(--primary)] hover:bg-opacity-80 text-white shadow-md hover:scale-[1.01] active:scale-[0.99]'
      }`}
  >
    {loading ? (
      <div className="flex items-center justify-center space-x-2">
        <Loader className="w-4 h-4 animate-spin" />
        <span>Processing...</span>
      </div>
    ) : (
      children
    )}
  </button>
);

// --- Delivery Address Section (Themed) ---

const DeliveryAddress = ({ address, setAddress, userProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const getUserData = () => {
    if (userProfile) {
      const userData = {
        name: userProfile.name || userProfile.value?.name || 'Your Name',
        phone: userProfile.number || userProfile.value?.number || '',
        email: userProfile.email || userProfile.value?.email || 'your.email@example.com'
      };
      return userData;
    }

    try {
      const userName = localStorage.getItem('userName') || 'Your Name';
      const userPhone = localStorage.getItem('userPhone') || '';
      const userEmail = localStorage.getItem('email') || 'your.email@example.com';

      const userData = {
        name: userName,
        phone: userPhone,
        email: userEmail
      };
      return userData;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return {
        name: 'Your Name',
        phone: '',
        email: 'your.email@example.com'
      };
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      getUserData();

      const storedAddresses = localStorage.getItem('userAddresses');
      if (storedAddresses) {
        const addresses = JSON.parse(storedAddresses);
        setSavedAddresses(addresses);

        if (addresses.length > 0 && !selectedAddressId) {
          setSelectedAddressId(addresses[0].id);
          setAddress(addresses[0]);
        }
      }

      if (!storedAddresses) {
        // Mock default address if none saved
        const defaultAddress = {
          id: 'addr_1',
          street: '123 Main Street',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          addressType: 'HOME',
          isDefault: true
        };
        const addresses = [defaultAddress];
        setSavedAddresses(addresses);
        setSelectedAddressId('addr_1');
        setAddress(defaultAddress);
        localStorage.setItem('userAddresses', JSON.stringify(addresses));
      }

    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  useEffect(() => {
    if (selectedAddressId && savedAddresses.length > 0) {
      const selected = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (selected) {
        setAddress(selected);
      }
    }
  }, [selectedAddressId, savedAddresses]);

  const handleSaveAddress = (e) => {
    e.preventDefault();

  if (!address.pincode || address.pincode.length !== 6) {
  setDialogType("validationError"); // Or use "custom"
  setDialogMessage("Please enter a valid 6-digit pincode");
  setDialogOpen(true);
  return;
}


    let updatedAddresses = [...savedAddresses];

    if (isEditing && editingAddressId) {
      updatedAddresses = updatedAddresses.map(addr =>
        addr.id === editingAddressId ? { ...address, id: editingAddressId } : addr
      );
    } else {
      const newAddress = {
        ...address,
        id: `addr_${Date.now()}`,
        addressType: address.addressType || 'HOME'
      };
      updatedAddresses.push(newAddress);
      setSelectedAddressId(newAddress.id);
    }

    setSavedAddresses(updatedAddresses);
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));

    setIsEditing(false);
    setIsAddingNew(false);
    setEditingAddressId(null);
  };

  const handleEditAddress = (addressToEdit) => {
    setAddress(addressToEdit);
    setEditingAddressId(addressToEdit.id);
    setIsEditing(true);
    setIsAddingNew(false);
  };

  const handleAddNewAddress = () => {
    setAddress({
      street: '',
      city: '',
      state: '',
      pincode: '',
      addressType: 'HOME'
    });
    setIsAddingNew(true);
    setIsEditing(false);
    setEditingAddressId(null);
  };

  const handleDeleteAddress = (addressId) => {
    if (savedAddresses.length === 1) {
  setDialogType("validationError");
  setDialogMessage("You must have at least one address");
  setDialogOpen(true);
  return;
}


    const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
    setSavedAddresses(updatedAddresses);
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));

    if (selectedAddressId === addressId) {
      const newSelected = updatedAddresses[0]?.id || null;
      setSelectedAddressId(newSelected);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAddingNew(false);
    setEditingAddressId(null);

    if (selectedAddressId) {
      const selected = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (selected) {
        setAddress(selected);
      }
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'HOME': return <Home size={16} />;
      case 'WORK': return <Briefcase size={16} />;
      default: return <Navigation size={16} />;
    }
  };

  const getAddressTypeColor = (type) => {
    switch (type) {
      // Use var(--primary) for HOME type
      case 'HOME': return 'text-[var(--dark)] bg-[var(--primary)]/50 bg-opacity-10';
      case 'WORK': return 'text-[var(--dark)] bg-[var(--primary)]/30';
      default: return 'text-[var(--dark)] bg-[var(--primary)]/30';
    }
  };

  const showForm = isEditing || isAddingNew;
  const userData = getUserData();

  const navigate = useNavigate();
  const { clearCart } = useCart();

  const handlePlaceOrder = async () => {
    // 1. You need the order payload data (e.g., cart items, delivery address, payment method, etc.)
    const orderPayload = {
      // ... your logic to construct the order payload
      userId: localStorage.getItem("userId"),
      // ... other necessary data
    };

    try {
      // 2. Call the backend API to place the order (which should internally clear the cart on the server)
      const response = await axiosInstance.post(`/api/orders/place`, orderPayload);

      if (response.status === 201 || response.status === 200) {
        // 3. SUCCESS: Order placed successfully on the backend.
        
        // 🌟 THIS IS THE CRUCIAL STEP 🌟
        // Clear the local state in the CartContext so the navbar count updates to 0.
        clearCart(); 

        // 4. Navigate the user to a success page or order history
        navigate("/order-success");
      }
    } catch (error) {
      console.error("❌ Error placing order:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };
  return (
    <CheckoutCard title="Delivery Address" icon={MapPin}>
      <div className="text-[var(--accent)]">
        <p className="font-medium text-[var(--accent)] mb-3">Delivering to:</p>

        {loadingAddresses ? (
          <div className="flex justify-center py-4">
            <Loader className="w-6 h-6 animate-spin text-[var(--primary)]/50" />
          </div>
        ) : !showForm ? (
          <div className="space-y-4">
            {savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedAddressId === addr.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/20 bg-opacity-5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2 mb-2">
                        {getAddressIcon(addr.addressType)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAddressTypeColor(addr.addressType)}`}>
                          {addr.addressType}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(addr);
                          }}
                          className="text-gray-500 hover:text-[var(--primary)] transition"
                        >
                          <Edit size={16} />
                        </button>
                        {savedAddresses.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(addr.id);
                            }}
                            className="text-gray-500 hover:text-red-500 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-[var(--accent)]">{userData.name}</p>
                      <p className="text-gray-700">{addr.street}</p>
                      {(addr.city || addr.pincode) && (
                        <p className="text-gray-600">
                          {addr.city} {addr.city && addr.pincode ? ',' : ''} {addr.pincode}
                        </p>
                      )}
                      {addr.state && (
                        <p className="text-gray-600">{addr.state}</p>
                      )}
                      <p className="text-gray-500 flex items-center gap-1 mt-1">
                        <Phone size={12} />
                        {addr.phone || userData.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 text-sm">No addresses saved. Please add your delivery address.</p>
              </div>
            )}

            <button
              onClick={handleAddNewAddress}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] transition duration-200"
            >
              <Plus size={18} />
              <span>Add New Address</span>
            </button>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSaveAddress}>
            <div className="bg-[var(--primary)]/50 p-3 rounded-lg border border-[var(--primary)]/50">
              <p className="text-sm font-medium text-[var(--dark)] mb-2">
                {isEditing ? (
                  <>
                    <FaEdit className="inline mr-1 text-[var(--dark)]" /> Edit Address
                  </>
                ) : (
                  <>
                    <FaPlus className="inline mr-1 text-[var(--dark)]" /> Add New Address
                  </>
                )}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="Full Name"
                value={userData.name}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Name from your profile</p>
            </div>

            <div>
  <label className="block text-xs font-medium text-gray-700 mb-1">
    Phone Number *
  </label>

  <div className="flex items-center gap-1 border border-gray-300 rounded-lg bg-white focus-within:border-[var(--primary)] focus-within:ring-[var(--primary)] px-2">
    <span className="text-gray-600 text-sm font-semibold">+91</span>
    <input
      type="tel"
      placeholder="Enter Mobile Number"
      value={address.phone || userData.phone}
      onChange={(e) =>
        setAddress((prev) => ({
          ...prev,
          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
        }))
      }
      className="w-full p-2 focus:outline-none text-sm bg-white"
      required
    />
  </div>

  <p className="text-xs text-gray-500 mt-1">
    This number will be used for delivery updates.
  </p>
</div>


            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Street Address *</label>
              <textarea
                placeholder="House No., Building, Street, Area"
                value={address.street}
                onChange={(e) => setAddress((prev) => ({ ...prev, street: e.target.value }))}
                rows="2"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  placeholder="6-digit Pincode"
                  value={address.pincode}
                  onChange={(e) => setAddress((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm"
                  required
                  pattern="[0-9]{6}"
                  title="Please enter a valid 6-digit pincode"
                  maxLength="6"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address Type</label>
                <select
                  value={address.addressType || 'HOME'}
                  onChange={(e) => setAddress((prev) => ({ ...prev, addressType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]/50 text-sm"
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-opacity-80 transition text-sm"
              >
                {isEditing ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        )}
      </div>
    </CheckoutCard>
  );
};

// --- Payment Method Section (Themed) ---

const PaymentMethod = ({ paymentMethod, setPaymentMethod }) => {
  const options = [
    { value: 'card', label: 'Credit/Debit Card (Razorpay)', icon: CreditCard },
    { value: 'upi', label: 'UPI / NetBanking (Razorpay)', icon: Wallet },
    { value: 'cash', label: 'Cash on Delivery (COD)', icon: Package },
  ];

  return (
    <CheckoutCard title="Payment Method" icon={CreditCard}>
      <div className="space-y-2.5">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => setPaymentMethod(option.value)}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition duration-200 
            ${paymentMethod === option.value
                ? 'bg-[var(--primary)]/20 bg-opacity-5 ring-2 ring-[var(--primary)]'
                : 'bg-white hover:bg-gray-50 border border-gray-200'
              }`}
          >
            <input
              type="radio"
              name="payment"
              value={option.value}
              checked={paymentMethod === option.value}
              onChange={() => setPaymentMethod(option.value)}
              className="h-4 w-4 accent-[var(--dark)]"
            />
            <option.icon className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-[var(--accent)] text-sm">{option.label}</span>
          </div>
        ))}
        {paymentMethod === 'card' && (
          <div className="p-2 border border-dashed border-[var(--primary)]/200 rounded-lg text-xs text-[var(--accent)]">
            Card details will be collected securely via Razorpay.
          </div>
        )}
        {paymentMethod === 'cash' && (
          <div className="p-2 border border-dashed border-[var(--primary)] rounded-lg text-xs text-[var(--accent)]">
            Pay when your order arrives at your doorstep
          </div>
        )}
      </div>
    </CheckoutCard>
  );
};

// --- Order Summary Section (Themed) ---

const OrderSummary = ({ cartItems, totalAmount, pricingBreakdown }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const gstPercentage = pricingBreakdown?.gstPercentage || 5;
  const tax = pricingBreakdown?.gstAmount || (subtotal * 0.05);
  const deliveryFee = pricingBreakdown?.deliveryCharge !== undefined ? pricingBreakdown.deliveryCharge : 49.0;

  const summary = [
    { label: 'Subtotal (Items)', value: subtotal },
    { label: 'Delivery Fee', value: deliveryFee, icon: Truck, color: deliveryFee === 0 ? 'text-[var(--primary)]' : '' },
    { label: `GST (${gstPercentage}%)`, value: tax },
  ];

  const formatPrice = (price) => `₹${Math.abs(price).toFixed(2)}`;

  const getItemDisplayName = (item) => {
    if (item.type === 'fruitPlate') {
      return `Fruit Plate - ${item.size}`;
    } else if (item.type === 'customizedTiffin') {
      return `Customized Tiffin`;
    } else {
      return item.name || item.menuData?.menuName || `Item #${item.menuItemId}`;
    }
  };

  const getItemImage = (item) => {
    if (item.imageUrl) {
      return item.imageUrl;
    }

    if (item.type === 'fruitPlate') {
      return '/Images/fruit-plate.jpg';
    } else if (item.type === 'customizedTiffin') {
      return '/Images/custom-tiffin.jpg';
    } else {
      return item.menuData?.imageUrl || '/Images/default-food.jpg';
    }
  };

  return (
    <CheckoutCard title="Order Summary" icon={ShoppingCart}>
      <div className="mb-3 ">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between  items-center py-2 text-sm font-medium text-gray-800 hover:text-[var(--primary)] transition"
        >
          <span>{cartItems.length} Items in Cart</span>
          <div className="text-[var(--primary)]">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        {isExpanded && (
          <div className="border-t pt-3 space-y-2 max-h-48 overflow-y-auto border-gray-200">
            {cartItems.map((item, index) => (
              <div key={item.id || item.menuItemId || index} className="flex justify-between items-center text-sm text-gray-700">
                <span className="flex items-center space-x-3">
                  <img
                    src={getItemImage(item)}
                    alt={getItemDisplayName(item)}
                    className="w-10 h-10 rounded-md object-cover border border-gray-200"
                    onError={(e) => {
                      e.target.src = '/Images/default-food.jpg';
                    }}
                  />
                  <div>
                    <p className="font-medium">{getItemDisplayName(item)}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </span>
                <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 border-y py-3 mb-3 border-gray-200">
        {summary.map((item, index) => (
          <div key={index} className={`flex justify-between text-gray-700 text-sm ${item.color || ''}`}>
            <span className="flex items-center space-x-1">
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </span>
            <span className={item.label === 'Delivery Fee' && item.value === 0 ? 'text-[var(--primary)] font-semibold' : 'font-semibold'}>
              {item.label === 'Delivery Fee' && item.value === 0 ? 'FREE' : formatPrice(item.value)}
            </span>
          </div>
        ))}
      </div>

      {pricingBreakdown?.deliveryCharge > 0 && pricingBreakdown?.freeDeliveryThreshold && (
        <div className="text-xs text-gray-500 mb-2 text-center">
          Add ₹{(pricingBreakdown.freeDeliveryThreshold - subtotal).toFixed(2)} more for free delivery
        </div>
      )}

      <div className="flex justify-between items-center text-lg font-bold text-[var(--accent)] pt-2 border-t border-gray-200">
        <span>Order Total</span>
        <span className="text-[var(--dark)] text-xl">{formatPrice(totalAmount)}</span>
      </div>
    </CheckoutCard>
  );
};

// --- User Info Section (Themed) ---

const UserInfo = ({ userProfile }) => {
  const userData = {
    name: userProfile?.name || localStorage.getItem('userName') || 'Your Name',
    phone: userProfile?.number || localStorage.getItem('userPhone') || '',
    email: userProfile?.email || localStorage.getItem('email') || 'your.email@example.com'
  };

  // return (
  //   <CheckoutCard title="Contact Information" icon={User}>
  //     <div className="space-y-2">
  //       <div className="flex items-center space-x-3">
  //         <User className="w-4 h-4 text-[var(--gray)]" />
  //         <div>
  //           <p className="font-medium text-[var(--accent)]">{userData.name}</p>
  //           <p className="text-xs text-gray-500">Full Name</p>
  //         </div>
  //       </div>
  //       <div className="flex items-center space-x-3">
  //         <Phone className="w-4 h-4 text-[var(--gray)]" />
  //         <div>
  //           <p className="font-medium text-[var(--accent)]">{userData.phone}</p>
  //           <p className="text-xs text-gray-500">Mobile Number</p>
  //         </div>
  //       </div>
  //       <div className="flex items-center space-x-3">
  //         <Mail className="w-4 h-4 text-[var(--gray)]" />
  //         <div>
  //           <p className="font-medium text-[var(--accent)]">{userData.email}</p>
  //           <p className="text-xs text-gray-500">Email Address</p>
  //         </div>
  //       </div>
  //     </div>
  //   </CheckoutCard>
  // );
};

// --- Main Checkout Component (Full Logic & Themed) ---

const Checkout = () => {
  const { clearCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'HOME',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [pricingBreakdown, setPricingBreakdown] = useState({
    subtotal: 0,
    gstAmount: 0,
    deliveryCharge: 0,
    totalAmount: 0,
    gstPercentage: 5,
    freeDeliveryThreshold: 150
  });

const [dialogOpen, setDialogOpen] = useState(false);
const [dialogType, setDialogType] = useState("");
const [dialogMessage, setDialogMessage] = useState("");
const [dialogTitle, setDialogTitle] = useState("");


  // Get user data properly
  const getUserData = () => {
    if (userProfile) {
      return {
        name: userProfile.name || userProfile.value?.name || 'Your Name',
        phone: userProfile.number || userProfile.value?.number || '',
        email: userProfile.email || userProfile.value?.email || 'your.email@example.com'
      };
    }

    try {
      return {
        name: localStorage.getItem('userName') || 'Your Name',
        phone: localStorage.getItem('userPhone') || '',
        email: localStorage.getItem('email') || 'your.email@example.com'
      };
    } catch (error) {
      console.error(' Error getting user data:', error);
      return {
        name: 'Your Name',
        phone: '',
        email: 'your.email@example.com'
      };
    }
  };

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("token");

        if (!email) {
          console.warn(" No email in localStorage");
          setUserLoading(false);
          return;
        }

        const url = `http://localhost:8080/api/auth/user?email=${encodeURIComponent(email)}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.ok) {
          const user = await response.json();
          const normalizedProfile = {
            name: user?.name || "",
            email: user?.email || "",
            address: user?.address || "",
            phone: user?.number || "",
          };
          setUserProfile(normalizedProfile);

          // Set phone in address if available
          if (normalizedProfile.phone) {
            setAddress(prev => ({ ...prev, phone: normalizedProfile.phone }));
          }

        } else {
          console.error(" Failed to fetch user profile:", response.status);
        }
      } catch (err) {
        console.error(" Error fetching user profile:", err);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch cart data from API
  useEffect(() => {
    const fetchCartFromAPI = async () => {
      try {
        console.log(" Fetching cart data from API...");

        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          console.log("User not logged in");
          setCartLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/api/cart/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const cartData = await response.json();
          console.log(" Full cart data from API:", cartData);

          let allCartItems = [];

          // Process regular menu items
          if (cartData.items && Array.isArray(cartData.items)) {
            const menuItemsWithDetails = await Promise.all(
              cartData.items.map(async (item) => {
                try {
                  const menuResponse = await fetch(`http://localhost:8080/api/menu/${item.menuItemId}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });

                  if (menuResponse.ok) {
                    const menuData = await menuResponse.json();
                    return {
                      ...item,
                      menuData: menuData,
                      imageUrl: menuData.imageUrl,
                      name: menuData.menuName,
                      id: item.menuItemId,
                      type: 'regular'
                    };
                  }
                } catch (error) {
                  console.error(` Error fetching menu item ${item.menuItemId}:`, error);
                }
                return {
                  ...item,
                  id: item.menuItemId,
                  name: `Item #${item.menuItemId}`,
                  type: 'regular'
                };
              })
            );
            allCartItems = [...allCartItems, ...menuItemsWithDetails];
          }

          // Process fruit bowl orders
          if (cartData.fruiteBowlOrders && Array.isArray(cartData.fruiteBowlOrders)) {
            const fruitBowlItems = cartData.fruiteBowlOrders.map(bowl => ({
              ...bowl,
              id: bowl.id,
              type: 'fruitPlate',
              name: `Fruit Plate - ${bowl.type || 'Custom'}`,
              size: bowl.type || 'MEDIUM',
              price: bowl.totalPrice || 50,
              quantity: bowl.quantity || 1
            }));
            allCartItems = [...allCartItems, ...fruitBowlItems];
          }

          // Process customized boxes
          if (cartData.box && Array.isArray(cartData.box)) {
            const boxItems = cartData.box.map(box => ({
              ...box,
              id: box.id,
              type: 'customizedTiffin',
              name: 'Customized Tiffin',
              price: box.totalPrice || 0,
              quantity: box.quantity || 1
            }));
            allCartItems = [...allCartItems, ...boxItems];
          }

          console.log(" FINAL cart items for checkout:", allCartItems);
          setCartItems(allCartItems);

        } else {
          console.log(' Failed to fetch cart from API, status:', response.status);
          setCartItems([]);
        }
      } catch (error) {
        console.error(' Error fetching cart from API:', error);
        setCartItems([]);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCartFromAPI();
  }, []);

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const totalAmount = useMemo(() => pricingBreakdown.totalAmount || subtotal, [pricingBreakdown, subtotal]);

  // Fetch pricing breakdown when subtotal changes
  useEffect(() => {
    const fetchPricingBreakdown = async () => {
      if (subtotal > 0) {
        try {
          const response = await fetch(`http://localhost:8080/api/settings/pricing-breakdown?subtotal=${subtotal}`);
          if (response.ok) {
            const data = await response.json();
            setPricingBreakdown(data);
          }
        } catch (error) {
          console.error('Error fetching pricing breakdown:', error);
        }
      }
    };
    fetchPricingBreakdown();
  }, [subtotal]);

  // Razorpay Payment Handler (Themed)
  const handleRazorpayPayment = async (paymentOrder) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded. Please check the script tag.'));
        return;
      }

      const userData = getUserData();

      const options = {
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Adhijevan Foods",
        description: "Food Order Payment",
        order_id: paymentOrder.orderId,
        handler: async function (response) {
          try {
            console.log(' Razorpay Payment Response:', response);
            console.log(' Database Order ID:', paymentOrder.databaseOrderId);

            const verifyResponse = await fetch(`${API_BASE_URL}/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: paymentOrder.databaseOrderId
              })
            });

            const verification = await verifyResponse.json();
            console.log('🔐 Payment Verification:', verification);

            if (verification.success) {
              resolve(response);
            } else {
              reject(new Error('Payment verification failed: ' + verification.message));
            }
          } catch (error) {
            console.error('❌ Payment verification error:', error);
            reject(error);
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone
        },
        theme: {
          color: "var(--primary)" // Theme applied here
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      try {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        reject(new Error('Failed to initialize Razorpay: ' + error.message));
      }
    });
  };

  // Create order with proper address format for backend
  const handlePlaceOrder = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const email = userProfile?.email || localStorage.getItem("email");

      if (!userId) throw new Error("User ID not found in localStorage.");

      // Prepare address as an object for backend
      const addressObject = {
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        addressType: address.addressType || 'HOME',
        phone: address.phone || getUserData().phone,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Prepare order items for ALL types with imageUrl
      const orderItems = cartItems.map(item => {
        if (item.type === 'fruitPlate') {
          return {
            name: `Fruit Plate - ${item.size}`,
            price: item.price,
            quantity: item.quantity,
            type: 'fruitPlate',
            imageUrl: item.imageUrl || '/Images/fruit-plate.jpg',
            details: item
          };
        } else if (item.type === 'customizedTiffin') {
          return {
            name: 'Customized Tiffin',
            price: item.price,
            quantity: item.quantity,
            type: 'customizedTiffin',
            imageUrl: item.imageUrl || '/Images/custom-tiffin.jpg',
            details: item
          };
        } else {
          return {
            name: item.name || item.menuData?.menuName || `Item #${item.menuItemId}`,
            price: item.price,
            quantity: item.quantity,
            type: 'regular',
            menuItemId: item.menuItemId,
            imageUrl: item.imageUrl || item.menuData?.imageUrl || '/Images/default-food.jpg'
          };
        }
      });

      // Prepare order data with addresses array
      const orderData = {
        userId,
        customerName: getUserData().name,
        customerPhone: address.phone || getUserData().phone,
        addresses: [addressObject],
        paymentStatus: paymentMethod === 'cash' ? 'COD' : 'Pending',
        orderStatus: paymentMethod === 'cash' ? 'COD' : 'Payment Initiated',
        orderItems: orderItems,
        totalAmount: totalAmount,
        deliveryFee: pricingBreakdown.deliveryCharge,
        tax: pricingBreakdown.gstAmount,
        paymentMethod: paymentMethod === 'cash' ? 'COD' : 'ONLINE' // ✅ NEW FIELD
      };


      console.log(" Sending order data to backend:", orderData);

      let response, orderResult;

      // Handle COD orders
      if (paymentMethod === 'cash') {
        response = await fetch(`${API_BASE_URL}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create order: ${errorText}`);
        }

        orderResult = await response.json();
        console.log("✅ COD order created:", orderResult);

        // Clear cart after successful order
        await clearCartData(userId);

        setOrderDetails(orderResult);
        setIsOrderPlaced(true);
      }
      // Handle Razorpay / online orders
      else {
        response = await fetch(`${API_BASE_URL}/create-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
        }

        const paymentOrder = await response.json();
        console.log("✅ Razorpay order created:", paymentOrder);

        await handleRazorpayPayment(paymentOrder);

        // Clear cart after successful payment
        await clearCartData(userId);

        setOrderDetails(paymentOrder);
        setIsOrderPlaced(true);
        console.log("💰 Payment successful, order placed");
      }
    } catch (error) {
  console.error("Order placement failed", error);
  setDialogType("loginError"); // Or "custom" for generic error
  setDialogMessage("Order placement failed: " + error.message + ". Please try again.");
  setDialogOpen(true);
}
 finally {
      setLoading(false);
    }
  };

  // Clear cart data from API
  const clearCartData = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      // Clear cart via API
      if (userId && token) {
        await fetch(`http://localhost:8080/api/cart/${userId}/clear`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        console.log("🧹 Cart cleared from API");
      }

      clearCart(); // Clear cart context as well

    } catch (error) {
      console.error("❌ Error clearing cart data:", error);
    }
  };

  const isFormValid = address.street && address.city && address.state && address.pincode && address.pincode.length === 6 && paymentMethod;
  const formatTotal = (amount) => `₹${amount.toFixed(2)}`;

  if (cartLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--primary)]" />
          <p className="text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (isOrderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-[var(--secondary)] p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-[var(--primary)] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--accent)] mb-2">
            {paymentMethod === 'cash' ? 'Order Confirmed!' : 'Payment Successful!'}
          </h1>
          <p className="text-gray-600 mb-6">
            {paymentMethod === 'cash'
              ? 'Your order has been placed successfully. You will pay when your order arrives.'
              : 'Your payment was successful! Your order will be delivered shortly.'}
          </p>
          <div className="bg-[var(--primary)] bg-opacity-10 p-3 rounded-lg text-[var(--secondary)] text-sm font-medium mb-6">
            Order ID: {orderDetails?.adhijevanOrderId || orderDetails?.id || `#ADHI${Math.floor(Math.random() * 900000 + 100000)}`}
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-[var(--primary)] hover:bg-opacity-80 text-white py-3 px-5 rounded-xl font-bold transition duration-300"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[var(--accent)]">
      {/* Header */}
      <div className="bg-[var(--secondary)] ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-[var(--accent)]">Checkout</h1>
          <p className="text-gray-600 mt-1">Complete your order details</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Please add some items to your cart before checkout.</p>
            <button
              onClick={() => window.location.href = '/menu'}
              className="bg-[var(--primary)] text-[var(--secondary)] py-2.5 px-6 transition duration-300"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              <UserInfo userProfile={userProfile} />
              <DeliveryAddress
                address={address}
                setAddress={setAddress}
                userProfile={userProfile}
              />
              <PaymentMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1 md:mt-0 -mt-6">
              <div className="sticky md:top-6 space-y-4">
                <OrderSummary
                  cartItems={cartItems}
                  totalAmount={totalAmount}
                  pricingBreakdown={pricingBreakdown}
                />

                <div className="bg-[var(--secondary)] p-5 rounded-xl shadow-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-3 text-center">
                    By placing your order, you agree to our terms and conditions.
                  </p>
                  <PrimaryButton
                    onClick={handlePlaceOrder}
                    disabled={!isFormValid || cartItems.length === 0}
                    loading={loading}
                  >
                    {paymentMethod === 'cash' ? 'Place Order' : 'Pay Now'}  {formatTotal(totalAmount)}
                  </PrimaryButton>

                  {paymentMethod === 'cash' && (
                    <p className="text-xs text-[var(--dark)] mt-2 text-center">
                      Pay when your order arrives
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <DialogBox
  isOpen={dialogOpen}
  onClose={() => setDialogOpen(false)}
  type={dialogType}
  customMessage={dialogMessage}
  customTitle={dialogTitle}
/>

    </div>
  );
};

export default Checkout;
