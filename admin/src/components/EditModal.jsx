import React, { useState, useEffect } from 'react';

export default function EditModal({
  editModal,
  setEditModal,
  imagePreview,
  setImagePreview,
  setSelectedImageFile,
  selectedImageFile,
  handleImageChange,
  handleEditSubmit,
  operationLoading,
}) {

  // Your actual categories and subcategories
  const mainCategories = [
    "Breakfast",
    "Lunch", 
    "Snacks",
    "Dinner",
    "Sweet",
    "Roti",
    "Fruit"
  ];
  
  const subCategoriesMap = {
    Lunch: ["Dry", "Gravy", "Dal", "Rice", "Roti"],
    Dinner: ["Dry", "Gravy", "Dal", "Rice", "Chapati", "Roti"],
    Breakfast: ["South-Indian", "Maharashtrian", "Indian"],
    Snacks: ["Snacks"],
    Sweet: ["Sweet"],
    Roti: ["Roti", "Tandoor Roti", "Chapati"],
    Fruit: ["Fruit Plate", "Fresh Fruits"]
  };

  // State for selected category and its subcategories
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentSubCategories, setCurrentSubCategories] = useState([]);

  // Function to close modal and reset image state
  const closeModal = () => {
    setEditModal(null);
    setImagePreview(null);
    setSelectedImageFile(null);
  };

  // Update subcategories when category changes or editModal updates
  useEffect(() => {
    if (editModal) {
      const category =
        editModal.menuCategory ||
        editModal.category ||
        editModal.categoryName ||
        "";
      setSelectedCategory(category);
      setCurrentSubCategories(subCategoriesMap[category] || []);
    }
  }, [editModal]);

  // Handle category change
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setCurrentSubCategories(subCategoriesMap[newCategory] || []);
  };

  // Safe data access function
  const getEditModalValue = (key, defaultValue = "") => {
    if (!editModal) return defaultValue;
    return editModal[key] || defaultValue;
  };

  if (!editModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] border border-gray-200 flex flex-col">
        {/* Header - Fixed */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-[var(--accent)]">Edit Menu Item</h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-[var(--primary)] text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-[var(--accent)] mb-3">
                  Item Image
                </label>
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={imagePreview || getEditModalValue('image')}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/96?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)] file:text-white hover:file:bg-[var(--primary)]/90"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedImageFile ? `Selected: ${selectedImageFile.name}` : "Choose a new image to update (optional)"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="menuName"
                    defaultValue={getEditModalValue('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={getEditModalValue('price')}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  defaultValue={getEditModalValue('description')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                    Category *
                  </label>
                  <select
                    name="menuCategory"
                    value={selectedCategory || ""}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors appearance-none bg-white"
                    required
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {mainCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                    Sub Category *
                  </label>
                  <select
                    name="menuSubCategory"
                    defaultValue={getEditModalValue('menuSubCategory', getEditModalValue('subCategory', ""))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors appearance-none bg-white"
                  >
                    <option value="">Select Sub-Category (optional)</option>
                    {currentSubCategories.length > 0 ? (
                      currentSubCategories.map((subCategory) => (
                        <option key={subCategory} value={subCategory}>
                          {subCategory}
                        </option>
                      ))
                    ) : (
                      <option value="">No subcategories</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                  {currentSubCategories.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No subcategories available for {selectedCategory}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                    Preparation Time
                  </label>
                  <input
                    type="text"
                    name="preparationTime"
                    defaultValue={getEditModalValue('preparationTime')}
                    placeholder="e.g., 15-20 minutes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                    Spice Level
                  </label>
                  <select
                    name="spiceLevel"
                    defaultValue={getEditModalValue('spiceLevel')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors appearance-none bg-white"
                  >
                    <option value="">Select Spice Level</option>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot</option>
                    <option value="Extra Hot">Extra Hot</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-[var(--accent)] mb-1">
                  Availability Status
                </label>
                <select
                  name="available"
                  defaultValue={getEditModalValue('status') === "Available" ? "true" : "false"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors appearance-none bg-white"
                >
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>

              {/* Buttons - Fixed at bottom of scrollable area */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-[var(--accent)] rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="flex-1 px-4 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors font-medium disabled:opacity-50"
                >
                  {operationLoading ? "Updating..." : "Update Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}