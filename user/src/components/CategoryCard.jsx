import React from 'react';

const CategoryCard = ({ category, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative h-72 bg-[var(--secondary)] overflow-hidden
                 shadow-md transition-transform duration-300 transform hover:scale-[1.03]
                 hover:shadow-lg cursor-pointer group"
      style={{ 
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Background Image with Dark Overlay */}
      <img
        src={category.imageUrl}
        alt={category.name}
        className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-[1.05]"
        onError={(e) => { e.target.onerror = null; e.target.src = "/Images/food4.jpg" }}
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent/10"></div>

      {/* Text Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <h2 className="text-3xl font-bold mb-1">{category.name}</h2>
        <p className="text-gray-200 text-sm mb-3">{category.tagline}</p>

        {/* Action Button: Always visible on mobile, hover on desktop */}
        <button className="text-sm font-semibold text-[var(--secondary)] bg-[var(--primary)] 
                           px-4 py-1.5
                           opacity-100 sm:opacity-0 group-hover:opacity-100
                           transition-all duration-300 transform group-hover:translate-y-0 translate-y-0">
          View Menu →
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
