import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "./CategoryCard";

const Explore = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/categories.json")
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setCategories([]);
        setLoading(false);
      });
  }, []);

  const slugify = (str) =>
    (str || "")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleCategoryClick = (cat) => {
    const target = cat?.slug || slugify(cat?.name);
    if (target) navigate(`/menu/${target}`);
  };

  return (
    <section className="bg-[var(--secondary)] py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-full mx-auto">
        <header className="text-center mb-10 relative">
         <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none 
                         transform -translate-y-4 sm:-translate-y-6"
            >
                <span className="mb-4 md:mb-0 text-5xl sm:text-[1rem] md:text-[3rem] lg:text-[6rem] 
                                 font-extrabold text-[var(--gray)] opacity-10">
                    Categories
                </span>
            </div>
       
        <h1
            className="text-3xl sm:text-5xl font-extrabold text-center mb-4 text-[var(--accent)]" 
          >
           Explore Our Categories
          </h1>
        </header>
        <p className="text-center text-gray-500 mb-12 text-lg">
          Discover a world of flavors, perfectly categorized for your convenience.
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin h-12 w-12 border-b-4 border-[var(--primary)]"></div>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onClick={() => handleCategoryClick(cat)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-red-500 text-xl mt-10">
             Could not load categories. Please check categories.json file.
          </p>
        )}
      </div>
    </section>
  );
};

export default Explore;
