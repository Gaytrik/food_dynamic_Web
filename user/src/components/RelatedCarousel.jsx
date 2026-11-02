// src/components/RelatedCarousel.jsx
import React from "react";
import ItemCard from "./ItemCard";
import { useNavigate } from "react-router-dom";

const RelatedCarousel = ({ items = [] }) => {
  const navigate = useNavigate();

  if (!items.length) return null;

  return (
    <div className="mt-4 relative ">
      <h2 className="text-3xl px-3 font-bold text-[var(--accent)] mb-8 inline-block pb-1">
        Related Dishes You Might Love
      </h2>

      {/* 🔥 Responsive Grid instead of slider */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((relatedItem) => (
          <div
            key={relatedItem.id}
            className="cursor-pointer transition-transform"
            onClick={() => navigate(`/item/${relatedItem.slug}`)}
          >
            <ItemCard item={relatedItem} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedCarousel;
