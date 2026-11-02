import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import DialogBox from "../components/DialogBox"; // adjust path if needed


const CustomizeBoxModal = ({ userId, onClose }) => {
  const { addToCart } = useCart();
  const [boxes, setBoxes] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [boxConfig, setBoxConfig] = useState(null);
  const [sabjiDetails, setSabjiDetails] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sabjiLoading, setSabjiLoading] = useState(false);
  // ✅ Dialog States (ADD THIS NEAR THE TOP)
const [dialogOpen, setDialogOpen] = useState(false);
const [dialogData, setDialogData] = useState({
  type: "validationError",
  message: "",
  title: "",
});

  

  const [selected, setSelected] = useState({
    sabjiIds: [],
    rotiType: "",
    includeRice: false,
  });

  // ✅ Fetch all boxes on mount
  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/box");
        const data = await res.json();
        setBoxes(data);
      } catch (err) {
        console.error("Error fetching boxes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxes();
  }, []);

  // ✅ When user selects a box type
  const handleBoxTypeChange = async (type) => {
    const foundBox = boxes.find((box) => box.boxType === type);
    if (foundBox) {
      setSelectedBoxId(foundBox._id || foundBox.id);
      setBoxConfig(foundBox);
      setSelected({
        sabjiIds: [],
        rotiType: "",
        includeRice: foundBox.isRice,
      });
      fetchSabjiDetails(foundBox.sabjiId);
    } else {
      setBoxConfig(null);
      setSabjiDetails([]);
    }
  };

  // ✅ Fetch sabji details for display
  const fetchSabjiDetails = async (sabjiIds) => {
    setSabjiLoading(true);
    try {
      const results = await Promise.all(
        sabjiIds.map(async (id) => {
          const res = await fetch(`http://localhost:8080/api/menu/${id}`);
          if (!res.ok) throw new Error("Sabji not found");
          return res.json();
        })
      );
      setSabjiDetails(results);
    } catch (err) {
      console.error("Error loading sabji details:", err);
    } finally {
      setSabjiLoading(false);
    }
  };

  // 🥗 Handle sabji selection
  const handleSabjiToggle = (sabjiId) => {
    setSelected((prev) => {
      const exists = prev.sabjiIds.includes(sabjiId);
      if (exists) {
        return { ...prev, sabjiIds: prev.sabjiIds.filter((id) => id !== sabjiId) };
      } else if (prev.sabjiIds.length < boxConfig.sabjiCount) {
        return { ...prev, sabjiIds: [...prev.sabjiIds, sabjiId] };
      } else {
showDialog("validationError", `You can select only ${boxConfig.sabjiCount} sabjis.`, "Limit Reached");
        return prev;
      }
    });
  };

  // 🍞 Handle roti type
  const handleRotiType = (type) => {
    setSelected((prev) => ({ ...prev, rotiType: type }));
  };

  // 🍚 Include rice toggle
  const handleRiceToggle = () => {
    if (boxConfig?.isRice) {
      setSelected((prev) => ({ ...prev, includeRice: !prev.includeRice }));
    }
  };

  // 🛒 Place order
  const handlePlaceOrder = async () => {
    if (!boxConfig)
  return showDialog("validationError", "Please select a box type first.", "Missing Selection");

if (!selected.rotiType || selected.sabjiIds.length === 0)
  return showDialog("validationError", "Please select required Sabji and Roti type.", "Selection Required");


    const orderPayload = {
      userId,
      customizeBoxId: selectedBoxId,
      sabjiIds: selected.sabjiIds,
      rotiTypes: [selected.rotiType],
      quantity,
    };

    try {
      const res = await fetch("http://localhost:8080/api/box-order/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        addToCart({
          id: `tiffinbox:${selectedBoxId}:${Date.now()}`,
          name: `${boxConfig?.boxType || "Box"} Box`,
          price: Number(boxConfig?.price || 0),
          quantity,
          imageUrl: "",
        });
showDialog("cartSuccess", "Box added to cart successfully!", "Added to Cart");

setTimeout(() => {
  onClose();
}, 1500); // same timing as dialog auto-close

      } else {
showDialog("validationError", "Failed to place order.", "Something Went Wrong");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Error while placing order.");
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--secondary)]/60 backdrop-blur">
        <div className="p-6 bg-[var(--secondary)] rounded-xl shadow-lg flex items-center gap-2">
          <Loader2 className="animate-spin text-[var(--primary)]" />
          <span className="text-[var(--accent)] font-medium">Loading boxes...</span>
        </div>
      </div>
    );


    const showDialog = (type, message, title = "") => {
  setDialogData({ type, message, title });
  setDialogOpen(true);
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-[var(--accent)]/30 p-2">
      <div className="relative mt-14 bg-[var(--secondary)] rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-6 overflow-y-auto max-h-[85vh] transition-all duration-300">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-[var(--gray)] hover:text-[var(--primary)] transition"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-3 text-[var(--accent)]">
          Customize Your Box
        </h2>

        {/* Box Type Dropdown */}
        <div className="mb-3">
          <label className="block font-semibold mb-2 text-[var(--accent)]">
            Select Box Type
          </label>
          <select
            className="w-full border border-[var(--gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--primary)]"
            onChange={(e) => handleBoxTypeChange(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Choose Box Type
            </option>
            <option value="MINI">MINI</option>
            <option value="HALF">HALF</option>
            <option value="FULL">FULL</option>
          </select>
        </div>

        {/* Sabji Selection */}
        {/* Static Info Box Based on Selection */}
        {boxConfig && (
          <div className="mb-4 p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)] text-[var(--accent)]">
            {boxConfig.boxType === "MINI" && (
              <>
                <h3 className="text-xl font-bold mb-2 text-center">Mini Tiffin</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>1 Sabji</li>
                  <li>3 Chapati</li>
                  <li>No Rice Included</li>
                </ul>
              </>
            )}

            {boxConfig.boxType === "HALF" && (
              <>
                <h3 className="text-xl font-bold mb-2 text-center">Half Tiffin</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>2 Sabji</li>
                  <li>4 Chapati</li>
                  <li>Rice Included</li>
                </ul>
              </>
            )}

            {boxConfig.boxType === "FULL" && (
              <>
                <h3 className="text-xl font-bold mb-2 text-center">Full Tiffin</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>3 Sabji</li>
                  <li>5 Chapati</li>
                  <li>Rice Included</li>
                  <li>Sweet Included</li>
                </ul>
              </>
            )}
          </div>
        )}

        <div className="mb-3">
          {boxConfig && (
            <h3 className="font-semibold text-lg mb-3 text-[var(--accent)]">
              Select Sabjis (up to {boxConfig.sabjiCount})
            </h3>
          )}


          {sabjiLoading ? (
            <div className="text-[var(--gray)] flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4 text-[var(--primary)]" />
              Loading Sabjis...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sabjiDetails.map((sabji) => {
                const id =
                  sabji._id?.$oid || sabji._id || sabji.id || sabji.menuItemId;
                const active = selected.sabjiIds.includes(id);
                return (
                  <div
                    key={id}
                    className={`relative border rounded-xl p-2 cursor-pointer hover:shadow-md transition-all ${active
                        ? "ring-2 ring-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--gray)]"
                      }`}
                    onClick={() => handleSabjiToggle(id)}
                  >
                    <img
                      src={sabji.imageUrl}
                      alt={sabji.menuName}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <p className="text-center font-medium text-sm text-[var(--accent)] truncate">
                      {sabji.menuName}
                    </p>
                    {active && (
                      <div className="absolute top-2 right-2 bg-[var(--primary)] text-white text-xs px-2 py-0.5 rounded-full">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* Roti Type */}
        {boxConfig && (
          <div className="mb-3">
            <h3 className="font-semibold text-lg mb-2 text-[var(--accent)]">
              Select Roti Type
            </h3>
            <div className="flex flex-wrap gap-3">
              {boxConfig.rotiType.map((roti) => {
                const active = selected.rotiType === roti;
                return (
                  <button
                    key={roti}
                    onClick={() => handleRotiType(roti)}
                    className={`px-4 py-2 rounded-lg border transition-all ${active
                        ? "bg-[var(--primary)]/15 border-[var(--primary)] text-[var(--accent)] font-semibold"
                        : "border-[var(--gray)] hover:border-[var(--primary)]"
                      }`}
                  >
                    {roti}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rice Option */}
        {boxConfig?.isRice && (
          <div className="mb-3">
            <h3 className="font-semibold text-lg mb-2 text-[var(--accent)]">Include Rice?</h3>
            <button
              onClick={handleRiceToggle}
              className={`px-6 py-2 rounded-lg border ${selected.includeRice
                  ? "bg-[var(--primary)]/15 border-[var(--primary)] text-[var(--accent)]"
                  : "border-[var(--gray)] hover:border-[var(--primary)]"
                }`}
            >
              {selected.includeRice ? "✓ Yes, include rice" : "Add Rice"}
            </button>
          </div>
        )}

        {/* Quantity */}
        {boxConfig && (
          <div className="flex items-center justify-end-safe gap-4 mb-3">
            <h3 className="font-semibold  text-[var(--accent)]">Tiffin Quantity:</h3>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 border border-[var(--gray)] rounded-full hover:bg-[var(--primary)]/10"
            >
              <Minus className="w-4 h-4 text-[var(--accent)]" />
            </button>
            <span className="text-lg font-semibold w-8 text-center text-[var(--accent)]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 border border-[var(--gray)] rounded-full hover:bg-[var(--primary)]/10"
            >
              <Plus className="w-4 h-4 text-[var(--accent)]" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-6 border-t border-[var(--gray)] pt-2 -mb-4">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-[var(--gray)] rounded-lg hover:bg-[var(--primary)]/10 transition text-[var(--accent)]"
          >
            Cancel
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={!boxConfig}
            className={`px-5 py-2 rounded-lg font-semibold transition ${boxConfig
                ? "bg-[var(--primary)] text-white hover:opacity-90"
                : "bg-[var(--gray)] text-[var(--accent)] cursor-not-allowed"
              }`}
          >
            Add to Cart
          </button>
        </div>
      </div>

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

export default CustomizeBoxModal;
