import React from "react";
import { Plus } from "lucide-react";

export default function MenuHeader({
  handleAddDish,
  itemCounts,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 mb-6 md:mb-8">
      {/* 🔹 TOP ROW — Heading, Search Bar, Add Button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* LEFT: Heading */}
        <div className="flex flex-col w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--accent)]">
            Menu Management
          </h1>
        </div>

        {/* MIDDLE: Search Bar */}
        <div className="flex-1 w-full md:max-w-xs relative order-3 md:order-none">
          <input
            type="text"
            placeholder="Search dishes, categories, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 sm:py-3 pl-10 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm sm:text-base text-[var(--accent)] placeholder-gray-500 shadow-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* RIGHT: Add Button */}
        <button
          onClick={handleAddDish}
          className="flex items-center gap-2 sm:gap-3 px-4 sm:px-3 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white text-sm sm:text-base font-semibold bg-[var(--primary)] hover:bg-[var(--primary)]/90 transform hover:-translate-y-0.5 w-full md:w-auto justify-center"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" /> <span>Add New Dish</span>
        </button>
      </div>

      {/* 🔹 SECOND ROW — Description & Item Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-2">
        <p className="text-sm sm:text-base text-[var(--accent)]/80">
          Manage your restaurant menu items and availability
        </p>

        {itemCounts && (
          <div className="text-xs sm:text-sm text-[var(--accent)]/70 text-left sm:text-right flex flex-wrap gap-x-2 gap-y-1">
            <span>
              <span className="text-green-600 font-semibold">
                {itemCounts.available}
              </span>{" "}
              Available
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              <span className="text-red-600 font-semibold">
                {itemCounts.unavailable}
              </span>{" "}
              Unavailable
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              <span className="text-[var(--primary)] font-semibold">
                {itemCounts.total}
              </span>{" "}
              Total
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
