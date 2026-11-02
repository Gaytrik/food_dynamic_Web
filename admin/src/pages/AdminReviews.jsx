import React, { useState, useEffect } from "react";
import {
  Search,
  Star,
  Package,
  X,
  RefreshCcw,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import {
  AiOutlineDoubleLeft,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineDoubleRight,
} from "react-icons/ai";

const BASE_URL = "http://localhost:8080/api";

const AdminReviews = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const token = localStorage.getItem("token");
useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // smooth scroll for better UX
  });
}, [currentPage]);
  useEffect(() => {
    fetchDishes(0, pageSize);
  }, [pageSize]);

  // ✅ Fetch all dishes once (frontend-only pagination)
  const fetchDishes = async (page = 0, size = pageSize, query = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const url = query
        ? `${BASE_URL}/menu?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
        : `${BASE_URL}/menu?page=${page}&size=${size}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      setDishes(data.content || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      toast.error("Failed to load dishes");
    } finally {
      setLoading(false);
    }
  };

  // Approve review (no reload)
  const handleApprove = async (menuId, review) => {
    try {
      const payload = {
        userID: review.userID,
        reviewText: review.reviewText,
        rating: review.rating,
        isActive: true,
      };

      await axios.put(`${BASE_URL}/reviews/${menuId}/${review.userID}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Review approved successfully!");

      // ✅ Update local state instantly
      setDishes((prevDishes) =>
        prevDishes.map((dish) =>
          dish.id === menuId
            ? {
              ...dish,
              reviews: dish.reviews.map((r) =>
                r.userID === review.userID ? { ...r, isActive: true } : r
              ),
            }
            : dish
        )
      );

      // ✅ Update modal data too
      setSelectedDish((prev) =>
        prev && prev.id === menuId
          ? {
            ...prev,
            reviews: prev.reviews.map((r) =>
              r.userID === review.userID ? { ...r, isActive: true } : r
            ),
          }
          : prev
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve review!");
    }
  };

  const getTotalPendingReviews = (dishes) => {
    return dishes.reduce(
      (count, dish) =>
        count + (dish.reviews?.filter((r) => !r.isActive)?.length || 0),
      0
    );
  };

  // Delete review (no reload)
  const handleDeleteReview = async (menuId, userId) => {
    try {
      await axios.delete(`${BASE_URL}/reviews/${menuId}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Review deleted successfully!");

      // ✅ Update local state instantly
      setDishes((prevDishes) =>
        prevDishes.map((dish) =>
          dish.id === menuId
            ? { ...dish, reviews: dish.reviews.filter((r) => r.userID !== userId) }
            : dish
        )
      );

      // ✅ Update modal data instantly
      setSelectedDish((prev) =>
        prev && prev.id === menuId
          ? { ...prev, reviews: prev.reviews.filter((r) => r.userID !== userId) }
          : prev
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review!");
    }
  };

  const getUserName = async (userId) => {
    if (!userId) return "Unknown User";
    try {
      const res = await axios.get(`${BASE_URL}/auth/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.name || "Unknown User";
    } catch (err) {
      console.error("Error fetching username for", userId, err);
      return "Unknown User";
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDishes(0, pageSize, searchQuery);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const getAverageRating = (reviews) => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + (r?.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const getPendingCount = (reviews) => {
    if (!Array.isArray(reviews)) return 0;
    return reviews.filter((r) => !r?.isActive).length;
  };

  const getApprovedCount = (reviews) => {
    if (!Array.isArray(reviews)) return 0;
    return reviews.filter((r) => r?.isActive).length;
  };

  const resetFilters = () => {
    setSearchQuery("");
    setShowPendingOnly(false);
    fetchDishes(0, pageSize);
  };

  // Prevent background scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = selectedDish ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedDish]);

  return (
    <div className="flex md:mt-0">
      <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="sticky md:top-0 top-14 bg-white p-3 sm:p-3 md:p-3 shadow-sm z-30">
          <div className="flex flex-col gap-3">
            {/* Row 1: Title + Status Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              {/* Title Section */}
              <div className="flex-shrink-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800">
                  Review Management
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                  Manage and monitor customer reviews on dishes
                </p>
              </div>

              {/* Status Filter */}
              <select
                value={showPendingOnly ? "PENDING" : "ALL"}
                onChange={(e) => setShowPendingOnly(e.target.value === "PENDING")}
                className="border-gray-300 border rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 min-w-[120px] sm:min-w-[140px]"
              >
                <option value="ALL">All Reviews</option>
                <option value="PENDING">Pending Only</option>
              </select>
            </div>

            {/* Row 2: All Filters & Actions */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[140px] sm:min-w-[180px]">
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border-gray-300 border rounded-lg text-xs sm:text-sm w-full"
                />
              </div>

              {/* Pending Count Badge */}
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs whitespace-nowrap">
                <span className="font-semibold">{getTotalPendingReviews(dishes)}</span>
                <span className="hidden sm:inline">Pending</span>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs whitespace-nowrap"
              >
                <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-hidden">
          <div className="w-full">
            {loading ? (
              <div className="bg-white shadow-md">
                <LoadingSkeleton count={pageSize} />
              </div>
            ) : dishes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-500 mx-auto my-8 w-4/5 sm:w-2/5 transition-all duration-300">
                <Package className="w-20 h-19 text-gray-300 mb-6" />
                <p className="text-lg font-medium">No dishes found</p>
              </div>
            ) : (
              <>
                {/* ---------------- Desktop Table ---------------- */}
                <div className="hidden md:flex flex-1 overflow-hidden">
                  <div
                    className="bg-white flex flex-col w-full"
                    style={{ height: "calc(68vh)" }}
                  >
                    {loading ? (
                      <LoadingSkeleton count={pageSize} />
                    ) : dishes.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <Package className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No dishes found</p>
                        {(searchQuery || showPendingOnly) && (
                          <button
                            onClick={resetFilters}
                            className="mt-4 px-6 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Table Header */}
                        <div className="sticky top-0 z-20 bg-gray-100 border-gray-200">
                          <div className="grid grid-cols-12 gap-4 pl-8 pr-0 py-3 text-sm font-semibold text-gray-600 uppercase items-center">
                            <div className="col-span-5 ml-16">Dish</div>
                            <div className="col-span-2 text-center">Avg Rating</div>
                            <div className="col-span-2 text-center">Pending</div>
                            <div className="col-span-2 text-center">Approved</div>
                            <div className="col-span-1 text-center">Total</div>
                          </div>
                        </div>

                        {/* Table Body */}
<div className="flex-1 overflow-y-auto divide-y divide-gray-100 pl-8 pr-0 no-scrollbar">
                          {(
                            showPendingOnly
                              ? dishes.filter((d) => d.reviews?.some((r) => r.isActive === false))
                              : dishes
                          ).map((dish) => (
                            <div
                              key={dish.id}
                              onClick={() => setSelectedDish(dish)}
                              className="grid grid-cols-12 gap-4 py-1.5 hover:bg-gray-50 cursor-pointer transition-all duration-100"
                            >
                              {/* Dish Info */}
                              <div className="col-span-5 flex items-center gap-3">
                                <img
                                  src={dish.imageUrl}
                                  alt={dish.menuName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {dish.menuName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {dish.menuCategory}
                                  </p>
                                </div>
                              </div>

                              {/* Avg Rating */}
                             <div className="col-span-2 flex items-center justify-center text-sm text-gray-800">
  <div className="flex items-center justify-center gap-1">
    <Star className="w-4 h-4 text-yellow-400 relative top-[0.5px]" />
    <span className="leading-none">{getAverageRating(dish.reviews)}</span>
  </div>
</div>


                              {/* Pending */}
                              <div className="col-span-2 flex items-center justify-center">
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                  {getPendingCount(dish.reviews)}
                                </span>
                              </div>

                              {/* Approved */}
                              <div className="col-span-2 flex items-center justify-center">
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  {getApprovedCount(dish.reviews)}
                                </span>
                              </div>

                              {/* Total */}
                              <div className="col-span-1 flex items-center justify-center">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                  {dish.reviews?.length || 0}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ---------------- Mobile Cards ---------------- */}
                <div className="block md:hidden md:pt-0 pt-14 grid grid-cols-1">
                  {(
                    showPendingOnly
                      ? dishes.filter((d) => d.reviews?.some((r) => r.isActive === false))
                      : dishes
                  ).map((dish) => (
                    <div
                      key={dish.id}
                      className="bg-white shadow-md border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={dish.imageUrl}
                            alt={dish.menuName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {dish.menuName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {dish.menuCategory}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            <Star className="w-4 h-4 text-yellow-400 inline mr-1" />
                            {getAverageRating(dish.reviews)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          {getPendingCount(dish.reviews)} Pending
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          {getApprovedCount(dish.reviews)} Approved
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                          {dish.reviews?.length || 0} Total
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedDish(dish)}
                          className="text-sm text-green-700 font-medium flex items-center gap-1"
                        >
                          View Reviews
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages >= 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            fetchPage={(page) => fetchDishes(page, pageSize, searchQuery)}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        )}

        {/* Review Modal */}
        {selectedDish && (
          <ReviewModal
            dish={selectedDish}
            onClose={() => setSelectedDish(null)}
            onApprove={handleApprove}
            onDelete={handleDeleteReview}
            getAverageRating={getAverageRating}
            getUserName={getUserName}
          />
        )}
      </div>
    </div>
  );
};

// 🧩 Pagination Component (Same as AdminOrderManagement)
// 🧩 Pagination Component
const Pagination = ({ totalPages, currentPage, fetchPage, pageSize, setPageSize }) => {
  const groupSize = 5;
  const currentGroup = Math.floor(currentPage / groupSize);
  const startPage = currentGroup * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, totalPages);

  return (
    <div
      className="
        bg-white h-14 px-4 w-full flex flex-wrap items-center justify-between z-20 shadow-sm
        sticky top-0 md:sticky md:top-0
        fixed bottom-0 md:relative
      "
      style={{ boxShadow: "0 -1px 4px rgba(0,0,0,0.08)" }}
    >
      <div className="text-sm text-gray-600">
        Page <b>{currentPage + 1}</b> of <b>{totalPages}</b>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 0}
          onClick={() => fetchPage(0, pageSize)}
          className="p-2 rounded-md border hover:bg-gray-100 disabled:opacity-50"
        >
          <AiOutlineDoubleLeft />
        </button>
        <button
          disabled={startPage <= 1}
          onClick={() => fetchPage(startPage - 2, pageSize)}
          className="p-2 rounded-md border hover:bg-gray-100 disabled:opacity-50"
        >
          <AiOutlineLeft />
        </button>

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
          (p) => (
            <button
              key={p}
              onClick={() => fetchPage(p - 1, pageSize)}
              className={`w-8 h-8 rounded-full border text-sm ${
                currentPage + 1 === p
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={endPage >= totalPages}
          onClick={() => fetchPage(endPage, pageSize)}
          className="p-2 rounded-md border hover:bg-gray-100 disabled:opacity-50"
        >
          <AiOutlineRight />
        </button>
        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => fetchPage(totalPages - 1, pageSize)}
          className="p-2 rounded-md border hover:bg-gray-100 disabled:opacity-50"
        >
          <AiOutlineDoubleRight />
        </button>

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="ml-2 border rounded-md px-2 py-1 text-sm"
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
};


const ReviewModal = ({
  dish,
  onClose,
  onApprove,
  onDelete,
  getAverageRating,
  getUserName,
}) => {
  const reviews = Array.isArray(dish.reviews) ? dish.reviews : [];
  const avg = getAverageRating(reviews);
  const [userNames, setUserNames] = useState({});

  // ✅ Load usernames properly and only once
  useEffect(() => {
    const fetchUserNames = async () => {
      const map = {};
      for (const review of reviews) {
        if (review.userID && !map[review.userID]) {
          try {
            const name = await getUserName(review.userID);
            map[review.userID] = name || "Unknown User";
          } catch {
            map[review.userID] = "Unknown User";
          }
        }
      }
      setUserNames(map);
    };
    if (reviews.length > 0) fetchUserNames();
  }, [dish]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Reviews for {dish.menuName}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Dish Summary */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <img
              src={dish.imageUrl}
              alt={dish.menuName}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{dish.menuName}</h3>
              <p className="text-gray-600 text-sm">{dish.menuCategory}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-gray-800">{avg}</span>
                <span className="text-sm text-gray-500">
                  ({reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 py-12">
                <p>No reviews for this dish yet.</p>
              </div>
            ) : (
              reviews.map((review, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${review.isActive
                    ? "bg-white border-gray-200"
                    : "bg-yellow-50 border-yellow-400"
                    }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${review.rating >= s
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-2">{review.reviewText}</p>
                      <p className="text-sm text-gray-500">
                        Reviewed by:{" "}
                        <span className="font-medium text-gray-800">
                          {userNames[review.userID] || "Loading..."}
                        </span>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 shrink-0">
                      {!review.isActive && (
                        <button
                          onClick={() => onApprove(dish.id, review)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-all"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(dish.id, review.userID)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 🧩 Loading Skeleton
const LoadingSkeleton = ({ count }) => (
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

export default AdminReviews;