import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, BadgePercent } from "lucide-react";

const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Slug creation using item name if slug is not provided
    const slug = item.slug || item.name.toLowerCase().replace(/\s+/g, "-");
    
    // Updated navigation path to use the item slug
    navigate(`/item/${slug}`); 
  };

  const restaurantName = item.name || "Restaurant Name";
  const description = item.description || "Delicious food and great ambiance.";
  const rating = item.rating || 4.4;
  const price = item.price || 500;
  const imageUrl =
    item.image || "https://via.placeholder.com/300x200?text=Restaurant";

  const finalDisplayedPrice = price;

  return (
    <div
      onClick={handleClick}
      className={`group overflow-hidden 
                  transition-all duration-300 cursor-pointer w-full md:max-w-lg mx-auto
                  border border-gray-200 bg-gray-100 
                  hover:bg-white hover:border-gray-200 hover:shadow-lg hover:-translate-y-1`}
    >
      {/* Image Section */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={restaurantName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/300x200?text=Restaurant";
          }}
        />
      </div>

      {/* Text Content Section */}
      <div className="p-4">
        {/* Name and Rating */}
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-xl font-extrabold truncate pr-2 text-gray-800">
            {restaurantName}
          </h2>

          {rating && (
            <div className="flex items-center gap-0.5 bg-green-600 text-white px-2 py-0.5 rounded-md font-bold text-sm flex-shrink-0">
              {rating}
              <Star size={10} className="fill-white text-white" />
            </div>
          )}
        </div>

        {/* Description and Price */}
        <div className="flex justify-between items-center text-sm mt-1">
          <p className="text-gray-500 font-medium truncate pr-2 line-clamp-1">
            {description}
          </p>

          <div className="text-right flex-shrink-0">
            <p className="text-lg leading-none text-gray-800">
              ₹{finalDisplayedPrice.toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
