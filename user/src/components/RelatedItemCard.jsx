import React from 'react';
import { useNavigate } from 'react-router-dom';

const RelatedItemCard = ({ item }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // Navigate to the detail page using the item's slug
        navigate(`/item/${item.slug}`); 
    };

    return (
        <div 
            onClick={handleClick}
            className="bg-[var(--secondary)] rounded-xl overflow-hidden shadow-md 
                       hover:shadow-xl transition-shadow duration-300 
                       cursor-pointer group border border-[var(--optional-accent)]/10"
        >
            <div className="h-32 overflow-hidden">
                <img
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400?text=Food'; }}
                />
            </div>
            <div className="p-3 text-center">
                <h3 className="text-md font-semibold text-[var(--accent)] truncate group-hover:text-[var(--primary)] transition-colors duration-300">
                    {item.name}
                </h3>
                <p className="text-sm text-[var(--accent)]/70 mt-1">
                    ₹{item.finalPrice} 
                    {item.discount > 0 && (
                        <span className="ml-2 line-through text-xs text-[var(--accent)]/40">
                            ₹{item.price}
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default RelatedItemCard;
