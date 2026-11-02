import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DialogBox from "../components/DialogBox";


// --- Icon Definitions ---
const ChevronDownIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const UploadImageIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    // Applied --primary color
    className="h-10 w-10 text-[var(--primary)]" 
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const PlusIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const BackArrowIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const ClearIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// Base URL for backend API
const API_BASE_URL = "http://localhost:8080/api/menu";

const AddMenuItem = () => {
  // --- State Management ---
  const [menuName, setMenuName] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [menuCategory, setMenuCategory] = useState("");
  const [menuSubCategory, setMenuSubCategory] = useState("");
  const [price, setPrice] = useState("");
  // ONLY ONE IMAGE ALLOWED
  const [uploadedImages, setUploadedImages] = useState([]); // For preview URL
  const [uploadedImageFiles, setUploadedImageFiles] = useState([]); // For actual File object
  const [preparationTime, setPreparationTime] = useState("");
  const [spiceLevel, setSpiceLevel] = useState("");
  const [availability, setAvailability] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  
  // Dialog state
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    autoClose: true,
    duration: 1500,
  });

  // Maximum one image is allowed as per new requirement
  const MAX_IMAGES = 1;
  const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

  // --- Data Definitions ---
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
    Roti: ["Roti","Tandoor Roti","Chapati"],
    Fruit: []
  };

  const getSubCategories = (category) => {
    return subCategoriesMap[category] || [];
  };

   // --- Dialog helpers ---
  const showDialog = (type, title, message, options = {}) => {
    setDialog({
      isOpen: true,
      type,
      title,
      message,
      autoClose: options.autoClose ?? true,
      duration: options.duration ?? 1500,
    });
  };
  const closeDialog = () => setDialog((d) => ({ ...d, isOpen: false }));

  // --- Image Handling ---
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    // Only take the first file due to MAX_IMAGES = 1
    const newFile = files[0];

    if (!newFile) return;

    // --- Validation ---
    const fileType = newFile.type;
    const fileSize = newFile.size;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(fileType)) {
      showDialog("warning", "Invalid file type", "Only JPG, JPEG or PNG files are allowed.", { duration: 2500 });
      event.target.value = null; // Clear file input
      return;
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      showDialog("warning", "File too large", "Image exceeds 2MB size limit.", { duration: 2500 });
      event.target.value = null; // Clear file input
      return;
    }
    // --- End Validation ---

    // Since MAX_IMAGES is 1, we replace the existing image
    setUploadedImageFiles([newFile]);

    // Create preview URL for frontend display
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImages([reader.result]);
    };
    reader.readAsDataURL(newFile);
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setUploadedImageFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    // Manually clear the file input field in case the user wants to upload the same file again immediately
    const inputElement = document.getElementById("imageUpload");
    if (inputElement) {
      inputElement.value = null;
    }
  };

  // --- Availability Handling ---
  const handleAvailabilityChange = (e) => {
    const { value, checked } = e.target;
    setAvailability((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  // --- Form Reset Function ---
  const handleClear = () => {
    setMenuName("");
    setMenuDescription("");
    setMenuCategory("");
    setMenuSubCategory("");
    setPrice("");
    setUploadedImages([]);
    setUploadedImageFiles([]);
    setPreparationTime("");
    setSpiceLevel("");
    setAvailability([]);
    setErrors({});
    // Manually clear the file input field
    const inputElement = document.getElementById("imageUpload");
    if (inputElement) {
      inputElement.value = null;
    }
    showDialog("info", "Form cleared", "All fields have been reset.", { duration: 1500 });
  };

  // --- Validation Logic ---
  const validateForm = () => {
    const newErrors = {};
    if (!menuName) newErrors.menuName = "Menu Name is required.";
    if (!menuDescription)
      newErrors.menuDescription = "Menu Description is required.";
    if (!menuCategory) newErrors.menuCategory = "Category is required.";

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      newErrors.price = "Valid Price is required (must be > 0).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- BACKEND INTEGRATION: Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()){
            showDialog("warning", "Validation failed", "Please fix the highlighted fields.", { duration: 2000 });

    return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      const menuItemData = {
        menuName,
        menuCategory,
        menuSubCategory,
        price: parseFloat(price),
        description: menuDescription,
        available: availability.length > 0,
        availability,
        preparationTime,
        spiceLevel,
      };

      // Attach JSON data as Blob
      formData.append(
        "menuItem",
        new Blob([JSON.stringify(menuItemData)], { type: "application/json" })
      );

      // Attach the single image file if uploaded
      if (uploadedImageFiles.length > 0) {
        formData.append("file", uploadedImageFiles[0]);
      }

      const response = await fetch(`${API_BASE_URL}/add-with-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save menu item");
      }

      const result = await response.json();
      console.log("✅ Saved Menu Item:", result);

      showDialog("success", "Saved", "Menu item saved successfully.", { duration: 2000 });
      setTimeout(() => handleClear(), 800);
    } catch (error) {
      console.error("❌ Error saving menu item:", error);
      showDialog("error", "Save Failed", error.message || "Unknown error", { autoClose: false });
    } finally {
      setLoading(false);
    }
  };

  // --- Helper function for input class based on error state ---
  const getInputClasses = (fieldName) =>
    `w-full px-4 py-2 border ${
      errors[fieldName]
        ? "border-red-500 ring-red-500"
        // Applied --primary color to focus ring and border
        : "border-gray-300"
    } rounded-md focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm`;

  const getSelectClasses = (fieldName) =>
    `w-full px-4 py-2 border ${
      errors[fieldName]
        ? "border-red-500 ring-red-500"
        // Applied --primary color to focus ring and border
        : "border-gray-300"
    } rounded-md appearance-none focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm bg-[var(--secondary)] pr-10`;

  const navigate = useNavigate();
  const handleBackToMenu = () => {
    // TODO: Use your routing library (e.g., useNavigate from 'react-router-dom')
    // to navigate to the 'AllItemsPage' route here.
    // Example: navigate('/menu/all-items');
   showDialog("info", "Navigating", "Redirecting to All Items...", { duration: 900 });
    setTimeout(() => navigate("/allitems"), 900);
  };

  return (
    // Changed bg-gray-100 to a custom soft background if needed, but keeping gray-100 as it's outside the theme variables, but it works well with white cards.
    <div className="min-h-screen md:mt-0 mt-12 bg-gray-100 flex flex-col">
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            {/* Applied --accent color */}
            <h2 className="text-xl font-semibold text-[var(--accent)]">
              Add New Menu
            </h2>
            <p className="text-sm text-gray-500">Add new menu to your Cafe</p>
          </div>
          <button
            onClick={handleBackToMenu} // Use the new handler for navigation
            // Applied --secondary (bg-white), --accent (text), and --primary (border/hover) colors
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--secondary)] text-[var(--accent)] border border-[var(--primary)]/30 rounded-lg shadow-sm hover:bg-[var(--primary)]/10 transition"
          >
            <BackArrowIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Menu</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Name & Description */}
            {/* Applied --secondary color for card background */}
            <div className="bg-[var(--secondary)] p-6 rounded-lg shadow-sm border border-gray-200">
              {/* Applied --accent color */}
              <h3 className="text-lg font-medium text-[var(--accent)] mb-4">
                Name & Description
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="menuName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Menu Name
                </label>
                <input
                  type="text"
                  id="menuName"
                  value={menuName}
                  onChange={(e) => {
                    setMenuName(e.target.value);
                    setErrors((prev) => ({ ...prev, menuName: "" }));
                  }}
                  placeholder="e.g. Special Veg Thali or Masala Dosa"
                  className={getInputClasses("menuName")}
                  required
                />
                {errors.menuName && (
                  <p className="mt-1 text-xs text-red-500 font-medium">
                    {errors.menuName}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="menuDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Menu Description
                </label>
                <textarea
                  id="menuDescription"
                  value={menuDescription}
                  onChange={(e) => {
                    setMenuDescription(e.target.value);
                    setErrors((prev) => ({ ...prev, menuDescription: "" }));
                  }}
                  rows="6"
                  placeholder="Describe the dish and its ingredients..."
                  className={getInputClasses("menuDescription")}
                  required
                ></textarea>
                {errors.menuDescription && (
                  <p className="mt-1 text-xs text-red-500 font-medium">
                    {errors.menuDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Menu Image */}
            {/* Applied --secondary color for card background */}
            <div className="bg-[var(--secondary)] p-6 rounded-lg shadow-sm border border-gray-200">
              {/* Applied --accent color */}
              <h3 className="text-lg font-medium text-[var(--accent)] mb-4">
                Menu Image
              </h3>

              <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
                {/* Upload Button */}
                <div
                  className={`col-span-1 aspect-square border-2 ${
                    uploadedImages.length < MAX_IMAGES
                      // Applied --primary color to border
                      ? "border-[var(--primary)]/50 border-dashed hover:border-[var(--primary)]"
                      : "border-gray-300 cursor-not-allowed"
                  } rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200`}
                  onClick={() =>
                    uploadedImages.length < MAX_IMAGES &&
                    document.getElementById("imageUpload").click()
                  }
                >
                  <input
                    type="file"
                    id="imageUpload"
                    className="hidden"
                    // Updated accept attribute for file type restriction
                    accept="image/jpeg,image/jpg,image/png"
                    // Changed to single file upload
                    multiple={false}
                    onChange={handleImageUpload}
                    disabled={uploadedImages.length >= MAX_IMAGES}
                  />
                  {/* Icon uses theme color via definition above */}
                  <UploadImageIcon />
                  {/* Applied --primary color to text */}
                  <span className="text-sm text-[var(--primary)] font-medium mt-2">
                    {uploadedImages.length === 0 ? "Upload Image" : "Replace Image"}
                  </span>
                </div>

                {/* Image Preview */}
                {uploadedImages.map((imageSrc, index) => (
                  <div
                    key={index}
                    className="relative col-span-1 aspect-square border border-gray-300 rounded-lg overflow-hidden group"
                  >
                    <img
                      src={imageSrc}
                      alt={`Menu item ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Remove image"
                    >
                      {/* PlusIcon rotated 45deg acts as a close/clear icon */}
                      <PlusIcon className="h-3 w-3 rotate-45" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Only one image is allowed.
                Supported formats: JPG, JPEG, PNG.
                Max file size: 2MB.
              </p>
            </div>

            {/* Availability */}
            {/* Applied --secondary color for card background */}
            
            {/* <div className="bg-[var(--secondary)] p-6 rounded-lg shadow-sm border border-gray-200"> */}
              {/* Applied --accent color */}
              {/* <h3 className="text-lg font-medium text-[var(--accent)] mb-4">
                Availability
              </h3> */}
              {/* <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {["All Day", "Breakfast Only", "Lunch Only", "Dinner Only"].map(
                  (item) => (
                    <label
                      key={item}
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <input
                        type="checkbox"
                        value={item}
                        checked={availability.includes(item)}
                        onChange={handleAvailabilityChange}
                        // Applied --primary color to checkbox
                        className="h-4 w-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                      />
                      <span className="ml-2">{item}</span>
                    </label>
                  )
                )}
              </div> */}
            {/* </div> */}
            
          </div>

          {/* Right Column */}
          <div className="md:col-span-1 space-y-6">
            {/* Category */}
            {/* Applied --secondary color for card background */}
            <div className="bg-[var(--secondary)] p-6 rounded-lg shadow-sm border border-gray-200">
              {/* Applied --accent color */}
              <h3 className="text-lg font-medium text-[var(--accent)] mb-4">
                Category
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="menuCategory"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Menu Category
                </label>
                <div className="relative">
                  <select
                    id="menuCategory"
                    value={menuCategory}
                    onChange={(e) => {
                      setMenuCategory(e.target.value);
                      setMenuSubCategory("");
                      setErrors((prev) => ({ ...prev, menuCategory: "" }));
                    }}
                    className={getSelectClasses("menuCategory")}
                    required
                  >
                    <option value="">Select Category</option>
                    {mainCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.menuCategory && (
                  <p className="mt-1 text-xs text-red-500 font-medium">
                    {errors.menuCategory}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="menuSubCategory"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Menu Sub-Category
                </label>
                <div className="relative">
                  <select
                    id="menuSubCategory"
                    value={menuSubCategory}
                    onChange={(e) => setMenuSubCategory(e.target.value)}
                    className={getSelectClasses("menuSubCategory")}
                    disabled={!menuCategory}
                  >
                    <option value="">Select Sub-Category</option>
                    {getSubCategories(menuCategory).map((subCat) => (
                      <option key={subCat} value={subCat}>
                        {subCat}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Preparation Time & Spice Level */}
            {/* Applied --secondary color for card background */}
            <div className="bg-[var(--secondary)] p-6 rounded-lg shadow-sm border border-gray-200">
              {/* Applied --accent color */}
              <h3 className="text-lg font-medium text-[var(--accent)] mb-4">
                Preparation Details
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="preparationTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Preparation Time
                </label>
                <input
                  type="text"
                  id="preparationTime"
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                  placeholder="e.g., 15-20 minutes"
                  className={getInputClasses("preparationTime")}
                />
              </div>
              <div>
                <label
                  htmlFor="spiceLevel"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Spice Level
                </label>
                <div className="relative">
                  <select
                    id="spiceLevel"
                    value={spiceLevel}
                    onChange={(e) => setSpiceLevel(e.target.value)}
                    className={getSelectClasses("spiceLevel")}
                  >
                    <option value="">Select Spice Level</option>
<option value="No Spice">No Spice</option>
<option value="Mild">Mild</option>
<option value="Medium">Medium</option>
<option value="Spicy">Spicy</option>
<option value="Extra Spicy">Extra Spicy</option>
<option value="Fiery Hot">Fiery Hot</option>

                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Menu Pricing */}
            {/* Applied --secondary color for card background */}
            <div className="bg-[var(--secondary)] p-6 rounded-lg shadow-sm border border-gray-200">
              {/* Applied --accent color */}
              <h3 className="text-lg font-medium text-[var(--accent)] mb-4">
                Menu Pricing
              </h3>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setErrors((prev) => ({ ...prev, price: "" }));
                    }}
                    placeholder="150"
                    className={`${getInputClasses("price")} pl-8`}
                    step="0.0"
                    required
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-xs text-red-500 font-medium">
                    {errors.price}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  This is the final selling price.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClear}
                // Kept red for 'Clear' button color, as the theme does not provide a specific danger/secondary action color, but used primary for hover background for consistency.
                className="flex items-center space-x-2 px-5 py-2 border border-gray-300 rounded-lg text-red-600 font-medium hover:bg-red-50 transition shadow-sm"
                disabled={loading}
              >
                <ClearIcon className="h-4 w-4" />
                <span>Clear</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                // Applied --primary color to background and hover state
                className="flex items-center space-x-2 px-5 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary)]/90 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="h-4 w-4" />
                <span>{loading ? "Saving..." : "Add to Menu"}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
       {/* DialogBox instance */}
      <DialogBox
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        autoClose={dialog.autoClose}
        duration={dialog.duration}
      />
    </div>
  );
};

export default AddMenuItem;