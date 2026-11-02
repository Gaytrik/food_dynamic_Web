import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// Importing child components
import MenuHeader from "../components/MenuHeader";
import MenuSidebar from "../components/MenuSidebar";
import ItemList from "../components/ItemList";
import EditModal from "../components/EditModal";
import DialogBox from "../components/DialogBox";


export default function AllItems() {
  const navigate = useNavigate();

  // --- State Management ---
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMain, setActiveMain] = useState("all");
  const [activeSub, setActiveSub] = useState("all");
  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // smooth scroll for better UX
  });
}, [currentPage]);
  // --- Dialog Box State (new) ---
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "info",    // "success" | "error" | "warning" | "info"
    title: "",
    message: "",
    autoClose: true,
    duration: 1500,  // default 1.5s
  });

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

  const [itemsPerPage, setItemsPerPage] = useState(12);

  const API_BASE_URL = 'http://localhost:8080/api/menu';
  const mainCategories = ["all", "breakfast", "lunch", "dinner", "roti", "sweet", "snacks", "fruit"];

  // --- Data Fetching & Processing ---

  useEffect(() => {
    console.log("🔄 Initial data loading...");
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/all`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMenuItems(data);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching menu items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const menu = useMemo(() => {
    const menuStructure = {
      breakfast: { name: "Breakfast", subItems: {} },
      lunch: { name: "Lunch", subItems: {} },
      dinner: { name: "Dinner", subItems: {} },
      roti: { name: "Roti", subItems: {} },
      sweet: { name: "Sweet", subItems: {} },
      // desserts: { name: "Desserts", subItems: {} },
      snacks: { name: "Snacks", subItems: {} },
      fruit: { name: "Fruit", subItems: {} },
    };

    menuItems.forEach(item => {
      const mainCategory = item.menuCategory?.toLowerCase();
      const subCategory = item.menuSubCategory || "General"; // Default subcategory for items without one
      if (mainCategory && menuStructure[mainCategory]) {
        if (!menuStructure[mainCategory].subItems[subCategory]) {
          menuStructure[mainCategory].subItems[subCategory] = [];
        }
      }
    });

    menuItems.forEach(item => {
      const menuItem = {
        id: item.id,
        name: item.menuName,
        image: item.imageUrl || "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
        price: item.price,
        status: item.available ? "Available" : "Not Available",
        description: item.description || "No description available",
        category: item.menuCategory,
        subCategory: item.menuSubCategory || "General",
        preparationTime: item.preparationTime,
        spiceLevel: item.spiceLevel,
        availability: item.availability || [],
        backendData: item
      };

      const mainCategory = item.menuCategory?.toLowerCase();
      const subCategory = item.menuSubCategory || "General";

      if (mainCategory && menuStructure[mainCategory]) {
        if (menuStructure[mainCategory].subItems[subCategory]) {
          menuStructure[mainCategory].subItems[subCategory].push(menuItem);
        }
      }
    });
    return menuStructure;
  }, [menuItems]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return displayedItems;
    }

    const query = searchQuery.toLowerCase();
    return displayedItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.subCategory.toLowerCase().includes(query)
    );
  }, [displayedItems, searchQuery]);

  useEffect(() => {
    let filteredItems = [];

    if (activeMain === "all") {
      Object.values(menu).forEach((cat) => {
        if (cat.subItems) {
          Object.values(cat.subItems).forEach((items) => {
            filteredItems = filteredItems.concat(items);
          });
        }
      });
    } else {
      const currentCategory = menu[activeMain];
      if (currentCategory && currentCategory.subItems) {
        if (activeSub === "all") {
          Object.values(currentCategory.subItems).forEach((items) => {
            filteredItems = filteredItems.concat(items);
          });
        } else {
          filteredItems = currentCategory.subItems[activeSub] || [];
        }
      }
    }

    setDisplayedItems(filteredItems);
    setCurrentPage(1);
  }, [activeMain, activeSub, menu]);

  const getAvailableSubcategories = () => {
    if (activeMain === "all" || !menu[activeMain]) return [];

    return Object.entries(menu[activeMain].subItems)
      .filter(([, items]) => items.length > 0)
      .map(([key]) => key);
  };

  const formatSubcategoryName = (subKey) => subKey;

  // --- Item Counts Calculation (Dynamic) ---
  const itemCounts = useMemo(() => {
    const total = filteredItems.length;
    const available = filteredItems.filter(item => item.backendData?.available === true).length;
    const unavailable = total - available;
    return { total, available, unavailable };
  }, [filteredItems]);

  // --- Pagination Logic ---
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const paginatedItems = filteredItems.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- CRUD/Action Handlers ---

  const handleEditClick = (item) => {
    setEditModal(item);
    setImagePreview(null);
    setSelectedImageFile(null);
    setDropdownOpen(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal) {
      showDialog("warning", "No item selected", "No item selected for update.", { duration: 2000 });
      return;
    }

    setOperationLoading(true);

    try {
      const token = localStorage.getItem("aadhi_token");
      const formData = new FormData();

      const updatedMenu = {
        menuName: e.target.menuName.value,
        description: e.target.description.value,
        menuCategory: e.target.menuCategory.value,
        menuSubCategory: e.target.menuSubCategory.value,
        price: parseFloat(e.target.price.value),
        preparationTime: e.target.preparationTime.value,
        spiceLevel: e.target.spiceLevel.value,
        available: e.target.available.value === "true",
      };

      formData.append(
        "menu",
        new Blob([JSON.stringify(updatedMenu)], { type: "application/json" })
      );

      if (selectedImageFile) {
        formData.append("image", selectedImageFile);
      }

      const response = await fetch(`${API_BASE_URL}/${editModal.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Update failed: ${response.status} - ${errText}`);
      }

      const updatedItem = await response.json();

      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === updatedItem.id
            ? { ...item, ...updatedItem, imageUrl: updatedItem.imageUrl }
            : item
        )
      );

      showDialog("success", "Updated", "Menu item updated successfully.", { duration: 1400 });
      setEditModal(null);
      setImagePreview(null);
      setSelectedImageFile(null);
    } catch (err) {
      console.error("❌ Update error:", err);
      showDialog("error", "Update failed", "Failed to update item: " + err.message, { autoClose: false });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleAddDish = () => {
    navigate("/additems");
  };

  // Toggle all items in a subcategory
  const toggleSubcategoryStatus = async (mainCategory, subCategory) => {
    setOperationLoading(true);
    try {
      const token = localStorage.getItem("aadhi_token");
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Get all items in this subcategory
      let subcategoryItems = [];
      if (subCategory === "all") {
        // For "All" subcategory, get all items from all subcategories in this main category
        subcategoryItems = Object.values(menu[mainCategory]?.subItems || {}).flat();
      } else {
        subcategoryItems = menu[mainCategory]?.subItems[subCategory] || [];
      }

      if (subcategoryItems.length === 0) {
        showDialog("warning", "No items", "No items found in this subcategory.", { duration: 2000 });
        return;
      }

      // Check if all items are available
      const allAvailable = subcategoryItems.every(item => item.backendData?.available === true);
      const newStatus = !allAvailable;

      console.log(` Toggling subcategory ${subCategory}: ${subcategoryItems.length} items to ${newStatus}`);

      // Update all items in parallel
      const updatePromises = subcategoryItems.map(async (item) => {
        const itemId = item.id;
        const itemToUpdate = menuItems.find(mi => mi.id === itemId);
        if (!itemToUpdate) return;

        // Try status update endpoint first
        try {
          const statusResponse = await fetch(`${API_BASE_URL}/${itemId}/status`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ available: newStatus })
          });

          if (statusResponse.ok) {
            return { id: itemId, status: newStatus, success: true };
          }
        } catch (err) {
          console.error(`Failed to update ${itemId} via status endpoint:`, err);
        }

        // Fallback to full update
        const updatedMenu = {
          id: itemToUpdate.id,
          menuName: itemToUpdate.menuName,
          description: itemToUpdate.description,
          menuCategory: itemToUpdate.menuCategory,
          menuSubCategory: itemToUpdate.menuSubCategory,
          price: itemToUpdate.price,
          preparationTime: itemToUpdate.preparationTime,
          spiceLevel: itemToUpdate.spiceLevel,
          available: newStatus,
          imageUrl: itemToUpdate.imageUrl,
          availability: itemToUpdate.availability || []
        };

        const response = await fetch(`${API_BASE_URL}/${itemId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedMenu)
        });

        if (response.ok) {
          return { id: itemId, status: newStatus, success: true };
        } else {
          throw new Error(`Failed to update item ${itemId}`);
        }
      });

      const results = await Promise.allSettled(updatePromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
      const failed = results.length - successful;

      // Update UI
      setMenuItems((prev) =>
        prev.map((item) => {
          const found = subcategoryItems.find(si => si.id === item.id);
          if (found) {
            return { ...item, available: newStatus };
          }
          return item;
        })
      );

      if (failed === 0) {
        showDialog("success", "Updated", `Successfully updated ${successful} items.`, { duration: 1500 });
      } else {
        showDialog("warning", "Partial update", `Updated ${successful} items. ${failed} failed.`, { duration: 2000 });
      }

    } catch (error) {
      console.error("❌ Toggle subcategory error:", error);
      if (error.message.includes('ACCESS_DENIED')) {
        showDialog("error", "Access Denied", "You need ADMIN privileges to update menu items.", { autoClose: false });
      } else if (error.message.includes('UNAUTHORIZED') || error.message.includes('token')) {
        showDialog("error", "Authentication failed", "Please login again.", { autoClose: false });
        localStorage.removeItem("aadhi_token");
        navigate("/login");
      } else {
        showDialog("error", "Toggle failed", `Failed to toggle subcategory: ${error.message}`, { autoClose: false });
      }
    } finally {
      setOperationLoading(false);
    }
  };

  // Check if all items in a subcategory are available
  const isSubcategoryAvailable = (mainCategory, subCategory) => {
    if (subCategory === "all") {
      // For "All" subcategory, check if all items in main category are available
      const allItems = Object.values(menu[mainCategory]?.subItems || {}).flat();
      if (allItems.length === 0) return false;
      return allItems.every(item => item.backendData?.available === true);
    } else {
      const subcategoryItems = menu[mainCategory]?.subItems[subCategory] || [];
      if (subcategoryItems.length === 0) return false;
      return subcategoryItems.every(item => item.backendData?.available === true);
    }
  };

  // ✅ FIXED: Toggle Status Function with Better Error Handling
  const toggleStatus = async (itemId) => {
    setOperationLoading(true);
    try {
      const itemToUpdate = menuItems.find(item => item.id === itemId);
      if (!itemToUpdate) throw new Error('Item not found');

      const newStatus = !itemToUpdate.available;
      const token = localStorage.getItem("aadhi_token");

      // ✅ CHECK TOKEN
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      console.log(" Toggling status for:", itemId, "New status:", newStatus);
      console.log(" Token present:", !!token);

      // ✅ OPTION 1: Try simple status update first
      const statusResponse = await fetch(`${API_BASE_URL}/${itemId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ available: newStatus })
      });

      if (statusResponse.ok) {
        const updatedItem = await statusResponse.json();
        console.log(" Status updated successfully via /status endpoint");

        // Update UI instantly
        setMenuItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, available: newStatus } : item
          )
        );

        setDropdownOpen(null);
        return;
      }

      // ✅ OPTION 2: If /status fails, try full update
      console.log(" Trying full update endpoint...");

      const updatedMenu = {
        id: itemToUpdate.id,
        menuName: itemToUpdate.menuName,
        description: itemToUpdate.description,
        menuCategory: itemToUpdate.menuCategory,
        menuSubCategory: itemToUpdate.menuSubCategory,
        price: itemToUpdate.price,
        preparationTime: itemToUpdate.preparationTime,
        spiceLevel: itemToUpdate.spiceLevel,
        available: newStatus,
        imageUrl: itemToUpdate.imageUrl,
        availability: itemToUpdate.availability || []
      };

      const response = await fetch(`${API_BASE_URL}/${itemId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedMenu)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("❌ Server response:", response.status, errText);

        if (response.status === 403) {
          throw new Error('ACCESS_DENIED: You need admin privileges to update menu items.');
        } else if (response.status === 401) {
          throw new Error('UNAUTHORIZED: Please login again.');
        } else {
          throw new Error(`Status update failed: ${response.status} - ${errText}`);
        }
      }

      const updatedItem = await response.json();
      console.log("✅ Status updated successfully via main endpoint");

      // Update UI instantly
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, available: newStatus } : item
        )
      );

      setDropdownOpen(null);

    } catch (error) {
      console.error("❌ Toggle error:", error);

      // ✅ BETTER ERROR MESSAGES
      if (error.message.includes('ACCESS_DENIED')) {
        showDialog("error", "Access Denied", "You need ADMIN privileges to update menu items.", { autoClose: false });
      } else if (error.message.includes('UNAUTHORIZED')) {
        showDialog("error", "Session expired", "Please login again.", { autoClose: false });
        localStorage.removeItem("aadhi_token");
        navigate("/login");
      } else if (error.message.includes('token')) {
        showDialog("error", "Authentication failed", "Please login again.", { autoClose: false });
        localStorage.removeItem("aadhi_token");
        navigate("/login");
      } else {
        showDialog("error", "Toggle failed", `Failed to toggle availability: ${error.message}`, { autoClose: false });
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    setOperationLoading(true);
    try {
      const token = localStorage.getItem("aadhi_token");
      const response = await fetch(`${API_BASE_URL}/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
        setDeleteConfirm(null);
        setDropdownOpen(null);
        showDialog("success", "Deleted", "Item deleted successfully.", { duration: 1400 });
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      showDialog("error", "Delete failed", `Failed to delete item: ${error.message}`, { autoClose: false });
    } finally {
      setOperationLoading(false);
    }
  };

  const toggleDropdown = (itemId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === itemId ? null : itemId);
    setDeleteConfirm(null);
  };

  // --- UI Render ---

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--accent)]">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--secondary)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--primary)] mb-4">Error: {error}</p>
          <button
            onClick={fetchMenuItems}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:mt-0 mt-14 bg-[var(--secondary)] text-[var(--accent)] pt-3 sm:pt-4 pb-4">
      {/* 1. HEADER - Added search bar here */}

      <MenuHeader
        handleAddDish={handleAddDish}
        itemCounts={itemCounts}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. SIDEBAR (Category Tabs) */}
      <MenuSidebar
        mainCategories={mainCategories}
        activeMain={activeMain}
        setActiveMain={setActiveMain}
        activeSub={activeSub}
        setActiveSub={setActiveSub}
        menu={menu}
        getAvailableSubcategories={getAvailableSubcategories}
        formatSubcategoryName={formatSubcategoryName}
        toggleSubcategoryStatus={toggleSubcategoryStatus}
        isSubcategoryAvailable={isSubcategoryAvailable}
        operationLoading={operationLoading}
      />

      {/* 3. ITEM LIST (Grid, Cards, Pagination) */}
      <ItemList
        operationLoading={operationLoading}
        displayedItems={filteredItems}
        paginatedItems={paginatedItems}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        handleAddDish={handleAddDish}
        dropdownOpen={dropdownOpen}
        toggleDropdown={toggleDropdown}
        handleEditClick={handleEditClick}
        toggleStatus={toggleStatus}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        handleDeleteItem={handleDeleteItem}
        totalItems={filteredItems.length}
        itemsPerPage={itemsPerPage}
        dialogOpen={dialog.isOpen}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* 4. EDIT MODAL */}
      <EditModal
        editModal={editModal}
        setEditModal={setEditModal}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        setSelectedImageFile={setSelectedImageFile}
        selectedImageFile={selectedImageFile}
        handleImageChange={handleImageChange}
        handleEditSubmit={handleEditSubmit}
        operationLoading={operationLoading}
      />

      {/* DialogBox instance (page-wide) */}
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
}