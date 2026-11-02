import React from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UniversalSearch from './UniversalSearch';

const QuickSearch = () => {
  const navigate = useNavigate();

  const popularSearches = ['Vegetarian', 'Spicy', 'Desserts', 'Rice', 'Naan', 'Paneer'];

  const handlePopularSearch = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Search className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--accent)] mb-4">
            What are you craving today?
          </h2>
          <p className="text-[var(--gray)] text-lg max-w-2xl mx-auto">
            Search through our delicious menu and find your perfect meal
          </p>
        </div>

        {/* Main Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <UniversalSearch
            placeholder="Search for dishes, categories, or ingredients..."
            className="w-full"
          />
        </div>

        {/* Popular Searches */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[var(--gray)]" />
            <span className="text-[var(--gray)] font-medium">Popular Searches</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {popularSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => handlePopularSearch(term)}
                className="px-4 py-2 bg-[var(--secondary)] border border-gray-200 rounded-full text-[var(--accent)] 
                hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]
                transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--primary)] mb-2">50+</div>
            <div className="text-[var(--gray)] text-sm">Delicious Dishes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--primary)] mb-2">10+</div>
            <div className="text-[var(--gray)] text-sm">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--primary)] mb-2">4.8★</div>
            <div className="text-[var(--gray)] text-sm">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--primary)] mb-2">30min</div>
            <div className="text-[var(--gray)] text-sm">Avg Delivery</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickSearch;
