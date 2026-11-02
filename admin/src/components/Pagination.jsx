import React from "react";
import {
  AiOutlineDoubleLeft,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineDoubleRight,
} from "react-icons/ai";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  className = "",
  itemsPerPageOptions = [10, 20, 50],
  dialogOpen = false,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const maxVisible = 5; // how many page numbers you want to show
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);

    // shift window if near the end
    const adjustedStart = Math.max(1, end - maxVisible + 1);

    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  };


  const visiblePages = getVisiblePages();

  // Calculate visible item count (e.g., showing 10 of 28)
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
    className={`fixed bottom-0 md:left-[260px] left-0 md:w-[calc(100%-260px)] w-full    px-4 sm:px-2 z-40 transition-all duration-300
    ${className}`}
  >
    <div
      className={`max-w-7xl mx-auto flex flex-col sm:flex-row px-4 items-center py-2 justify-between gap-2 sm:gap-0 flex-wrap bg-[var(--secondary)]/90 backdrop-blur-sm 
        ${dialogOpen ? "blur-md pointer-events-none" : ""}`}
    > {/* LEFT SIDE — PAGE SUMMARY */}
        <div className="text-sm text-[var(--accent)] font-medium">
          Page {currentPage} of {totalPages} — Showing {endItem} of {totalItems} items
        </div>

        {/* RIGHT SIDE — PAGINATION CONTROLS */}
        <div className="flex items-center space-x-1.5">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-md text-[var(--accent)] bg-[var(--secondary)]
              disabled:opacity-50 hover:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            <AiOutlineDoubleLeft className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-md text-[var(--accent)] bg-[var(--secondary)]
              disabled:opacity-50 hover:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            <AiOutlineLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`w-9 h-9 border border-gray-300 rounded-full text-sm font-semibold transition-colors
                ${currentPage === pageNumber
                  ? "bg-[var(--primary)] text-[var(--secondary)] border-[var(--primary)]"
                  : "bg-[var(--secondary)] text-[var(--accent)] hover:bg-gray-100"
                }`}
            >
              {pageNumber}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-md text-[var(--accent)] bg-[var(--secondary)]
              disabled:opacity-50 hover:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            <AiOutlineRight className="w-4 h-4" />
          </button>

          {/* Last */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-md text-[var(--accent)] bg-[var(--secondary)]
              disabled:opacity-50 hover:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            <AiOutlineDoubleRight className="w-4 h-4" />
          </button>


        </div>
      </div>
    </div>
  );
};

export default Pagination;
