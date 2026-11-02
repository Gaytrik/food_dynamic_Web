import React, { useState } from 'react'; // ⬅️ NEW: Import useState
import { Edit, MoreVertical, Trash2, Clock3, Flame, ChevronDown, ChevronUp } from "lucide-react"; // ⬅️ NEW: Import Chevron icons
import Pagination from './Pagination';

export default function ItemList({
  operationLoading,
  displayedItems,
  paginatedItems,
  totalPages,
  currentPage,
  setCurrentPage,
  handleAddDish,
  dropdownOpen,
  toggleDropdown,
  handleEditClick,
  toggleStatus,
  deleteConfirm,
  setDeleteConfirm,
  handleDeleteItem,
  // ⬅️ Pagination props
  itemsPerPage,
  setItemsPerPage,
}) {

  // ⬅️ NEW: State to track which item's description is expanded
  const [expandedId, setExpandedId] = useState(null);

  const STATUS_AVAILABLE_COLOR = 'bg-green-500'; // For toggle switch background (available)

  // ⬅️ NEW: Function to toggle the expanded state
  const toggleDescription = (itemId) => {
    setExpandedId(itemId === expandedId ? null : itemId);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">

      {operationLoading && (
        <div className="fixed top-4 right-4 bg-[var(--primary)] text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Processing...
        </div>
      )}

      {displayedItems.length === 0 ? (
        <div className="text-center py-16 bg-[var(--secondary)] rounded-2xl shadow-sm border border-gray-200">
          <div className="text-gray-400 mb-4">No items found in this category</div>
          <button
            onClick={handleAddDish}
            className="text-[var(--primary)] hover:text-[var(--primary)]/90 font-semibold"
          >
            Add your first dish
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedItems.map((item) => {
              // ⬅️ Check if the current item is expanded
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-[var(--secondary)] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 relative flex flex-col" // Added flex flex-col for better layout control
                >
                  {/* IMAGE WITH OVERLAY */}
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={item.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* 3-DOT MENU */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={(e) => toggleDropdown(item.id, e)}
                        className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors shadow-sm"
                      >
                        <MoreVertical size={16} className="text-[var(--accent)]" />
                      </button>

                      {dropdownOpen === item.id && (
                        <div className="absolute right-0 top-10 mt-2 w-40 bg-[var(--secondary)] rounded-lg shadow-xl border border-gray-200 z-50">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="w-full px-4 py-2.5 text-left text-sm text-[var(--accent)] hover:bg-[var(--primary)]/10 flex items-center gap-2 rounded-t-lg"
                          >
                            <Edit size={14} />
                            Edit Item
                          </button>

                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="w-full px-4 py-2.5 text-left text-sm text-[var(--primary)] hover:bg-[var(--primary)]/10 flex items-center gap-2 rounded-b-lg"
                          >
                            <Trash2 size={14} />
                            Delete Item
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 flex flex-col flex-grow"> {/* Added flex-grow */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-[var(--accent)] line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="text-xl text-[var(--dark)] whitespace-nowrap ml-2">
                        ₹{item.price}
                      </span>
                    </div>

                    {/* ⬅️ MODIFIED: Description with conditional line clamp */}
                    <p className={`text-sm text-[var(--accent)]/80 mb-2 leading-relaxed ${isExpanded ? 'line-clamp-none' : 'line-clamp-1'}`}>
                      {item.description}
                    </p>

                    {/* ⬅️ NEW: Read More/Show Less Button */}
                    {/* Note: This is a simple implementation. In a real app, you'd check if the description is actually truncated. */}
                    {item.description && item.description.length > 50 && ( // Simple check for length
                      <button
                        onClick={() => toggleDescription(item.id)}
                        className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary)]/90 flex items-center gap-1 self-start mb-3"
                      >
                        {isExpanded ? (
                          <>
                            Show Less <ChevronUp size={12} />
                          </>
                        ) : (
                          <>
                            Read More <ChevronDown size={12} />
                          </>
                        )}
                      </button>
                    )}


                    {/* Additional Info */}
                    {(item.preparationTime || item.spiceLevel) && (
                      <div className="flex gap-3 mb-3 text-xs mt-auto"> {/* Added mt-auto to push to bottom */}
                        {item.preparationTime && (
                          <span className="flex items-center gap-1 bg-gray-100 text-[var(--accent)] px-2 py-1 rounded border border-gray-200">
                            <Clock3 className="w-3.5 h-3.5 text-[var(--accent)]" />
                            {item.preparationTime}
                          </span>
                        )}
                        {item.spiceLevel && (
                          <span className="flex items-center gap-1 bg-gray-100 text-[var(--accent)] px-2 py-1 rounded border border-gray-200">
                            <Flame className="w-3.5 h-3.5 text-[var(--accent)]" />
                            {item.spiceLevel}
                          </span>
                        )}
                      </div>
                    )}


                    {/* TOGGLE SWITCH */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium text-[var(--accent)]">
                        {item.status === "Available" ? "Available" : "Unavailable"}
                      </span>
                      <button
                        onClick={() => toggleStatus(item.id)}
                        disabled={operationLoading}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${item.status === "Available" ? STATUS_AVAILABLE_COLOR : "bg-gray-300"
                          } ${operationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${item.status === "Available" ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* DELETE CONFIRMATION MODAL */}
                  {deleteConfirm === item.id && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-[var(--secondary)] rounded-xl p-6 mx-4 max-w-sm w-full border border-gray-200">
                        <h3 className="text-lg font-semibold text-[var(--accent)] mb-2">
                          Confirm Delete
                        </h3>
                        <p className="text-[var(--accent)]/80 mb-4">
                          Are you sure you want to delete "{item.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-[var(--accent)] rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={operationLoading}
                            className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
                          >
                            {operationLoading ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Use the new Pagination component */}
          <div className='mt-8 -mb-12'>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={displayedItems.length}
            />
          </div>
        </>
      )}
    </section>
  );
}