import React, { useEffect, useState } from "react";
import { X, Plus, Minus, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import DialogBox from "../components/DialogBox"; // ✅ same dialog as tiffin modal


const CustomizeFruitBowlModal = ({ userId, onClose }) => {
  const { addToCart } = useCart();
  const [bowls, setBowls] = useState([]);
  const [selectedBowlId, setSelectedBowlId] = useState("");
  const [bowlConfig, setBowlConfig] = useState(null);
  const [fruitDetails, setFruitDetails] = useState([]);
  const [selectedFruits, setSelectedFruits] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fruitsLoading, setFruitsLoading] = useState(false);

   // ✅ Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({
    type: "validationError", // "validationError" | "cartSuccess" | "info" etc.
    message: "",
    title: "",
  });

  // ✅ Helper to open dialog consistently
  const showDialog = (type, message, title = "") => {
    setDialogData({ type, message, title });
    setDialogOpen(true);
  };

  useEffect(() => {
    const fetchBowls = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/fruit-bowl");
        const data = await res.json();
        setBowls(Array.isArray(data) ? data : []);
      } catch (e) {
        setBowls([]);
         showDialog(
          "validationError",
          "Unable to load fruit plate options. Please try again.",
          "Load Failed"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBowls();
  }, []);

  const handleTypeChange = async (type) => {
    const found = bowls.find((b) => b.type === type);
    if (!found) {
      setBowlConfig(null);
      setSelectedBowlId("");
      setFruitDetails([]);
      setSelectedFruits([]);
       showDialog(
        "validationError",
        "Selected plate size is unavailable.",
        "Not Found"
      );
      return;
    }
    const id = found._id || found.id;
    setSelectedBowlId(id);
    setBowlConfig(found);
    await loadFruitDetails(found.fruitIds || []);
    setSelectedFruits([]);
  };

  const loadFruitDetails = async (ids) => {
    setFruitsLoading(true);
    try {
      const list = await Promise.all(
        (ids || []).map(async (id) => {
          const res = await fetch(`http://localhost:8080/api/menu/${id}`);
          if (!res.ok) return null;
          return res.json();
        })
      );
      setFruitDetails(list.filter(Boolean));
        } catch (e) {
      showDialog(
        "validationError",
        "Could not load fruits for this plate. Please try another size or retry.",
        "Load Failed"
      );
    } finally {
      setFruitsLoading(false);
    }
  };


  const toggleFruit = (id) => {
    setSelectedFruits((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((f) => f !== id);
       if (bowlConfig && prev.length >= (bowlConfig.fruitCount || 0)) {
        showDialog(
          "validationError",
          `You can select only ${bowlConfig.fruitCount} fruits.`,
          "Limit Reached"
        );
        return prev;
      }

      return [...prev, id];
    });
  };

  const handleAdd = async () => {
 if (!bowlConfig || !selectedBowlId) {
      return showDialog(
        "validationError",
        "Please select a plate size first.",
        "Missing Selection"
      );
    }
 if (selectedFruits.length === 0) {
      return showDialog(
        "validationError",
        "Please select at least one fruit.",
        "Selection Required"
      );
    }

  if (
      bowlConfig?.fruitCount &&
      selectedFruits.length > bowlConfig.fruitCount
    ) {
      return showDialog(
        "validationError",
        `You can select only ${bowlConfig.fruitCount} fruits.`,
        "Limit Reached"
      );
    }

    const payload = {
      userId,
      customizeBowlId: selectedBowlId,
      fruitIds: selectedFruits,
      quantity,
    };
    try {
      const res = await fetch("http://localhost:8080/api/fruit-bowl-order/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const price = Math.round(Number(bowlConfig?.price || 0));
        addToCart({
          id: `fruitbowl:${selectedBowlId}:${Date.now()}`,
          name: `Fruit Plate (${bowlConfig?.type || "Custom"})`,
          price,
          quantity,
          imageUrl: "",
        });
         // ✅ Show success dialog then close
        showDialog(
          "cartSuccess",
          "Fruit plate added to cart successfully!",
          "Added to Cart"
        );

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showDialog(
          "validationError",
          "Failed to place order. Please try again.",
          "Something Went Wrong"
        );
      }
    } catch (e) { showDialog(
        "validationError",
        "Network error while placing order. Please check your connection and try again.",
        "Network Error"
      );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--secondary)]/60 backdrop-blur">
        <div className="p-6 bg-[var(--secondary)] rounded-xl shadow-lg flex items-center gap-2 text-[var(--accent)]">
          <Loader2 className="animate-spin text-[var(--primary)]" /> Loading fruit bowls...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed mt-14 inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-[var(--dark)]/40 p-4">
      <div className="relative bg-[var(--secondary)] rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 overflow-y-auto max-h-[85vh] text-[var(--accent)]">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-[var(--gray)] hover:text-[var(--primary)] transition"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-3 text-[var(--accent)]">Customize Fruit Plate</h2>

        {/* Bowl Type Selection */}
        <div className="mb-3">
          <label className="block font-semibold mb-2 text-[var(--accent)]">Select Plate Size</label>
          <select
            className="w-full border border-[var(--gray)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            onChange={(e) => handleTypeChange(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Choose Size
            </option>
            {bowls
              .filter((b) => b.isActive !== false)
              .map((b) => (
                <option key={b._id || b.id} value={b.type}>
                  {b.type} (₹{Math.round(Number(b.price || 0))})
                </option>
              ))}
          </select>
        </div>

        {/* Fruit Selection */}
        {bowlConfig && (
          <div className="mb-3">
            <h3 className="font-semibold text-lg mb-3 text-[var(--accent)]">
              Select Fruits (up to {bowlConfig.fruitCount})
            </h3>
            {fruitsLoading ? (
              <div className="text-[var(--gray)] flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4 text-[var(--primary)]" /> Loading Fruits...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fruitDetails.map((f) => {
                  const id = f._id?.$oid || f._id || f.id || f.menuItemId;
                  const active = selectedFruits.includes(id);
                  return (
                    <div
                      key={id}
                      className={`relative border rounded-xl p-2 cursor-pointer transition-all ${active
                        ? "ring-2 ring-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-gray-200 hover:bg-[var(--primary)]/5"
                        }`}
                      onClick={() => toggleFruit(id)}
                    >
                      <img
                        src={f.imageUrl}
                        alt={f.menuName}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                      <p className="text-center font-medium text-sm text-[var(--accent)] truncate">
                        {f.menuName}
                      </p>
                      {active && (
                        <div className="absolute top-2 right-2 bg-[var(--primary)] text-[var(--secondary)] text-xs px-2 py-0.5 rounded-full">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quantity Controls */}
        {bowlConfig && (
          <div className="flex items-center justify-end-safe gap-4 mb-3">
            <h3 className="  font-semibold text-[var(--accent)]">FruitPlate Quantity:</h3>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 border border-[var(--gray)] rounded-full hover:bg-[var(--primary)]/10 transition"
            >
              <Minus className="w-3 h-3 text-[var(--accent)]" />
            </button>
            <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 border border-[var(--gray)] rounded-full hover:bg-[var(--primary)]/10 transition"
            >
              <Plus className="w-3 h-3 text-[var(--accent)]" />
            </button>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 border-t border-[var(--gray)]/30 pt-3 -mb-4">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-[var(--gray)] rounded-lg hover:bg-[var(--primary)]/10 transition text-[var(--accent)]"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!bowlConfig}
            className={`px-5 py-2 rounded-lg font-semibold transition ${bowlConfig
              ? "bg-[var(--primary)] text-[var(--secondary)] hover:opacity-90"
              : "bg-[var(--gray)]/40 text-[var(--gray)] cursor-not-allowed"
              }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
 {/* ✅ Dialog Box (same API as your tiffin modal) */}
      <DialogBox
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        type={dialogData.type}
        customMessage={dialogData.message}
        customTitle={dialogData.title}
      />

    </div>
  );
};

export default CustomizeFruitBowlModal;
