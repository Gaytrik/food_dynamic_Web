import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import API from "../api/axiosInstance";
import DialogBox from "../components/DialogBox"; // <-- new
import { useCart } from "../context/CartContext";
import OverviewSection from "../components/OverviewSection";
import { Share2, Star } from "lucide-react";
import RelatedCarousel from "../components/RelatedCarousel";

const MenuDetail = () => {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [averageRating, setAverageRating] = useState(4.5);
  const { addToCart } = useCart();
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "cartSuccess",
    customMessage: "",
    customTitle: "",
  });
  const navigate = useNavigate();


  useEffect(() => {
    // Convert slug to lowercase to make matching consistent
    const lowerSlug = slug.toLowerCase();

    // If slug starts with restricted types, redirect to /menu
    if (
      lowerSlug.startsWith("fruit-plate") ||
      lowerSlug.startsWith("customized-tiffin")
    ) {
      navigate("/menu");
    }
  }, [slug, navigate]);

  // ✅ Fetch menu item
  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/menu/all`);
        const data = Array.isArray(res.data) ? res.data : [];

        // ✅ FILTER ONLY AVAILABLE ITEMS
        const availableData = data.filter((it) => it.available === true);

        const normalized = availableData.map((it) => ({
          id: it.id,
          name: it.menuName,
          slug:
            it.menuName
              ?.toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "") || `item-${it.id}`,
          image: it.imageUrl || "/hero/feature.png",
          price: Math.round(Number(it.price || 0)),
          finalPrice: Math.round(Number(it.finalPrice || it.price || 0)),
          discount: Number(it.discount || 0),
          category: it.menuCategory,
          restaurant: "AadhiJevan",
          stock: it.stock ?? 10,
          description: it.description,
          reviews: it.reviews || [], // ✅ added reviews field
        }));

        const found = normalized.find((i) => i.slug === slug);
        setItem(found || null);

        // Related items
        let related = normalized.filter(
          (i) =>
            i.slug !== slug &&
            i.category?.toLowerCase() === found?.category?.toLowerCase()
        );
        if (related.length === 0)
          related = normalized.filter((i) => i.slug !== slug).slice(0, 4);
        else related = related.slice(0, 8);
        setRelatedItems(related);
      } catch (err) {
        console.error("Error fetching menu detail:", err);
        // show a dialog error if desired
        setDialog({
          isOpen: true,
          type: "cartError",
          customMessage: "Failed to load item details. Please try again.",
          customTitle: "Load failed",
        });

      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [slug]);

  // ✅ Calculate average rating from item.reviews
  useEffect(() => {
    if (!item) return;

    try {
      const reviews = Array.isArray(item.reviews) ? item.reviews : [];

      const activeReviews = reviews.filter(
        (r) => r.isActive && typeof r.rating === "number" && r.rating > 0
      );

      if (activeReviews.length > 0) {
        const total = activeReviews.reduce((sum, r) => sum + Number(r.rating), 0);
        const avg = total / activeReviews.length;
        setAverageRating(Number(avg.toFixed(1)));
      } else {
        setAverageRating(4.5);
      }
    } catch (err) {
      console.error("Error calculating average rating:", err);
      setAverageRating(4.5);
    }
  }, [item]);

  // ✅ Quantity Controls
  const handleQuantityChange = (type) => {
    if (type === "inc" && quantity < (item?.stock || 1)) setQuantity(quantity + 1);
    else if (type === "dec" && quantity > 1) setQuantity(quantity - 1);
  };

  // ✅ Add to Cart
  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setDialog({
        isOpen: true,
        type: "notLoggedIn",
        customMessage: "You must be logged in to add items to cart.",
        customTitle: "Not Logged In",
      });
      setTimeout(() => {
        navigate("/login");
      }, 600); // small delay so user sees dialog (Dialog auto closes too)
      return;
    }

    const payload = { menuItemId: item.id, quantity: quantity };

    try {
      await API.post(`/api/cart/${userId}/add`, payload);
      addToCart({ ...item, quantity });
      setDialog({
        isOpen: true,
        type: "cartSuccess", // DialogBox knows cartSuccess auto-close
        customMessage: `${item.name} added to cart!`,
        customTitle: "Added to Cart",
      });
    } catch (error) {
      console.error("❌ Add to cart error:", error);
      if (error.response && error.response.status === 403) {
        setDialog({
          isOpen: true,
          type: "loginError",
          customMessage: "Session expired. Please login again.",
          customTitle: "Session expired",
        });
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setDialog({
          isOpen: true,
          type: "cartError",
          customMessage: "Failed to add to cart. Try again!",
          customTitle: "Add failed",
        });
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: item.name,
          text: `Check out this delicious dish: ${item.name}! 🍽️`,
          url: window.location.href,
        })
        .catch((err) => console.error("❌ Share failed:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 min-h-screen bg-[var(--secondary)]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--primary)] mx-auto"></div>
        <p className="mt-4 text-[var(--accent)]">Loading details...</p>
      </div>
    );

  if (!item)
    return (
      <div className="text-center py-20 min-h-screen text-[var(--primary)] text-xl">
        404 - Item Not Found!
      </div>
    );

  const isOutOfStock = item.stock === 0;

  return (
    <div className="bg-[var(--secondary)] min-h-screen py-3">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Header Section --- */}
        <div className="flex flex-col p-4 lg:flex-row lg:items-start lg:justify-between gap-6">
  <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--accent)] mb-4">
              {item.name}
            </h1>
            <p className="text-gray-700 text-lg mb-2">
              {item.description}
            </p>
            <p className="text-gray-800 text-lg font-medium">
              {item.category} :
              <span className="text-[var(--accent)] text-2xl ml-1">
                ₹{item.finalPrice}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-6 mt-4 lg:mt-0">
            {/* ✅ Dynamic Overall Rating */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-0.5 bg-green-600 text-white px-2 py-0.5 rounded-md font-bold text-sm flex-shrink-0">
                {averageRating}
                <Star size={10} className="fill-white text-white" />
              </div>
            </div>


            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 hover:text-[var(--primary)] font-medium transition-all"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* --- Discount Section --- */}
        <div className="flex items-end mb-4">
          {item.discount > 0 && (
            <>
              <span className="text-2xl text-gray-400 line-through">
                ₹{item.price}
              </span>
              <span className="ml-4 text-lg font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                {item.discount}% OFF
              </span>
            </>
          )}
        </div>

        {/* --- Quantity + Add to Cart --- */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-full bg-white shadow-sm">
            <button
              onClick={() => handleQuantityChange("dec")}
              className="p-3 text-2xl font-bold text-gray-600 hover:bg-gray-100 rounded-l-full disabled:opacity-50"
              disabled={quantity <= 1 || isOutOfStock}
            >
              −
            </button>
            <span className="w-12 text-center text-xl font-bold text-[var(--accent)]">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange("inc")}
              className="p-3 text-2xl font-bold text-gray-600 hover:bg-gray-100 rounded-r-full disabled:opacity-50"
              disabled={quantity >= item.stock || isOutOfStock}
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 sm:flex-none min-w-[180px] flex items-center justify-center text-white text-lg font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${isOutOfStock
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[var(--primary)] "
              }`}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>


        {/* --- Image Section --- */}
        <div className="w-full rounded-2xl overflow-hidden shadow-lg mt-5 relative">
          {/* Blurred background (same image) */}
          <img
            src={item.image}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110"
          />

          {/* Main image */}
          <img
            src={item.image}
            alt={item.name}
            className="relative w-full h-[500px] object-contain transition-transform duration-700 z-10"
          />
        </div>


        {/* --- Overview Section --- */}
        <OverviewSection menuId={item.id} />

        {/* --- Related Items --- */}
        <RelatedCarousel items={relatedItems} />
      </div>

      {/* --- Toast --- */}
      <DialogBox
        isOpen={dialog.isOpen}
        type={dialog.type}
        customMessage={dialog.customMessage}
        customTitle={dialog.customTitle}
        onClose={() => setDialog((d) => ({ ...d, isOpen: false }))}
      />
    </div>
  );
};

export default MenuDetail;
