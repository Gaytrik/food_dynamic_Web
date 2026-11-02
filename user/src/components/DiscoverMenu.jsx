import React, { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DiscoverMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleClick = (item) => {
    const slug = item.slug || item.title.toLowerCase().replace(/\s+/g, "-");
    navigate(`/item/${slug}`);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Note: Using hardcoded fetch URL. Consider updating to use API.get if applicable.
        const res = await fetch("http://localhost:8080/api/menu/all"); 
        if (!res.ok) throw new Error("Failed to load menu items");
        const data = await res.json();

        // ✅ FILTER ONLY AVAILABLE ITEMS
        const availableData = (Array.isArray(data) ? data : []).filter(
          (it) => it.available === true
        );

        const normalized = availableData.map((it) => ({
          id: it.id,
          title: it.menuName,
          description: it.description,
          price: `₹${Math.round(Number(it.price)).toLocaleString("en-IN")}`,
          image: it.imageUrl || "/hero/feature.png",
        }));

        // Take 6 items (index 9 to 15 gives 6 items)
        setMenuItems(normalized.slice(77, 83)); 
      } catch (e) {
        console.error(e);
        setError("Failed to load menu items.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section 
      className="w-full min-h-screen px-4 md:px-8 py-14 bg-[var(--secondary)] text-[var(--accent)]"
    >
      <div className="max-w-full mx-auto">
        {/* Header */}
        <header className="text-center mb-6 relative">
         <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none 
                         transform -translate-y-4 sm:-translate-y-6"
            >
                <span className="mb-6 md:mb-0 text-5xl sm:text-[1rem] md:text-[3rem] lg:text-[6rem] 
                                 font-extrabold text-[var(--gray)] opacity-10 leading-none tracking-widest">
                    Discover Menu
                </span>
            </div>
         
           <h1
            className="text-3xl sm:text-5xl font-extrabold text-center mb-2"
            style={{ color: "var(--accent)" }}
          >
           Discover Our Full Menu
          </h1>
          
        </header>

        {/* --- Content Area --- */}
        {loading ? (
          <p className="text-center text-xl text-[var(--gray)]">Loading the full menu list...</p>
        ) : error ? (
          <p className="text-center text-xl text-red-600 font-semibold">{error}</p>
        ) : (
          // Grid layout remains 3 columns for 6 items (3x2)
          <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-10 pb-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                // Added border and hover shadow for a card-like effect
                className="text-center p-2 transition-all duration-300 cursor-pointer group 
                           hover:shadow-3xl hover:shadow-gray-200 border-1 border-[var(--gray)]/20 rounded-xl"
              >
                {/*  Updated Circular Image Container */}
                <div className="w-full h-auto flex justify-center items-center mb-2">
                  {/* Outer circle for primary color accent */}
                  <div className="p-1 sm:p-2 rounded-full border-2 border-[var(--gray)]/50 transition-all duration-300 group-hover:p-0.5">
                    {/* Inner container: Reduced size, removed unnecessary borders, added zoom on hover */}
                    <div className="w-64 h-64 mx-auto overflow-hidden rounded-full shadow-xl aspect-square">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.1]"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="p-2">
                  <h2 className="text-3xl font-extrabold text-[var(--accent)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-base text-[var(--gray)] mb-3 font-light italic leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                  
                  {/* Price and Action */}
                  <div className="mt-2 flex flex-col items-center">
                    <p className="text-2xl text-[var(--accent)]">
                      {item.price}
                    </p>
                    
                    {/* Optional: Add Button for a clean CTA, non-functional here but shows intent
                    <button
                      className="mt-4 px-6 py-2 text-white font-semibold rounded-full shadow-lg transition-all duration-300 opacity-80
                                 hover:opacity-100 hover:shadow-xl hover:-translate-y-0.5"
                      style={{ backgroundColor: 'var(--primary)' }}
                      onClick={(e) => {
                          e.stopPropagation(); 
                          // You can add an actual "Add to Cart" function here later
                          console.log(`Adding ${item.title} to cart.`);
                      }}
                    >
                      <FaShoppingCart className="inline mr-2" size={16} /> Order Now
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </main>
        )}
      </div>
    </section>
  );
};

export default DiscoverMenu;