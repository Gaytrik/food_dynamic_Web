import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, MapPin, X, Shield, Trash2, ChevronDown, FileDown, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  AiOutlineDoubleLeft,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineDoubleRight,
} from "react-icons/ai";
import jsPDF from "jspdf";
import "jspdf-autotable";





const AdminUserManagement = () => {
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ✅ NEW
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPageSizeMenu, setShowPageSizeMenu] = useState(false);
  const [menuItems, setMenuItems] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize) || 0;
useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // smooth scroll for better UX
  });
}, [currentPage]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowGenderMenu(false);
      setShowStatusMenu(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);


  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginLeft = 40;
    const marginRight = 40;
    const usableWidth = pageWidth - marginLeft - marginRight;
    const colWidths = [100, 160, 70, 90, 60]; // total ≈ 480, fits in A4
    const startY = 120;
    const lineHeight = 24;
    let yPos = startY;

    // ---------------- HEADER ----------------
    doc.setFillColor(39, 174, 96);
    doc.rect(0, 0, pageWidth, 80, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Aadhi Jevan", marginLeft, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("User Report", marginLeft, 60);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - marginRight, 60, {
      align: "right",
    });

    // Thin separator
    doc.setDrawColor(200, 200, 200);
    doc.line(marginLeft, 90, pageWidth - marginRight, 90);

    // ---------------- TABLE HEADER ----------------
    const headers = ["Name", "Email", "Gender", "Phone", "Status"];
    const headerY = 105;

    doc.setFillColor(46, 204, 113);
    doc.rect(marginLeft, headerY, usableWidth, 25, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);

    let x = marginLeft + 8;
    headers.forEach((header, i) => {
      doc.text(header, x, headerY + 17);
      x += colWidths[i];
    });

    // ---------------- TABLE BODY ----------------
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    yPos = headerY + 40;

    const truncate = (text, len = 25) =>
      text && text.length > len ? text.substring(0, len) + "..." : text || "N/A";

    filteredUsers.forEach((user, i) => {
      if (yPos + lineHeight > pageHeight - 40) {
        doc.addPage();
        yPos = 60;

        // Repeat table header on new page
        doc.setFillColor(46, 204, 113);
        doc.rect(marginLeft, yPos, usableWidth, 25, "F");
        doc.setTextColor(255, 255, 255);
        let xHeader = marginLeft + 8;
        headers.forEach((header, idx) => {
          doc.text(header, xHeader, yPos + 17);
          xHeader += colWidths[idx];
        });
        yPos += 40;
        doc.setTextColor(60, 60, 60);
      }

      // Alternate row color
      if (i % 2 === 0) {
        doc.setFillColor(247, 247, 247);
        doc.rect(marginLeft, yPos - 12, usableWidth, lineHeight, "F");
      }

      // Draw row
      let xPos = marginLeft + 8;
      const rowData = [
        truncate(user.name, 20),
        truncate(user.email, 35),
        user.gender || "N/A",
        user.number?.toString() || "N/A",
        user.isBlock ? "Blocked" : "Active",
      ];

      rowData.forEach((text, idx) => {
        doc.text(text, xPos, yPos);
        xPos += colWidths[idx];
      });

      yPos += lineHeight;
    });



    doc.save("User_Report.pdf");
  };





  // Fetch users
  const fetchUsers = async (page = 0, size = pageSize) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/auth/users?page=${page}&size=${size}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data.content || []);
      setTotalCount(response.data.totalElements || response.data.content?.length || 0);

      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch menu item details for purchase history
  const fetchMenuItemDetails = async (menuId) => {
    if (menuItems[menuId]) return menuItems[menuId];

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/menu/${menuId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      return { name: 'Unknown Item', price: 0 };
    }
  };

  // Load purchase history when user is selected
  const loadPurchaseHistory = async (user) => {
    if (!user.purchaseHistories || user.purchaseHistories.length === 0) return;

    try {
      setLoadingHistory(true);
      const menuDetailsPromises = user.purchaseHistories.map((history) =>
        fetchMenuItemDetails(history.menuId)
      );
      const menuDetails = await Promise.all(menuDetailsPromises);

      const menuMap = {};
      menuDetails.forEach((item, index) => {
        menuMap[user.purchaseHistories[index].menuId] = item;
      });

      setMenuItems((prev) => ({ ...prev, ...menuMap }));
    } catch (error) {
      console.error('Error loading purchase history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };


  useEffect(() => {
    fetchUsers(0, pageSize);
  }, [pageSize]);

  useEffect(() => {
    if (selectedUser) {
      loadPurchaseHistory(selectedUser);
    }
  }, [selectedUser]);

  // Toggle block status
  const toggleBlockStatus = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const updatedUser = { ...user, isBlock: !user.isBlock };
      const response = await axios.put(
        `http://localhost:8080/api/auth/update?email=${user.email}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        toast.success(`User ${updatedUser.isBlock ? 'blocked' : 'unblocked'} successfully`);
        fetchUsers(currentPage, pageSize);
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    }
  };

  // Delete user
  const deleteUser = async (email) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:8080/api/auth/delete?email=${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        toast.success('User deleted successfully');
        setSelectedUser(null);
        fetchUsers(currentPage, pageSize);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.number?.toString().includes(query);

    const matchesGender =
      genderFilter === 'ALL' || user.gender === genderFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && !user.isBlock) ||
      (statusFilter === 'BLOCKED' && user.isBlock);

    return matchesSearch && matchesGender && matchesStatus;
  });



  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(0);
    setShowPageSizeMenu(false);
  };

  // Calculate total purchases for a user
  const getTotalPurchases = (user) => {
    if (!user.purchaseHistories) return 0;
    return user.purchaseHistories.reduce((sum, history) => sum + history.purchaseCount, 0);
  };

  const handleUserClick = async (user) => {
    await loadPurchaseHistory(user);  // ensures all menu names are fetched
    setSelectedUser(user);            // opens modal *after* details are ready
  };


  return (
    <div className="flex">

      <div className="flex flex-col flex-1 min-h-screen bg-gray-50 overflow-x-hidden">


        {/* Header */}

        <div className="sticky md:mt-0 mt-12 z-30 bg-white p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

            {/* LEFT: Title & Description */}
            <div className="flex flex-col lg:w-1/2">
              <h1 className="text-3xl font-bold text-gray-800">
                User Management
              </h1>
              <p className="text-gray-600 text-sm">
                Manage and monitor all registered users
              </p>
            </div>

            {/* RIGHT: Search + Filters (all in one row) */}
            {/* 🔍 Search + Filters Row */}
            <div className="flex flex-col w-full lg:w-1/2">
              <div className="flex items-center justify-end gap-3 w-full relative">

                <button
                  onClick={handleDownloadPDF}
                  className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition text-gray-600 flex items-center gap-2"
                  title="Download all users as PDF"
                >
                  <FileDown className="w-5 h-5 text-[var(--primary)]" />
                </button>


                {/* Search Bar (60%) */}
                <div className="relative w-[67%]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 
          focus:border-[var(--primary)] transition-all bg-white"
                  />
                </div>

                {/* 👤 Gender Filter */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGenderMenu((prev) => !prev);
                      setShowStatusMenu(false);
                    }}
                    className={`p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition ${genderFilter !== "ALL" ? "text-[var(--primary)] border-[var(--primary)]/30" : "text-gray-600"
                      }`}
                    title="Filter by gender"
                  >
                    <Users className="w-5 h-5" />
                  </button>

                  {showGenderMenu && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-30 animate-fadeIn"
                    >
                      {["ALL", "Male", "Female", "Other"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setGenderFilter(option);
                            setShowGenderMenu(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-all ${genderFilter === option
                            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {option === "ALL" ? "All Genders" : option}
                        </button>
                      ))}


                    </div>
                  )}
                </div>

                {/* 🛡️ Status Filter */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStatusMenu((prev) => !prev);
                      setShowGenderMenu(false);
                    }}
                    className={`p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition ${statusFilter !== "ALL" ? "text-[var(--primary)] border-[var(--primary)]/30" : "text-gray-600"
                      }`}
                    title="Filter by status"
                  >
                    <Shield className="w-5 h-5" />
                  </button>

                  {showStatusMenu && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-30 animate-fadeIn"
                    >
                      {[
                        { label: "All Status", value: "ALL" },
                        { label: "Active Users", value: "ACTIVE" },
                        { label: "Blocked Users", value: "BLOCKED" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setStatusFilter(option.value);
                            setShowStatusMenu(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-all ${statusFilter === option.value
                            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>






        {/* Users Table */}
        {/* --- Responsive User List (Table for Desktop, Cards for Mobile) --- */}
        <div className="flex-1 mb-36 md:mb-0 flex justify-center overflow-hidden">
          <div
            className="bg-white rounded-t-2xl shadow-md border border-gray-100 flex flex-col w-full max-w-6xl"
            style={{ height: "calc(71vh)" }}
          >

            {loading ? (
              <LoadingSkeleton count={pageSize} />
            ) : filteredUsers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center sm:mt-0 mb-30 sm:mb-0 p-12">
                <Users className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No users found</p>
                {(searchQuery || genderFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setGenderFilter("ALL");
                      setStatusFilter("ALL");
                    }}
                    className="mt-4 px-6 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Table Header for Desktop */}
                <div className="hidden md:block sticky top-0 z-20 bg-gray-100 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-semibold text-gray-600 uppercase">
                    <div className="col-span-4">User</div>
                    <div className="col-span-3">Contact</div>
                    <div className="col-span-2">Gender</div>
                    <div className="col-span-2">Purchases</div>
                    <div className="col-span-1">Status</div>
                  </div>
                </div>

                {/* Scrollable Table / Cards */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 px-2 md:px-0 no-scrollbar">
                  {filteredUsers.map((user) => (
                    <UserRow
                      key={user.email}
                      user={user}
                      onClick={() => handleUserClick(user)}
                      getTotalPurchases={getTotalPurchases}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>




        {/* Pagination */}
        {/* Pagination (5-page group system) */}
        {totalPages >= 1 && (
          <div
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg 
               md:rounded-b-2xl md:static md:shadow-md transition-all"
          >  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 sm:px-6">

              {/* --- Page Info --- */}
              <div className="text-sm text-gray-600">
                Page{" "}
                <span className="font-semibold text-gray-800">{currentPage + 1}</span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">{totalPages}</span>{" "}
                — Showing{" "}
                <span className="font-semibold text-gray-800">
                  {Math.min((currentPage + 1) * pageSize, totalCount || users.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {totalCount || users.length}
                </span>{" "}
                users
              </div>

              {/* --- Pagination Controls --- */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {(() => {
                  const groupSize = 5;
                  const currentGroup = Math.floor(currentPage / groupSize);
                  const startPage = currentGroup * groupSize + 1;
                  const endPage = Math.min(startPage + groupSize - 1, totalPages);

                  const handleGroupForward = () => {
                    const nextGroupPage = Math.min(totalPages - 1, startPage + groupSize - 1);
                    fetchUsers(nextGroupPage, pageSize);
                  };

                  const handleGroupBackward = () => {
                    const prevGroupPage = Math.max(0, startPage - groupSize - 1);
                    fetchUsers(prevGroupPage, pageSize);
                  };

                  return (
                    <>
                      {/* First Group */}
                      <button
                        onClick={() => fetchUsers(0, pageSize)}
                        disabled={currentPage === 0}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md text-[var(--accent)] bg-gray-50
                           disabled:opacity-50 hover:bg-gray-100 disabled:cursor-not-allowed transition-all"
                      >
                        <AiOutlineDoubleLeft className="w-4 h-4" />
                      </button>

                      {/* Previous Group */}
                      <button
                        onClick={handleGroupBackward}
                        disabled={startPage <= 1}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md text-[var(--accent)] bg-gray-50
                           disabled:opacity-50 hover:bg-gray-100 disabled:cursor-not-allowed transition-all"
                      >
                        <AiOutlineLeft className="w-4 h-4" />
                      </button>

                      {/* Dynamic Page Numbers (5 per group) */}
                      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
                        (pageNumber) => (
                          <button
                            key={pageNumber}
                            onClick={() => fetchUsers(pageNumber - 1, pageSize)}
                            className={`w-10 h-10 border border-gray-300 rounded-full text-sm font-semibold transition-all duration-200 ${currentPage + 1 === pageNumber
                              ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md scale-105"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      )}

                      {/* Next Group */}
                      <button
                        onClick={handleGroupForward}
                        disabled={endPage >= totalPages}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md text-[var(--accent)] bg-gray-50
                           disabled:opacity-50 hover:bg-gray-100 disabled:cursor-not-allowed transition-all"
                      >
                        <AiOutlineRight className="w-4 h-4" />
                      </button>

                      {/* Last Group */}
                      <button
                        onClick={() => fetchUsers(totalPages - 1, pageSize)}
                        disabled={currentPage >= totalPages - 1}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md text-[var(--accent)] bg-gray-50
                           disabled:opacity-50 hover:bg-gray-100 disabled:cursor-not-allowed transition-all"
                      >
                        <AiOutlineDoubleRight className="w-4 h-4" />
                      </button>
                    </>
                  );
                })()}

                {/* Items Per Page Dropdown */}
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize);
                    fetchUsers(0, newSize);
                  }}
                  className="ml-3 px-3 py-2 border border-[var(--primary)] rounded-md text-sm text-[var(--primary)]
                     focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-white transition-all"
                >
                  {[5, 10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}




        {/* User Detail Modal */}
        {selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onToggleBlock={() => toggleBlockStatus(selectedUser)}
            onDelete={() => deleteUser(selectedUser.email)}
            menuItems={menuItems}
            loadingHistory={loadingHistory}
          />
        )}
      </div>
    </div>
  );
};

// User Row Component
const UserRow = ({ user, onClick, getTotalPurchases }) => {
  const totalPurchases = getTotalPurchases(user);

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-3 bg-white md:bg-transparent hover:bg-gray-50 md:hover:bg-gray-50 transition-all cursor-pointer   mb-3 md:mb-0"
    >
      {/* USER CARD (mobile) or TABLE ROW (desktop) */}

      {/* User Info */}
      <div className="col-span-1 md:col-span-4 md:pt-0  flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-800 truncate group-hover:text-[var(--primary)] transition-colors">
            {user.name}
          </p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex md:col-span-3 items-center text-sm text-gray-600 truncate">
        {user.number || "No phone"}
      </div>
      <div className="hidden md:flex md:col-span-2 items-center">
        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          {user.gender}
        </span>
      </div>
      <div className="hidden md:flex md:col-span-2 items-center">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-semibold text-gray-700">
            {totalPurchases} items
          </span>
        </div>
      </div>
      <div className="hidden md:flex md:col-span-1 items-center justify-center">
        {user.isBlock ? (
          <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
            Blocked
          </span>
        ) : (
          <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full">
            Active
          </span>
        )}
      </div>

      {/* Mobile Card Footer */}
      <div className="md:hidden flex items-center justify-between gap-3 mt-2 flex-wrap  border-gray-100 pt-2  text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3 text-[var(--primary)]" />
          <span>{user.number || "No phone"}</span>
        </div>
        <div className="flex items-center gap-1">
          <ShoppingBag className="w-3 h-3 text-[var(--primary)]" />
          <span>{totalPurchases} items</span>
        </div>
        {user.isBlock ? (
          <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold">
            Blocked
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-semibold">
            Active
          </span>
        )}
      </div>
    </div>
  );
};


// User Detail Modal with Purchase History
const UserModal = ({ user, onClose, onToggleBlock, onDelete, menuItems, loadingHistory }) => {
  const totalPurchases = user.purchaseHistories?.reduce((sum, h) => sum + h.purchaseCount, 0) || 0;
  const uniqueItems = user.purchaseHistories?.length || 0;

  // Calculate total spent (approximate)
  // Calculate total spent (rounded to 2 decimal places)
const totalSpent = Number(
  (
    user.purchaseHistories?.reduce((sum, history) => {
      const item = menuItems[history.menuId];
      return sum + (item?.price || 0) * history.purchaseCount;
    }, 0) || 0
  ).toFixed(2)
);


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-3xl font-bold mb-3 `}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h3>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {user.isBlock ? (
                <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                  Blocked
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full">
                  Active
                </span>
              )}
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                {user.role}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10  bg-green-500 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Total Purchases</p>
                  <p className="text-2xl font-bold text-green-700">{totalPurchases}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Unique Items</p>
                  <p className="text-2xl font-bold text-green-700">{uniqueItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Total Spent</p>
                  <p className="text-2xl font-bold text-green-700">₹{totalSpent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="space-y-3">
            <InfoRow icon={<Mail />} label="Email" value={user.email} />
            <InfoRow icon={<Phone />} label="Phone" value={user.number || 'Not provided'} />
            <InfoRow icon={<MapPin />} label="Address" value={user.address || 'Not provided'} />
            <InfoRow icon={<Users />} label="Gender" value={user.gender} />
          </div>

          {/* Purchase History */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
              Purchase History
            </h3>

            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 text-sm mt-3">Loading purchase history...</p>
              </div>
            ) : !user.purchaseHistories || user.purchaseHistories.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No purchase history yet</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                        <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                        <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {user.purchaseHistories
                        .sort((a, b) => b.purchaseCount - a.purchaseCount)
                        .map((history, index) => {
                          const item = menuItems[history.menuId] || { name: 'Loading...', price: 0 };
                          return (
                            <tr key={index} className="hover:bg-white transition-colors">
                              <td className="py-3 px-4">
                                <p className="font-medium text-gray-800">
                                  {item?.menuName || 'Unknown Item'}
                                </p>
                                <p className="text-xs text-gray-400 italic">
                                  {item?.menuCategory ? `${item.menuCategory} • ${item.menuSubCategory}` : ' '}
                                </p>


                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-semibold">
                                  {history.purchaseCount}×
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-gray-700">
                                ₹{item.price}
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-gray-800">
                                ₹{item.price * history.purchaseCount}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan="3" className="py-3 px-4 text-right font-bold text-gray-800">
                          Grand Total:
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-800 text-lg">
                          ₹{totalSpent}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {/* Block / Unblock Button */}
            <button
              onClick={onToggleBlock}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${user.isBlock
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-green-500 text-white hover:bg-green-600'
                }`}
            >
              <Shield className="w-5 h-5" />
              {user.isBlock ? 'Unblock User' : 'Block User'}
            </button>

            {/* Delete Button (also green-themed) */}
            <button
              onClick={onDelete}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete User
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// Info Row Component
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
    <div className="text-[var(--primary)] mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-0.5 font-medium">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

// Loading Skeleton
const LoadingSkeleton = ({ count = 10 }) => (
  <div className="divide-y divide-gray-100">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="px-6 py-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default AdminUserManagement;
