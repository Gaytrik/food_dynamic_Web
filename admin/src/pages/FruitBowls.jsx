import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DialogBox from "../components/DialogBox"; // ✅ Import DialogBox

const API = "http://localhost:8080";

export default function FruitBowls() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bowls, setBowls] = useState([]);
  const [fruits, setFruits] = useState([]);
  const [activeTab, setActiveTab] = useState("MINI");
  const [form, setForm] = useState({
    id: "",
    type: "MINI",
    price: "",
    fruitCount: 0,
    isActive: true,
    fruitIds: [],
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const types = ["MINI", "SMALL", "MEDIUM", "LARGE"];

  const selectedBowl = useMemo(
    () => bowls.find((b) => (b.type || "").toUpperCase() === activeTab),
    [bowls, activeTab]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [bRes, mRes] = await Promise.all([
          fetch(`${API}/api/fruit-bowl`),
          fetch(`${API}/api/menu/all`),
        ]);
        const bData = await bRes.json();
        const mData = await mRes.json();
        setBowls(Array.isArray(bData) ? bData : []);
        const allMenu = Array.isArray(mData) ? mData : [];
        const fruitsOnly = allMenu.filter((m) => {
          const cat = String(m.menuCategory || "").toLowerCase();
          const sub = String(m.menuSubCategory || "").toLowerCase();
          return cat.includes("fruit") || sub.includes("fruit");
        });
        setFruits(fruitsOnly.length ? fruitsOnly : allMenu);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedBowl) {
      setForm({
        id: "",
        type: activeTab,
        price: "",
        fruitCount: 0,
        isActive: true,
        fruitIds: [],
      });
      return;
    }
    const id =
      selectedBowl._id?.$oid || selectedBowl._id || selectedBowl.id;

    setForm({
      id,
      type: selectedBowl.type || activeTab,
      price: selectedBowl.price || "",
      fruitCount: selectedBowl.fruitCount || 0,
      isActive: selectedBowl.isActive !== false,
      fruitIds: selectedBowl.fruitIds || [],
    });
  }, [selectedBowl, activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleFruit = (id) => {
    setForm((p) => {
      const has = p.fruitIds.includes(id);
      return {
        ...p,
        fruitIds: has
          ? p.fruitIds.filter((x) => x !== id)
          : [...p.fruitIds, id],
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.price || Number(form.price) <= 0)
      newErrors.price = "Price must be greater than 0";
    if (!form.fruitCount || Number(form.fruitCount) <= 0)
      newErrors.fruitCount = "Fruit count must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const save = async () => {
    if (!form.id) {
      alert(`No config found for ${activeTab}. Create it in backend first.`);
      return;
    }

    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        type: form.type,
        price: Number(form.price),
        fruitCount: Number(form.fruitCount || 0),
        isActive: Boolean(form.isActive),
        fruitIds: form.fruitIds,
      };

      const res = await fetch(`${API}/api/fruit-bowl/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      const list = await fetch(`${API}/api/fruit-bowl`).then((r) => r.json());
      setBowls(Array.isArray(list) ? list : []);
      setShowSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!form.id) return;
    if (!confirm("Delete this fruit plate configuration?")) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/fruit-bowl/${form.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Delete failed");
      const list = await fetch(`${API}/api/fruit-bowl`).then((r) => r.json());
      setBowls(Array.isArray(list) ? list : []);
      setActiveTab("MINI");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:mt-0 mt-12">
      <div>
        <h1 className="text-3xl font-bold text-[var(--accent)] mb-6">
          Fruit Plate Customization
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {["MINI", "SMALL", "MEDIUM", "LARGE"].map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeTab === type
                ? "bg-[var(--primary)] text-white border border-[var(--primary)]"
                : "bg-[var(--secondary)] text-[var(--accent)] hover:text-[var(--primary)] border border-gray-200 hover:border-[var(--primary)]"
            }`}
          >
            {type} PLATE
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 animate-pulse">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Card */}
          <div className="bg-[var(--secondary)] rounded-xl shadow-md p-5 border border-gray-100 order-2 lg:order-1">
            <h2 className="text-xl font-semibold mb-4 text-[var(--accent)]">
              {activeTab} Plate Settings
            </h2>
            {!form.id && (
              <p className="text-sm text-red-600 mb-3">
                ⚠ No configuration found for this plate. Please create it on
                backend.
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Price (₹)
                </label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${
                    errors.price
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-[var(--primary)]"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Fruit Count
                </label>
                <input
                  name="fruitCount"
                  type="number"
                  value={form.fruitCount}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${
                    errors.fruitCount
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-[var(--primary)]"
                  }`}
                />
                {errors.fruitCount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fruitCount}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="active"
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="accent-[var(--primary)] w-4 h-4"
                />
                <label htmlFor="active" className="text-gray-700">
                  Available
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  disabled={saving || !form.id}
                  onClick={save}
                  className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>

          {/* Fruits Grid */}
          <div className="lg:col-span-2 bg-[var(--secondary)] rounded-xl shadow-md p-5 border border-gray-100 order-1 lg:order-2">
            <h2 className="text-xl font-semibold mb-4 text-[var(--accent)]">
              Allowed Fruits (max {form.fruitCount || 0})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {fruits.map((f) => {
                const id = f._id?.$oid || f._id || f.id || f.menuItemId;
                const checked = form.fruitIds.includes(id);
                return (
                  <div
                    key={id}
                    onClick={() => toggleFruit(id)}
                    className={`relative border rounded-xl p-2 cursor-pointer hover:shadow-md transition-all ${
                      checked
                        ? "ring-2 ring-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={f.imageUrl}
                      alt={f.menuName}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <p className="text-center text-sm text-gray-800 truncate">
                      {f.menuName}
                    </p>
                    {checked && (
                      <div className="absolute top-2 right-2 bg-[var(--primary)] text-white text-xs px-2 py-0.5 rounded-full">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add More Fruits Button */}
              <div
                onClick={() => navigate("/additems")}
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all aspect-square"
              >
                <span className="text-4xl text-[var(--primary)] mb-1">+</span>
                <p className="text-sm text-[var(--accent)]">Add Fruits</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Success DialogBox (Replaces old modal) */}
      <DialogBox
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        type="success"
        title="Saved Successfully!"
        message="Fruit plate configuration has been updated."
        autoClose={true}
        duration={1500}
      />
    </div>
  );
}
