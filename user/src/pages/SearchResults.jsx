import React, { useState, useEffect, useRef } from 'react'; 
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Filter, ChevronDown } from 'lucide-react'; 
import { useUniversalSearch } from '../hooks/useUniversalSearch';
import UniversalSearch from '../components/UniversalSearch';
import ItemCard from "../components/ItemCard";

const SearchResults = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const {
        searchResults,
        isSearching,
        performSearch
    } = useUniversalSearch();

    const [sortBy, setSortBy] = useState('relevance');
    const [filterCategory, setFilterCategory] = useState('all');
    
    const [isCategoryOpen, setIsCategoryOpen] = useState(false); 
    const [isSortOpen, setIsSortOpen] = useState(false); 

    const dropdownWrapperRef = useRef(null);

    useEffect(() => {
        if (query) {
            performSearch(query);
        }
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownWrapperRef.current && !dropdownWrapperRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
                setIsSortOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const sortOptions = [
        { value: 'relevance', label: 'Relevance' },
        { value: 'name', label: 'Name A-Z' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
    ];

    const sortedResults = [...searchResults].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return a.menuName.localeCompare(b.menuName);
            default:
                return 0;
        }
    });

    const filteredResults = filterCategory === 'all' 
        ? sortedResults 
        : sortedResults.filter(item => item.menuCategory === filterCategory);

    const categories = [...new Set(searchResults.map(item => item.menuCategory))];
    
    const handleCategorySelect = (category) => {
        setFilterCategory(category);
        setIsCategoryOpen(false);
    };

    const handleSortSelect = (sortVal) => {
        setSortBy(sortVal);
        setIsSortOpen(false);
    };

    const getCurrentSortLabel = () => {
        const option = sortOptions.find(opt => opt.value === sortBy);
        return option ? option.label : 'Relevance'; 
    };
    
    const getCurrentCategoryLabel = () => {
        return filterCategory === 'all' ? 'All Categories' : filterCategory;
    };

    if (isSearching) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-full mx-auto">
                
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Search Results
                    </h1>

                    <div className="w-full lg:max-w-2xl"> 
                        <UniversalSearch placeholder="Search dishes, categories..." />
                    </div>
                </div>

                {query && (
                    <div className="mb-6">
                        <p className="text-gray-600">
                            Showing {filteredResults.length} results for "<strong>{query}</strong>"
                        </p>
                    </div>
                )}

                {/* FILTER + SORT */}
               {/* FILTER + SORT */}
<div 
    ref={dropdownWrapperRef}
    className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm"
>

    {/* CATEGORY DROPDOWN */}
    <div className="relative w-full sm:w-auto">
        
        {/* Label + Icon (Not attached to dropdown box) */}
        <div className="flex items-center gap-2 mb-1">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 font-medium">Category</span>
        </div>

        {/* Category Button */}
        <button
            type="button"
            onClick={() => { 
                setIsCategoryOpen(!isCategoryOpen); 
                setIsSortOpen(false); 
            }}
            className="
                flex justify-between items-center
                border border-gray-300 rounded-lg px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-black focus:border-black
                bg-white w-full
            "
        >
            <span className="truncate">{getCurrentCategoryLabel()}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown List Opens UNDER the Button ONLY */}
        {isCategoryOpen && (
            <div className="
                absolute left-0 top-full mt-1 w-full bg-white rounded-lg shadow-lg border 
                max-h-60 overflow-y-auto z-40
            ">
                <div
                    onClick={() => handleCategorySelect('all')}
                    className={`
                        px-4 py-2 cursor-pointer 
                        ${filterCategory === 'all' ? 'bg-black text-white' : 'hover:bg-gray-100'}
                    `}
                >
                    All Categories
                </div>

                {categories.map(category => (
                    <div
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`
                            px-4 py-2 cursor-pointer capitalize
                            ${filterCategory === category ? 'bg-black text-white' : 'hover:bg-gray-100'}
                        `}
                    >
                        {category}
                    </div>
                ))}
            </div>
        )}
    </div>

    {/* SORT DROPDOWN */}
    <div className="relative w-full sm:w-auto">

        {/* Label — Not part of dropdown box */}
        <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-700 font-medium">Sort By</span>
        </div>

        {/* Sort Button */}
        <button
            type="button"
            onClick={() => { 
                setIsSortOpen(!isSortOpen); 
                setIsCategoryOpen(false);
            }}
            className="
                flex justify-between items-center
                border border-gray-300 rounded-lg px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-black focus:border-black
                bg-white w-full
            "
        >
            <span className="truncate">{getCurrentSortLabel()}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown List */}
        {isSortOpen && (
            <div className="
                absolute left-0 top-full mt-1 w-full bg-white rounded-lg shadow-lg border 
                max-h-60 overflow-y-auto z-40
            ">
                {sortOptions.map(option => (
                    <div
                        key={option.value}
                        onClick={() => handleSortSelect(option.value)}
                        className={`
                            px-4 py-2 cursor-pointer 
                            ${sortBy === option.value ? 'bg-black text-white' : 'hover:bg-gray-100'}
                        `}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
        )}
    </div>

</div>


                {/* RESULTS GRID */}
                {filteredResults.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            No results found
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Try searching with different keywords or browse our menu
                        </p>
                        <Link
                            to="/menu"
                            className="inline-block bg-[var(--primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary)] transition-colors"
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredResults.map((res) => {
                            const cardItem = {
                                name: res.menuName,
                                image: res.imageUrl,
                                price: res.price,
                                description: res.description,
                                slug: (res.menuName || "")
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")
                                    .replace(/[^a-z0-9-]/g, ""),
                                rating: 4.5,
                            };
                            return (
                                <ItemCard key={`${res.id || res.menuItemId || res.menuName}`} item={cardItem} />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
