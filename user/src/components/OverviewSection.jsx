import React, { useEffect, useState } from "react";
import { CheckCircle, Copy, MapPin, Star, X, Edit, Trash2 } from "lucide-react";
import API from "../api/axiosInstance";
import DialogBox from "./DialogBox";

const OverviewSection = ({ menuId }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedImage, setSelectedImage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, reviewText: "" });
  const [editingReview, setEditingReview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  // Dialog state
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "",
    customMessage: "",
    customTitle: "",
  });

  const openDialog = ({ type = "login", customMessage = "", customTitle = "" }) => {
    setDialog({ isOpen: true, type, customMessage, customTitle });
  };
  const closeDialog = () => setDialog((d) => ({ ...d, isOpen: false }));

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  // ✅ Fetch Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get(`/api/reviews/${menuId}`);
        const reviews = res.data || [];

        // Fetch each user's name using their userId
        const reviewsWithNames = await Promise.all(
          reviews.map(async (review) => {
            try {
              const userRes = await API.get(`/api/auth/user/${review.userID}`);
              const userData = userRes.data;
              return { ...review, userName: userData.name };
            } catch (err) {
              console.warn("Failed to fetch user name for review:", err);
              return { ...review, userName: "User" };
            }
          })
        );

        setReviews(reviewsWithNames);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        openDialog({
          type: "reviewError",
          customMessage: "Failed to load reviews. Please try again later.",
        });
      }
    };

    if (menuId) fetchReviews();
  }, [menuId]);


  const visibleReviews = reviews.filter((r) => r.isActive || r.userID === userId);
  const userAlreadyReviewed = reviews.some((r) => r.userID === userId);

  // ✅ Add Review
  const handleSubmitReview = async () => {
    if (!userId) {
      openDialog({
        type: "notLoggedIn",
        customMessage: "Please login to post a review.",
        customTitle: "Login required",
      });
      return;
    }
    if (!newReview.reviewText.trim()) {
      openDialog({
        type: "validationError",
        customMessage: "Please write a review.",
        customTitle: "Validation",
      });
      return;
    }

    try {
      const payload = { ...newReview, userID: userId, isActive: false };
      await API.post(`/api/reviews/${menuId}`, payload);
      setReviews([...reviews, { ...payload, userName }]);
      setNewReview({ rating: 5, reviewText: "" });
      openDialog({
        type: "reviewSuccess",
        customMessage: "Review added! It will appear after approval.",
        customTitle: "Thank you!",
      });
    } catch (err) {
      const message = err.response?.data || "Failed to add review.";
      openDialog({ type: "reviewError", customMessage: message, customTitle: "Failed to add review" });
    }
  };

  // ✅ Update Review
  const handleUpdateReview = async () => {
    if (!editingReview.reviewText.trim()) {
      openDialog({
        type: "validationError",
        customMessage: "Review cannot be empty.",
        customTitle: "Validation",
      });
      return;
    }
    try {
      const payload = {
        reviewText: editingReview.reviewText,
        rating: editingReview.rating,
        isActive: false,
      };
      await API.put(`/api/reviews/${menuId}/${userId}`, payload);
      setReviews((prev) => prev.map((r) => (r.userID === userId ? { ...r, ...payload } : r)));
      setEditingReview(null);
      openDialog({
        type: "reviewSuccess",
        customMessage: "Review updated! It will appear after approval.",
        customTitle: "Updated",
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        "Failed to update review.";
      openDialog({ type: "reviewError", customMessage: message, customTitle: "Update failed" });
    }
  };

  // ✅ Delete Review
const handleDeleteReview = async () => {
  // Instead of window.confirm, open custom confirmation dialog
  setDialog({
    isOpen: true,
    type: "confirmDelete",
    customTitle: "Delete Review?",
    customMessage: "Are you sure you want to delete your review?",
    onConfirm: async () => {
      try {
        await API.delete(`/api/reviews/${menuId}/${userId}`);
        setReviews((prev) => prev.filter((r) => r.userID !== userId));
        openDialog({
          type: "reviewDeleted",
          customMessage: "Review deleted!",
          customTitle: "Deleted",
        });
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          (typeof err?.response?.data === "string" ? err.response.data : null) ||
          "Failed to delete review.";
        openDialog({
          type: "reviewError",
          customMessage: message,
          customTitle: "Delete failed",
        });
      } finally {
        // close confirm dialog after delete or error
        setDialog((d) => ({ ...d, isOpen: false }));
      }
    },
  });
};


  const handleOpen = (src) => setSelectedImage(src);
  const handleClose = () => setSelectedImage(null);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("Balewadi Highstreet, Pune");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // hide after 2s
  };
  return (
    <div className="max-w-full mx-auto py-4 sm:py-6 text-[var(--accent)]">

      {/* ✅ DialogBox */}
      <DialogBox
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        type={dialog.type}
        customMessage={dialog.customMessage}
        customTitle={dialog.customTitle}
      />

      {/* ✅ Tabs */}
      <div className="flex flex-wrap gap-6 sm:gap-9 border-b border-gray-200 mb-6 sticky top-[60px] bg-white z-40 py-3 sm:py-5">
        {["overview", "reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 capitalize transition-all duration-300 ${activeTab === tab
              ? "text-[var(--primary)] font-semibold border-b-2 border-[var(--primary)]"
              : "text-gray-600 hover:text-[var(--primary)]"
              }`}
          >
            {tab === "overview" ? "Overview" : "Reviews"}
          </button>
        ))}
      </div>

      {/* ---------------- Overview Section ---------------- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-[var(--secondary)]">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                People Say This Place Is Known For
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">
                Huge Place, Staff Behavior, Pocket Friendly, Seating Capacity, Street Food, Sitting Area
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-[var(--secondary)]">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Average Cost</h2>
              <p className="text-gray-700 mt-3 sm:mt-4 font-medium text-sm sm:text-base">
                Cash and Cards accepted
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-[var(--secondary)]">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">More Info</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 sm:gap-y-2 text-gray-700 text-sm sm:text-base">
                {[
                  "Lunch",
                  "Dinner",
                  "Takeaway available",
                  "Vegetarian only",
                  "Indoor seating",
                  "Family friendly",
                ].map((info, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[var(--primary)] rounded-full flex items-center justify-center">
                      <CheckCircle className="text-white w-3.5 h-3.5" />
                    </div>
                    <span>{info}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-[var(--secondary)]">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Menu Cards</h2>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                {["/Images/menuLunch.png", "/Images/menuRice.png"].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => handleOpen(img)}
                    alt=""
                    className="w-[46%] sm:w-[48%] rounded-lg shadow-md object-content cursor-pointer hover:scale-105 transition-transform"
                  />
                ))}
              </div>

              {/* Image Modal */}
              {selectedImage && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-0">
                  <button
                    onClick={handleClose}
                    className="absolute top-5 right-5 text-white bg-black/50 p-2 rounded-full"
                  >
                    <X size={24} />
                  </button>
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-w-full sm:max-w-[90%] max-h-[80vh] rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ✅ Right Sidebar */}
          <div className="border border-gray-300/30 rounded-2xl p-3 sm:p-4 bg-[var(--secondary)] shadow-sm h-fit sticky top-[158px]">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[var(--primary)]">
              Direction
            </h2>

            {/* ✅ Google Map Embed (Fixed visibility) */}
            <div className="w-full overflow-hidden rounded-lg mb-3 aspect-video">
              <iframe
                title="Google Map - Aadhijevan Pune"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.120551419607!2d73.76645307422181!3d18.568603067707176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b94ad21fbddf%3A0x8be41bc8df26614e!2sAadhijevan!5e0!3m2!1sen!2sin!4v1762918800454!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg w-full h-[200px] sm:h-[250px] border-none"
              />

            </div>

            <p className="text-gray-700 text-sm sm:text-base">
              Balewadi Highstreet, Pune
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              {/* ✅ Copy Button with Confirmation */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base hover:bg-gray-100 w-full sm:w-auto justify-center"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* ✅ Direction Button (Google Maps link) */}
              <a
                href="https://maps.app.goo.gl/5eVZGXq48EPEmGQi7"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 border border-[var(--primary)] text-[var(--primary)] rounded-md px-3 py-2 text-sm sm:text-base hover:bg-[var(--primary)] hover:text-white w-full sm:w-auto justify-center transition-all"
              >
                <MapPin className="w-4 h-4" />
                Direction
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Reviews Section */}
      {/* ---------------- Reviews Section ---------------- */}
      {activeTab === "reviews" && (
        <div className="animate-fadeIn">
          <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>

          {/* Add Review */}
          {userId && !editingReview && !userAlreadyReviewed && (
            <div className="bg-gradient-to-br from-[var(--secondary)] to-white border-2 border-[var(--primary)]/20 rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
              <h3 className="text-xl md:text-2xl font-bold mb-6 text-[var(--primary)]">
                Share Your Experience
              </h3>

              <div className="mb-3">
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`${star <= newReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-semibold text-gray-700">
                    {newReview.rating} / 5
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Your Review
                </label>
                <textarea
                  value={newReview.reviewText}
                  onChange={(e) =>
                    setNewReview({ ...newReview, reviewText: e.target.value })
                  }
                  placeholder="Tell us about your experience..."
                  rows="4"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-700 focus:border-[var(--primary)] focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={handleSubmitReview}
                className="bg-[var(--primary)] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold text-base md:text-lg hover:scale-105 transition-all duration-300"
              >
                Submit Review
              </button>
            </div>
          )}

          {/* Edit Review Modal */}
          {editingReview && (
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
              <h3 className="text-xl md:text-2xl font-bold mb-6 text-[var(--primary)]">
                Edit Your Review
              </h3>

              <div className="mb-3">
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setEditingReview({ ...editingReview, rating: star })
                      }
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`${star <= editingReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-semibold text-gray-700">
                    {editingReview.rating} / 5
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Your Review
                </label>
                <textarea
                  value={editingReview.reviewText}
                  onChange={(e) =>
                    setEditingReview({
                      ...editingReview,
                      reviewText: e.target.value,
                    })
                  }
                  rows="4"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-700  focus:outline-none resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUpdateReview}
                  className="bg-[var(--primary)] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold hover:bg-[var(--primary)]/90 transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingReview(null)}
                  className="bg-gray-300 text-gray-700 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reviews Grid with Pagination */}
          {visibleReviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {visibleReviews
                  .slice(
                    (currentPage - 1) * reviewsPerPage,
                    currentPage * reviewsPerPage
                  )
                  .map((r, idx) => (
                    <div
                      key={idx}
                      className={`border-1 p-5 transition-all duration-300 hover:shadow-xl flex flex-col h-full ${r.userID === userId
                        ? "bg-white border-gray-300"
                        : "bg-[var(--secondary)] border-gray-200 hover:border-[var(--primary)]/30"
                        }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {(r.userName || "U")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-base text-gray-800 truncate">
                              {r.userName || "User"}
                            </p>
                            {r.userID === userId && (
                              <span className="text-xs text-[var(--primary)] font-medium">
                                Your Review
                              </span>
                            )}
                          </div>
                        </div>

                        {r.userID === userId && (
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => setEditingReview(r)}
                              className="p-1.5 text-[var(--primary)] hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={handleDeleteReview}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={`${i < r.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                        <span className="ml-1 text-sm font-semibold text-gray-700">
                          {r.rating}.0
                        </span>
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-800 text-sm leading-relaxed mb-3 flex-grow">
                        {r.reviewText}
                      </p>

                      {/* Status Badge */}
                      {/* {r.userID === userId && !r.isActive && (
                        <div className="inline-flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs px-3 py-1.5 rounded-full w-fit">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                          Pending Approval
                        </div>
                      )} */}
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              {visibleReviews.length > reviewsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * reviewsPerPage + 1} to{" "}
                    {Math.min(currentPage * reviewsPerPage, visibleReviews.length)}{" "}
                    of {visibleReviews.length} reviews
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {[...Array(Math.ceil(visibleReviews.length / reviewsPerPage))].map(
                        (_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === i + 1
                              ? "bg-[var(--primary)] text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            {i + 1}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(visibleReviews.length / reviewsPerPage)
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(visibleReviews.length / reviewsPerPage)
                      }
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <Star size={64} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-medium mb-2">
                No reviews yet
              </p>
              <p className="text-gray-400">
                Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      )}
      <DialogBox
  isOpen={dialog.isOpen}
  onClose={() => setDialog({ ...dialog, isOpen: false })}
  type={dialog.type}
  customMessage={dialog.customMessage}
  customTitle={dialog.customTitle}
  onConfirm={dialog.onConfirm}
/>

    </div>
  );
};

export default OverviewSection;