import React from 'react';

const STATUS_AVAILABLE_COLOR = 'bg-green-500';

export default function MenuSidebar({
  mainCategories,
  activeMain,
  setActiveMain,
  activeSub,
  setActiveSub,
  menu,
  getAvailableSubcategories,
  formatSubcategoryName,
  toggleSubcategoryStatus,
  isSubcategoryAvailable,
  operationLoading
}) {
  const handleToggleClick = (e, mainCategory, subCategory) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSubcategoryStatus(mainCategory, subCategory);
  };

  return (
    <>
      {/* MAIN CATEGORY TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 sm:mb-6">
        <div className="bg-[var(--secondary)] rounded-xl sm:rounded-2xl shadow-sm p-1.5 sm:p-2 flex flex-wrap gap-1.5 sm:gap-2 border border-gray-200 overflow-x-auto">
          {mainCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveMain(cat);
                setActiveSub("all");
              }}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 whitespace-nowrap ${activeMain === cat
                ? "bg-[var(--primary)] text-white shadow-md"
                : "text-[var(--accent)] hover:text-[var(--primary)] hover:bg-gray-50 border border-gray-200"
                }`}
            >
              {cat === "all" ? "All Items" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* SUB CATEGORY BUTTONS */}
      {activeMain !== "all" && menu[activeMain] && getAvailableSubcategories().length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="relative flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => setActiveSub("all")}
                className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-medium transition-all duration-300 whitespace-nowrap ${activeSub === "all"
                  ? "bg-[var(--primary)] text-white border border-[var(--primary)]"
                  : "bg-[var(--secondary)] text-[var(--accent)] hover:text-[var(--primary)] border border-gray-200 hover:border-[var(--primary)]"
                  }`}
              >
                All {menu[activeMain].name}
              </button>
              <button
                onClick={(e) => handleToggleClick(e, activeMain, "all")}
                disabled={operationLoading}
                className={`relative inline-flex items-center h-5 w-9 sm:h-6 sm:w-11 rounded-full transition-colors duration-300 flex-shrink-0 ${isSubcategoryAvailable(activeMain, "all") ? STATUS_AVAILABLE_COLOR : "bg-gray-300"
                  } ${operationLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={isSubcategoryAvailable(activeMain, "all") ? "Available - Click to make unavailable" : "Unavailable - Click to make available"}
              >
                <span
                  className={`inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 transform bg-white rounded-full transition-transform duration-300 ${isSubcategoryAvailable(activeMain, "all") ? "translate-x-4 sm:translate-x-6" : "translate-x-0.5 sm:translate-x-1"
                    }`}
                />
              </button>
            </div>

            {getAvailableSubcategories().map((subKey) => {
              const isAvailable = isSubcategoryAvailable(activeMain, subKey);
              return (
                <div key={subKey} className="relative flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => setActiveSub(subKey)}
                    className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-medium transition-all duration-300 whitespace-nowrap ${activeSub === subKey
                      ? "bg-[var(--primary)] text-white border border-[var(--primary)]"
                      : "bg-[var(--secondary)] text-[var(--accent)] hover:text-[var(--primary)] border border-gray-200 hover:border-[var(--primary)]"
                      }`}
                  >
                    {formatSubcategoryName(subKey)}
                  </button>
                  <button
                    onClick={(e) => handleToggleClick(e, activeMain, subKey)}
                    disabled={operationLoading}
                    className={`relative inline-flex items-center h-5 w-9 sm:h-6 sm:w-11 rounded-full transition-colors duration-300 flex-shrink-0 ${isAvailable ? STATUS_AVAILABLE_COLOR : "bg-gray-300"
                      } ${operationLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={isAvailable ? "Available - Click to make unavailable" : "Unavailable - Click to make available"}
                  >
                    <span
                      className={`inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 transform bg-white rounded-full transition-transform duration-300 ${isAvailable ? "translate-x-4 sm:translate-x-6" : "translate-x-0.5 sm:translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}