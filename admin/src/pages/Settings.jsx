import React, { useState, useEffect } from "react";
import { Save, DollarSign, Percent, Truck, Loader2 } from "lucide-react";
import DialogBox from "../components/DialogBox"; // adjust the path based on your folder


const Settings = () => {
  const [settings, setSettings] = useState({
    gstPercentage: 5.0,
    deliveryChargeAmount: 50.0,
    freeDeliveryThreshold: 150.0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
const [dialogType, setDialogType] = useState(""); // success | error | info
const [dialogMessage, setDialogMessage] = useState("");



  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings({
          gstPercentage: data.gstPercentage || 5.0,
          deliveryChargeAmount: data.deliveryChargeAmount || 50.0,
          freeDeliveryThreshold: data.freeDeliveryThreshold || 150.0,
        });
      } else {
        showMessage(`Error loading settings: ${response.statusText}`, "error");
      }
    } catch (error) {
      showMessage(`Error loading settings: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setSettings((prev) => ({
        ...prev,
        [field]: numValue,
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Ensure all fields are valid numbers before saving
    const finalSettings = {
        gstPercentage: parseFloat(settings.gstPercentage) || 0,
        deliveryChargeAmount: parseFloat(settings.deliveryChargeAmount) || 0,
        freeDeliveryThreshold: parseFloat(settings.freeDeliveryThreshold) || 0,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalSettings),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showMessage("Settings updated successfully! ✅", "success");
        if (result.data) {
          setSettings({
            gstPercentage: result.data.gstPercentage,
            deliveryChargeAmount: result.data.deliveryChargeAmount,
            freeDeliveryThreshold: result.data.freeDeliveryThreshold,
          });
        }
      } else {
        showMessage(result.message || "Error updating settings ❌", "error");
      }
    } catch (error) {
      showMessage(`Error saving settings: ${error.message} ❌`, "error");
    } finally {
      setSaving(false);
    }
  };

 const showMessage = (text, type) => {
  setDialogMessage(text);
  setDialogType(type);
  setDialogOpen(true);
};


  const calculateSamplePricing = (subtotal) => {
    const gstAmount = subtotal * (settings.gstPercentage / 100);
    const deliveryCharge =
      subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryChargeAmount;
    const total = subtotal + gstAmount + deliveryCharge;
    return { gstAmount, deliveryCharge, total };
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-full bg-[var(--secondary)]">
        <Loader2 className="w-7 h-7 animate-spin text-[var(--primary)]" />
        <span className="ml-3 text-lg text-[var(--accent)]">Loading Settings...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 md:mt-0 mt-12 bg-[var(--secondary)] min-h-full text-[var(--accent)]">
      
      {/* Main Header */}
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2 text-[var(--accent)] border-b border-gray-200 pb-4">
        <DollarSign className="w-7 h-7 text-[var(--primary)]" /> Pricing & Fee Configuration
      </h1>

      {/* Feedback
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg border font-medium transition-all ${
            messageType === "success"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {message}
        </div>
      )} */}

      {/* Main Grid Container (gap-6 added) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GST Card (p-5 added) */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 transition-shadow duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-3 text-[var(--accent)]">
            <Percent className="w-6 h-6 text-[var(--primary)]" /> GST Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--dark)]">GST Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={settings.gstPercentage}
                onChange={(e) => handleInputChange("gstPercentage", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition duration-150 hover:border-[var(--primary)]/50"
                placeholder="5.0"
              />
              <p className="text-xs text-gray-500 mt-1">This percentage will be added to all order subtotals.</p>
            </div>
          </div>
        </div>

        {/* Delivery Card (p-5 added) */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 transition-shadow duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-3 text-[var(--accent)]">
            <Truck className="w-6 h-6 text-[var(--primary)]" /> Delivery Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--dark)]">
                Delivery Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.deliveryChargeAmount}
                onChange={(e) => handleInputChange("deliveryChargeAmount", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition duration-150 hover:border-[var(--primary)]/50"
                placeholder="50"
              />
              <p className="text-xs text-gray-500 mt-1">The charge applied if the subtotal is below the threshold.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--dark)]">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => handleInputChange("freeDeliveryThreshold", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition duration-150 hover:border-[var(--primary)]/50"
                placeholder="150"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum order subtotal to qualify for free delivery.</p>
            </div>
          </div>
        </div>

        {/* Preview Card (p-5 added) */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-[var(--accent)] border-b pb-3 border-gray-100">Pricing Preview</h2>
          <div className="space-y-5">
            
            {/* Sample Order 1 (Below Threshold) */}
            <div className="bg-[var(--secondary)] rounded-lg p-3 border border-gray-200">
              <h3 className="font-bold text-base text-[var(--dark)] mb-3">Subtotal: ₹100.00</h3>
              {(() => {
                const sample = calculateSamplePricing(100);
                return (
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST ({settings.gstPercentage}%)</span>
                      <span>₹{sample.gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Charge</span>
                      <span className="font-medium text-red-600">₹{sample.deliveryCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2 text-base text-[var(--accent)]">
                      <span>Total</span>
                      <span>₹{sample.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Sample Order 2 (Above Threshold) */}
            <div className="bg-[var(--secondary)] rounded-lg p-3 border border-gray-200">
              <h3 className="font-bold text-base text-[var(--dark)] mb-3">Subtotal: ₹200.00</h3>
              {(() => {
                const sample = calculateSamplePricing(200);
                return (
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST ({settings.gstPercentage}%)</span>
                      <span>₹{sample.gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Charge</span>
                      <span className="font-medium text-green-600">
                        ₹{sample.deliveryCharge.toFixed(2)} (Free)
                      </span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2 text-base text-[var(--accent)]">
                      <span>Total</span>
                      <span>₹{sample.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button (mt-6 added) */}
      <div className="flex justify-end mt-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-md hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-all duration-300 flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
      {/* ✅ Reusable DialogBox */}
<DialogBox
  isOpen={dialogOpen}
  type={dialogType} // "success" | "error" | "info"
  message={dialogMessage}
  onClose={() => setDialogOpen(false)}
/>

    </div>
  );
};

export default Settings;