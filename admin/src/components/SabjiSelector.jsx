import React from "react";
import { Check, X } from "lucide-react";
import { Salad } from 'lucide-react'; // Added Salad icon

const SabjiSelector = ({ allSabjis, selectedSabjis, setSelectedSabjis, mealFilter = "all" }) => {
  const handleSelect = (item) => {
    if (selectedSabjis.find((s) => s.id === item.id)) {
      setSelectedSabjis(selectedSabjis.filter((s) => s.id !== item.id));
    } else {
      setSelectedSabjis([...selectedSabjis, item]);
    }
  };

  // ✅ Normalize and filter using availability array
  const normalized = mealFilter?.toLowerCase();

  const filteredSabjis = allSabjis.filter((item) => {
    if (mealFilter === "all") return true;

    const cat = (item.menuCategory || "").toLowerCase().trim();
    return cat === mealFilter;   // lunch → only lunch | dinner → only dinner
  });


  return (
    <div className="bg-white rounded-xl mb-8">
      <h3 className="font-bold text-xl mb-4 text-[var(--accent)] flex items-center gap-2 border-b border-gray-100 pb-2">
        <Salad className="w-6 h-6 text-[var(--primary)]" /> Available Sabjis ({selectedSabjis.length} Selected)
      </h3>

      {/* Sabji Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredSabjis.map((item) => {
           const isSelected = selectedSabjis.find((s) => s.id === item.id);
           return (
             // FIX 1: Set card as flex-col and justify-between
             <div
               key={item.id}
               className={`relative border rounded-xl p-3 cursor-pointer transition-all shadow-sm flex flex-col justify-between ${
                 isSelected
                   ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]"
                   : "border-gray-200 hover:border-[var(--primary)]/50 hover:bg-gray-50"
               }`}
               onClick={() => handleSelect(item)}
             >
               {isSelected && (
                 <div className="absolute top-2 right-2 bg-[var(--primary)] text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10">
                   <Check size={14} />
                 </div>
               )}
               
               {/* Image */}
               <img
                 src={item.imageUrl || "/hero/feature.png"}
                 alt={item.menuName}
                 className="w-full h-28 object-cover rounded-lg mb-2"
                 onError={(e) => (e.target.src = "/hero/feature.png")}
               />

               {/* FIX 2: Create a wrapper for title and price, use flex-grow to push price to bottom. */}
               <div className="flex flex-col flex-grow justify-end">
                  <h4 className="font-semibold text-sm text-[var(--accent)]">
                    {/* Removed line-clamp-2 to allow full title to show */}
                    {item.menuName}
                  </h4>
                  <p className="text-[var(--dark)] text-sm mt-1">
                    ₹{item.price}
                  </p>
               </div>
             </div>
           );
         })}

        {/* Optional: empty state */}
        {filteredSabjis.length === 0 && (
          <div className="col-span-full text-sm text-gray-500 p-6 text-center">
            No items found for {mealFilter}.
          </div>
        )}
      </div>
    </div>
  );
};

export default SabjiSelector;