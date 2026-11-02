import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, Tag, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUniversalSearch } from '../hooks/useUniversalSearch';

const UniversalSearch = ({ className = '', placeholder = "Search dishes, categories..." }) => {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchSuggestions,
    recentSearches,
    performSearch,
    clearSearch,
    clearRecentSearches
  } = useUniversalSearch();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    performSearch(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setIsOpen(false);
  };

  const handleResultClick = (item) => {
    const slug = (item.menuName || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') || `item-${item.id}`;
    navigate(`/item/${slug}`);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--gray)] w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full 
              focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]
              bg-[var(--secondary)] text-[var(--accent)] shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                clearSearch();
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--gray)] hover:text-[var(--accent)]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--secondary)] border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isSearching && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)] mx-auto"></div>
              <p className="text-[var(--gray)] text-sm mt-2">Searching...</p>
            </div>
          )}

          {/* Search Results */}
          {!isSearching && searchQuery && searchResults.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--accent)]">
                <Search className="w-4 h-4 text-[var(--gray)]" />
                Search Results ({searchResults.length})
              </div>
              {searchResults.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleResultClick(item)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--primary)]/10 rounded-lg text-left transition"
                >
                  <img
                    src={item.imageUrl || "/hero/feature.png"}
                    alt={item.menuName}
                    className="w-10 h-10 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "/hero/feature.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--accent)] truncate">{item.menuName}</p>
                    <div className="flex items-center gap-2 text-sm text-[var(--gray)]">
                      <span className="capitalize">{item.menuCategory}</span>
                      <span>•</span>
                      <span className="font-medium text-[var(--primary)]">₹{item.price}</span>
                    </div>
                  </div>
                </button>
              ))}
              {searchResults.length > 5 && (
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-center text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg text-sm font-medium transition"
                >
                  View all {searchResults.length} results
                </button>
              )}
            </div>
          )}

          {/* No Results */}
          {!isSearching && searchQuery && searchResults.length === 0 && (
            <div className="p-4 text-center">
              <ChefHat className="w-8 h-8 text-[var(--gray)] mx-auto mb-2" />
              <p className="text-[var(--gray)]">No dishes found for "{searchQuery}"</p>
              <p className="text-[var(--gray)] text-sm">Try searching for categories or ingredients</p>
            </div>
          )}

          {/* Recent Searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                  <Clock className="w-4 h-4 text-[var(--gray)]" />
                  Recent Searches
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-[var(--gray)] hover:text-[var(--accent)]"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--primary)]/10 rounded-lg text-left transition"
                >
                  <Clock className="w-4 h-4 text-[var(--gray)]" />
                  <span className="text-[var(--accent)]">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!searchQuery && searchSuggestions.popularSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--accent)]">
                <TrendingUp className="w-4 h-4 text-[var(--gray)]" />
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-2 px-3 py-2">
                {searchSuggestions.popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="px-3 py-1 bg-[var(--secondary)] hover:bg-[var(--primary)]/10 rounded-full text-sm text-[var(--accent)] border border-gray-200 hover:border-[var(--primary)] transition"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {!searchQuery && searchSuggestions.categories.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--accent)]">
                <Tag className="w-4 h-4 text-[var(--gray)]" />
                Browse Categories
              </div>
              {searchSuggestions.categories.slice(0, 6).map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(category)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--primary)]/10 rounded-lg text-left transition"
                >
                  <Tag className="w-4 h-4 text-[var(--gray)]" />
                  <span className="text-[var(--accent)] capitalize">{category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;
