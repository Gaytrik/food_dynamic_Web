import React, { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import CustomizeBoxModal from "./CustomizeBoxModal";
import CustomizeFruitBowlModal from "./CustomizeFruitBowlModal"; // ✅ New import added

const FilterBar = ({ onFilterChange }) => {
  // Tracks which main category is selected on the left panel
  const [openCategory, setOpenCategory] = useState("Breakfast");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [showCustomizeTiffinModal, setShowCustomizeTiffinModal] = useState(false);
  const [showCustomizeFruitPlateModal, setShowCustomizeFruitPlateModal] = useState(false); // ✅

  // --- All Categories ---
  const categories = {
    Breakfast: ["All", "South-Indian", "Maharashtrian"],
    Lunch: ["All", "Gravy", "Dry", "Rice", "Dal"],
    Dinner: ["All", "Gravy", "Dry", "Rice", "Dal"],
    Roti: ["All"],
    Snacks: ["All"],
    Sweet: ["All"],
    Fruit: ["All"],
  };

  // Left panel main categories
  const mainFilterCategories = ["All", ...Object.keys(categories)];

  // Handle left category click
  const handleMainCategoryClick = (category) => {
    setOpenCategory(category);
    if (category === "All") {
      setSelectedCategory("All");
      setSelectedSubcategory("All");
      onFilterChange("All", "All");
    }
  };

  // Handle right subcategory click
  const handleSubcategoryClick = (subcategory) => {
    const currentCategory = openCategory !== "All" ? openCategory : selectedCategory;
    setSelectedCategory(currentCategory);
    setSelectedSubcategory(subcategory);
    onFilterChange(currentCategory, subcategory);
  };

  // Handle Customize modals
  const handleCustomizeFruitPlate = () => {
    setShowCustomizeFruitPlateModal(true);
    setIsFilterPopupOpen(false);
  };

  const handleCustomizeTiffin = () => {
    setShowCustomizeTiffinModal(true);
    setIsFilterPopupOpen(false);
  };

  // Render right panel content based on left category
  const renderRightPanel = (selectedKey) => {
    if (selectedKey === "All") {
      return (
        <div className="p-6 text-[var(--accent)] space-y-2">
          <h4 className="text-sm font-semibold uppercase">All Food Categories</h4>
          <p className="text-[var(--gray)] leading-relaxed">
            Discover a variety of freshly prepared meals crafted with care using premium ingredients.
            Whether it’s breakfast to kickstart your day, a wholesome lunch, or a light dinner, 
            our menu is designed to suit every mood and appetite.
          </p>
          <p className="text-[var(--gray)] leading-relaxed">
            All items are prepared in hygienic kitchens and delivered swiftly to ensure 
            you enjoy your food warm and fresh. You can customize your tiffin or fruit plate 
            as per your preferences for a truly personalized experience.
          </p>
        </div>
      );
    }

    const subcategories = categories[selectedKey];
    if (subcategories) {
      return (
        <div className="space-y-2 p-1">
          <h4 className="text-xs font-semibold uppercase text-[var(--gray)] mb-2">
            {selectedKey.toUpperCase()} OPTIONS
          </h4>
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => handleSubcategoryClick(sub)}
              className={`block w-full text-left text-base py-2 px-3 rounded-md transition-all duration-300 ${
                selectedSubcategory === sub && selectedCategory === selectedKey
                  ? "bg-[var(--primary)] text-[var(--secondary)] font-bold"
                  : "hover:bg-gray-100 text-[var(--accent)]"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      );
    }

    return <div className="p-4 text-[var(--gray)]">No subcategories found for this selection.</div>;
  };

  return (
    <>
      {/*  Horizontal Filter Bar */}
      <div className="flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {/* Filter Button */}
          <button
            onClick={() => setIsFilterPopupOpen(true)}
            className="flex items-center gap-1 bg-[var(--secondary)] border border-[var(--gray)] px-4 py-2 rounded-lg text-sm font-medium text-[var(--accent)] hover:bg-gray-50 transition-all whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>

          {/* Customize Fruit Plate */}
          <button
            onClick={handleCustomizeFruitPlate}
            className="bg-[var(--secondary)] border border-[var(--gray)] px-4 py-2 rounded-lg text-sm font-medium text-[var(--accent)] shadow-sm hover:bg-gray-50 transition-all whitespace-nowrap"
          >
            Customize Fruit Plate
          </button>

          {/* Customize Tiffin Box */}
          <button
            onClick={handleCustomizeTiffin}
            className="bg-[var(--secondary)] border border-[var(--gray)] px-4 py-2 rounded-lg text-sm font-medium text-[var(--accent)] shadow-sm hover:bg-gray-50 transition-all whitespace-nowrap"
          >
            Customize Tiffin Box
          </button>
        </div>

        {/* ✅ Added: Filter Info Text */}
        <div className="mt-2 text-sm text-[var(--gray)] font-medium text-center">
          {selectedCategory === "All" && selectedSubcategory === "All"
            ? "Showing all items"
            : `Showing ${selectedCategory}${selectedSubcategory !== "All" ? ` → ${selectedSubcategory}` : ""} items`}
        </div>
      </div>

      {/* Filter Popup */}
      {isFilterPopupOpen && (
        <div className="fixed mt-14 inset-0 z-50 flex items-center justify-center 
                        bg-[var(--accent)]/20 backdrop-blur-md 
                         transition-all duration-300">
          <div className="bg-[var(--secondary)] rounded-xl shadow-2xl 
                          w-full max-w-2xl mx-4 my-8 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-[var(--gray)]">
              <h2 className="text-xl font-semibold text-[var(--accent)]">Filter</h2>
              <button
                onClick={() => setIsFilterPopupOpen(false)}
                className="text-[var(--accent)] hover:text-[var(--primary)] transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Two Column Layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel */}
              <div className="w-1/3 bg-gray-50 border-r border-[var(--gray)] overflow-y-auto">
                {mainFilterCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleMainCategoryClick(cat)}
                    className={`w-full text-left py-3 px-4 font-medium transition-all duration-150 ${
                      openCategory === cat
                        ? "bg-[var(--secondary)] text-[var(--accent)] border-l-4 border-[var(--primary)]"
                        : "text-[var(--gray)] hover:bg-gray-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Right Panel */}
              <div className="w-2/3 bg-[var(--secondary)] overflow-y-auto">
                {renderRightPanel(openCategory)}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--gray)] flex justify-end">
              <button
                onClick={() => setIsFilterPopupOpen(false)}
                className="bg-[var(--primary)] hover:opacity-90 text-[var(--secondary)] px-4 py-2 rounded-lg font-medium transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Customize Modals */}
      {showCustomizeTiffinModal && (
        <CustomizeBoxModal
          userId={localStorage.getItem("userId")}
          onClose={() => setShowCustomizeTiffinModal(false)}
        />
      )}

      {showCustomizeFruitPlateModal && (
        <CustomizeFruitBowlModal
          userId={localStorage.getItem("userId")}
          onClose={() => setShowCustomizeFruitPlateModal(false)}
        />
      )}
    </>
  );
};

export default FilterBar;
