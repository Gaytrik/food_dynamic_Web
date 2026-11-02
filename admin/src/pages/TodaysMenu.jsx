import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, X } from 'lucide-react';
import DialogBox from "../components/DialogBox";


const TodaysMenu = () => {
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  // ✅ DialogBox state
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "info", // success | error | confirm | info
    onConfirm: null,
  });

  // --- Functional Logic (Unchanged) ---

  useEffect(() => {
    fetchMenuItems();
    fetchCurrentTodaysMenu();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/menu/all');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setAllMenuItems(data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      setDialog({
        open: true,
        title: "Error",
        message: "Failed to load menu items. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentTodaysMenu = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/menu/todays-menu');
      if (!response.ok) throw new Error("Failed to fetch today's menu");
      const data = await response.json();
      setSelectedItems(data);
    } catch (error) {
      console.error("Failed to fetch current today's menu:", error);
      setDialog({
        open: true,
        title: "Error",
        message: "Unable to load today's menu. Please try again.",
        type: "error",
      });
    }
  };

  const handleItemSelect = (item) => {
    if (selectedItems.find(selected => selected.id === item.id)) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else if (selectedItems.length < 5) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setDialog({
        open: true,
        title: "Limit Reached",
        message: "You can only select up to 5 items for today's menu.",
        type: "error",
      });
    }
  };

  const saveTodaysMenu = async () => {
    if (selectedItems.length < 1 || selectedItems.length > 5) return;
    const ids = selectedItems.map((i) => i.id);
    const signature = JSON.stringify(ids);
    if (lastSavedRef.current === signature) return;

    try {
      const response = await fetch('http://localhost:8080/api/menu/todays-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemIds: ids })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update today's menu");
      }
      lastSavedRef.current = signature;
      fetchCurrentTodaysMenu();
      setDialog({
        open: true,
        title: "Saved Successfully",
        message: "Today's menu updated successfully.",
        type: "success",
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      setDialog({
        open: true,
        title: "Error",
        message: "Failed to save today's menu. Please try again.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (selectedItems.length >= 1 && selectedItems.length <= 5) {
      setSaving(true);
      saveTimeoutRef.current = setTimeout(async () => {
        await saveTodaysMenu();
        setSaving(false);
      }, 600);
    } else {
      setSaving(false);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [selectedItems]);

  const filteredItems = allMenuItems.filter(item =>
    item.menuName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.menuCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="p-4 sm:p-6 md:mt-0 mt-12 bg-[var(--secondary)] min-h-screen">

      {/* Header + Search */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)] leading-tight">
            Today's Menu Manager
          </h1>
          <p className="text-[var(--gray)] text-sm sm:text-base">
            Select up to 5 items to feature in today's special menu
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray)] w-5 h-5" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--primary)]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--accent)]"
          />
        </div>
      </div>

      {/* Selected Items */}
      <div className="mb-4 bg-[var(--secondary)] rounded-lg shadow border border-[var(--primary)]/30 p-4">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--accent)] mb-3 flex items-center gap-3">
          Selected Items ({selectedItems.length}/5)
          {selectedItems.length >= 1 && selectedItems.length <= 5 && (
            <span className={`text-sm ${saving ? 'text-[var(--gray)]' : 'text-[var(--primary)]'}`}>
              {saving ? 'Saving…' : 'Saved'}
            </span>
          )}
        </h2>

        {selectedItems.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--primary)]/40 rounded-lg p-6 text-center">
            <p className="text-[var(--gray)] text-sm sm:text-base">No items selected</p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(130px,1fr))]">
            {selectedItems.map((item, index) => (
              // FIX 1: Set card as flex container, justify-between to push content to bottom
              <div key={item.id} className="relative bg-[var(--secondary)] rounded-lg p-2 border-2 border-[var(--primary)]/60 shadow-sm flex flex-col justify-between">

                {/* Index badge */}
                <div className="absolute -top-2 -left-2 bg-[var(--primary)] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10">
                  {index + 1}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleItemSelect(item)}
                  className="absolute -top-2 -right-2 bg-[var(--dark)] text-white rounded-full w-5 h-5 flex items-center justify-center hover:opacity-80 z-10"
                >
                  <X size={12} />
                </button>

                <div className="aspect-[4/3] w-full overflow-hidden rounded-md mb-1">
                  <img
                    src={item.imageUrl || '/hero/feature.png'}
                    alt={item.menuName}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = '/hero/feature.png')}
                  />
                </div>

                {/* FIX 2: Wrapper for title and price, using flex to stack elements */}
                <div className="flex flex-col flex-grow justify-end pt-1"> 
                  <h4 className="font-medium text-xs sm:text-sm text-[var(--accent)]" title={item.menuName}>{item.menuName}</h4>
                  <p className="text-[var(--dark)] text-xs sm:text-sm">₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Items */}
      <div className="bg-[var(--secondary)] rounded-lg shadow border border-[var(--primary)]/30 p-4">
        <h3 className="text-lg font-semibold text-[var(--accent)] mb-4">
          Available Menu Items ({filteredItems.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
            <p className="text-[var(--gray)] mt-2">Loading...</p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] max-h-[70vh] overflow-y-auto">
            {filteredItems.map((item) => {
              const isSelected = selectedItems.find((s) => s.id === item.id);
              const canSelect = selectedItems.length < 5 || isSelected;

              return (
                // FIX 1: Set card as flex container, justify-between to push content to bottom
                <div
                  key={item.id}
                  onClick={() => canSelect && handleItemSelect(item)}
                  className={`relative border rounded-lg p-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : canSelect
                      ? 'border-gray-200 hover:border-[var(--primary)]/60 hover:bg-[var(--primary)]/10'
                      : 'border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-[var(--primary)] text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg z-10">
                      <Check size={12} />
                    </div>
                  )}

                  <div className="aspect-[4/3] w-full overflow-hidden rounded-md">
                    <img
                      src={item.imageUrl || '/hero/feature.png'}
                      alt={item.menuName}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = '/hero/feature.png')}
                    />
                  </div>

                  {/* FIX 2: Wrapper for title and details, using flex-grow to ensure it takes up necessary space and pushing details to bottom */}
                  <div className="mt-1 flex flex-col flex-grow justify-end">
                    {/* FIX 3: Removed line-clamp-2 to allow full title to show, card height will adapt */}
                    <h4 className="font-medium text-xs sm:text-sm text-[var(--accent)] mb-1" title={item.menuName}>
                      {item.menuName}
                    </h4>

                    <div className="text-xs flex justify-between text-[var(--dark)]">
                      <span>₹{item.price}</span>
                      <span className="capitalize text-[var(--gray)]">{item.menuCategory}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {dialog.open && (
        <DialogBox
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          onClose={() => setDialog({ ...dialog, open: false })}
          onConfirm={dialog.onConfirm}
        />
      )}
    </div>
  );

};

export default TodaysMenu;