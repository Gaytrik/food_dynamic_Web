import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import ToastMessage from "../components/ToastMessage";
import { useCart } from "../context/CartContext";

const TodaysMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // ✅ Fetch Today’s Menu
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/menu/todays-menu");
        const data = Array.isArray(res.data) ? res.data : [];

        // ✅ FILTER ONLY AVAILABLE ITEMS
        const availableData = data.filter((item) => item.available === true);

        const normalized = availableData.map((item) => ({
          id: item.id,
          name: item.menuName,
          category: item.menuCategory,
          price: item.price,
          finalPrice: Math.round(Number(item.finalPrice || item.price || 0)),
          imageUrl: item.imageUrl || "/hero/feature.png",
          stock: item.stock ?? 10,
        }));

        setMenuItems(normalized.slice(0, 5));
      } catch (err) {
        console.error("❌ Error fetching today’s menu:", err);
        setError("Failed to load today’s menu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // ✅ Add to Cart
  const handleAddToCart = async (item) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setToast({
        show: true,
        message: "Please log in to add items to cart!",
        type: "error",
      });
      navigate("/login");
      return;
    }

    const payload = {
      menuItemId: item.id,
      quantity: 1,
    };

    try {
      const res = await API.post(`/api/cart/${userId}/add`, payload);
      console.log("Added to cart:", res.data);

      // ✅ Update local cart context immediately for UI (Navbar badge) responsiveness
      addToCart({
        id: item.id,
        name: item.name,
        price: item.finalPrice ?? item.price ?? 0,
        quantity: 1,
        imageUrl: item.imageUrl,
      });

      setToast({
        show: true,
        message: `${item.name} added to cart!`,
        type: "success",
      });
    } catch (error) {
      console.error("Add to cart error:", error);

      if (error.response && error.response.status === 403) {
        setToast({
          show: true,
          message: "Session expired. Please log in again.",
          type: "error",
        });
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setToast({
          show: true,
          message: "Failed to add to cart. Try again!",
          type: "error",
        });
      }
    }
  };

  const handleClick = (item) => {
    const slug = item.slug || item.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/item/${slug}`);
  };

  // ✅ Loading / Error States
  if (loading)
    return (
      <div className="py-10 text-center text-gray-600 text-lg">
        Loading today’s menu...
      </div>
    );

  if (error)
    return (
      <div className="py-10 text-center text-red-600 text-lg">{error}</div>
    );

  // ✅ Main UI - Reduced spacing version
  return (
    <div
      className="bg-[var(--secondary)] py-10 font-sans antialiased"
      style={{ color: "var(--accent)" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="text-center mb-6 relative">
         <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none 
                         transform -translate-y-4 sm:-translate-y-6"
            >
                <span className="md:mb-0 text-5xl sm:text-[1rem] md:text-[3rem] lg:text-[6rem] 
                                 font-extrabold text-[var(--gray)] opacity-10 leading-none tracking-widest">
                    Special Menu
                </span>
            </div>
          <h1
            className="text-3xl sm:text-5xl font-extrabold text-center mb-2"
            style={{ color: "var(--accent)" }}
          >
          Today's Special Menu
          </h1>
          </header>
          <p
            className="mb-2 text-center text-base sm:text-lg max-w-xl mx-auto"
            style={{ color: "var(--gray)" }}
          >
            Savor the moment with our limited-time culinary creations, crafted
            fresh daily just for you.
          </p>
        

        {/* Menu Grid */}
        <main className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="
                bg-white shadow-lg 
                hover:shadow-2xl transition-all duration-300 
                overflow-hidden group 
                border-2 border-transparent hover:border-[var(--gray)]/50
                sm:transform sm:hover:-translate-y-1 
                cursor-pointer
              "
              onClick={() => handleClick(item)}
            >
              {/* Image Section */}
              <div className="w-full h-36 sm:h-50 overflow-hidden relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Hover Layer */}
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                >
                  <FiSearch className="text-white text-3xl sm:text-4xl" />
                </div>

                {/* Cart Button - Desktop */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(item);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full text-white 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                  shadow-lg hidden sm:block"
                  style={{
                    backgroundColor: "var(--primary)",
                  }}
                  aria-label={`Add ${item.name} to cart`}
                >
                  <ShoppingCart size={20} />
                </button>
              </div>

              {/* Info Section */}
              <div className="p-3 text-left relative z-10">
                <p
                  className="text-xs uppercase tracking-widest font-bold"
                  style={{ color: "var(--primary)" }}
                >
                  {item.category || "Food"}
                </p>
                <h3
                  className="text-base font-bold line-clamp-2 mt-1 mb-2 leading-snug"
                  style={{ color: "var(--accent)" }}
                >
                  {item.name}
                </h3>

                {/* Price + Add Button */}
                <div className="flex items-center justify-between mt-2">
                  <span
                    className="text-lg sm:text-xl"
                    style={{ color: "var(--accent)" }}
                  >
                    ₹{item.finalPrice.toLocaleString("en-IN")}
                  </span>

                  {/* Mobile Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                    className="sm:hidden text-white p-2 rounded-lg text-sm font-semibold transition flex items-center shadow-md"
                    style={{
                      backgroundColor: "var(--primary)",
                    }}
                  >
                    <ShoppingCart size={16} className="mr-1" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* ✅ Toast Notification */}
      <ToastMessage
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default TodaysMenu;
