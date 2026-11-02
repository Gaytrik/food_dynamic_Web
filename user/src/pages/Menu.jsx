import React, { useState, useEffect } from "react";
import ItemCard from "../components/ItemCard";
import FilterBar from "../components/FilterBar";
import { useParams } from "react-router-dom";

const Menu = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const { category } = useParams();

  const slugify = (str) =>
    (str || "")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8080/api/menu/all");
        if (!res.ok) throw new Error("Failed to load menu items");
        const data = await res.json();
        
        // ✅ FILTER ONLY AVAILABLE ITEMS
        const availableData = (Array.isArray(data) ? data : []).filter(
          (it) => it.available === true
        );
        
        const normalized = availableData.map((it) => ({
          id: it.id,
          name: it.menuName,
          image: it.imageUrl || "/hero/feature.png",
          price: Math.round(Number(it.price || 0)),
          category: it.menuCategory,
          subcategory: it.menuSubCategory,
          rating: 4.5,
          restaurant: "AadhiJevan",
          description: it.description,
          available: it.available,
        }));
        
        console.log(`✅ Menu: ${normalized.length} available items out of ${data.length} total`);
        setItems(normalized);
        setFiltered(
          category
            ? normalized.filter(
                (it) => slugify(it.category) === slugify(category)
              )
            : normalized
        );
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (category) {
      setFiltered(items.filter((it) => slugify(it.category) === slugify(category)));
    } else {
      setFiltered(items);
    }
  }, [category, items]);

  const handleFilterChange = (category, subcategory) => {
    if (category === "All" && subcategory === "All") {
      setFiltered(items);
      return;
    }

    let filteredData = items;
    if (category !== "All") {
      filteredData = filteredData.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }
    if (subcategory && subcategory !== "All") {
      filteredData = filteredData.filter(
        (item) => item.subcategory?.toLowerCase() === subcategory.toLowerCase()
      );
    }
    setFiltered(filteredData);
  };

  return (
    <section className="bg-gray-50 min-h-screen ">
      {/* ⭐ Hero Section */}
      <div
        className="relative bg-cover bg-center h-96 md:h-[500px]"
        style={{
          backgroundImage: `url('/Images/loginn.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <p className="text-xl font-semibold uppercase  text-[var(--highlight)] mb-2">
              Our Menu
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold">
              Explore Our Delicious{" "}
              <span className="text-[var(--optional-accent)]">Offerings</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto font-light">
              Restaurant quality and the convenience of Tiffin Service, all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* ⭐ Filter Section (Just Below Hero) */}
      <div className="bg-white shadow-md py-4 sticky top-[55px] md:top-[65px] z-40 border-b border-gray-200">
        <div className="max-w-full mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <FilterBar onFilterChange={handleFilterChange} />
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ Menu Items Grid */}
      <div className="pt-10 pb-10 px-4 md:px-8">
        <div className="max-w-full mx-auto">
          <div className="flex-1">
            {loading ? (
              <p className="text-center text-xl text-gray-500 font-medium animate-pulse">
                Loading delicious items...
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-xl text-gray-500 mt-16 font-medium">
                No items found matching your selection. Try a different filter!
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filtered.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;
