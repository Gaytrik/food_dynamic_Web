import { useState, useEffect, useCallback } from 'react';
import searchService from '../services/searchService';

export const useUniversalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState({
    categories: [],
    subCategories: [],
    spiceLevels: [],
    popularSearches: []
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const result = await searchService.searchMenuItems(query);
      
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300),
    []
  );

  // Load initial data
  useEffect(() => {
    loadSearchSuggestions();
    loadRecentSearches();
  }, []);

  // Trigger search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const loadSearchSuggestions = async () => {
    const result = await searchService.getSearchSuggestions();
    if (result.success) {
      setSearchSuggestions(result.data);
    }
  };

  const loadRecentSearches = () => {
    const recent = searchService.getRecentSearches();
    setRecentSearches(recent);
  };

  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) return;
    
    setSearchQuery(query);
    setShowSearchResults(true);
    
    // Save to recent searches
    searchService.saveRecentSearch(query);
    loadRecentSearches();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const clearRecentSearches = () => {
    searchService.clearRecentSearches();
    setRecentSearches([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchSuggestions,
    recentSearches,
    showSearchResults,
    setShowSearchResults,
    performSearch,
    clearSearch,
    clearRecentSearches
  };
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}