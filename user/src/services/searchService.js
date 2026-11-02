class SearchService {
    constructor() {
        this.baseURL = 'http://localhost:8080/api/menu';
    }

    // Universal search across all menu items
    async searchMenuItems(query) {
        try {
            if (!query || query.trim().length < 2) {
                return { success: true, data: [], message: 'Query too short' };
            }

            const response = await fetch(`${this.baseURL}/all`);
            if (!response.ok) throw new Error('Failed to fetch menu items');

            const allItems = await response.json();

            // ✅ FILTER ONLY AVAILABLE ITEMS FIRST
            const availableItems = allItems.filter(item => item.available === true);

            // Perform client-side search across multiple fields
            const searchTerm = query.toLowerCase().trim();
            const filteredItems = availableItems.filter(item => {
                return (
                    item.menuName?.toLowerCase().includes(searchTerm) ||
                    item.description?.toLowerCase().includes(searchTerm) ||
                    item.menuCategory?.toLowerCase().includes(searchTerm) ||
                    item.menuSubCategory?.toLowerCase().includes(searchTerm) ||
                    item.spiceLevel?.toLowerCase().includes(searchTerm) ||
                    item.preparationTime?.toLowerCase().includes(searchTerm)
                );
            });

            return {
                success: true,
                data: filteredItems,
                message: `Found ${filteredItems.length} items`
            };
        } catch (error) {
            return {
                success: false,
                data: [],
                message: error.message || 'Search failed'
            };
        }
    }

    // Get search suggestions (popular searches, categories)
    async getSearchSuggestions() {
        try {
            const response = await fetch(`${this.baseURL}/all`);
            if (!response.ok) throw new Error('Failed to fetch menu items');

            const allItems = await response.json();

            // ✅ FILTER ONLY AVAILABLE ITEMS
            const availableItems = allItems.filter(item => item.available === true);

            // Extract unique categories and popular items from available items only
            const categories = [...new Set(availableItems.map(item => item.menuCategory).filter(Boolean))];
            const subCategories = [...new Set(availableItems.map(item => item.menuSubCategory).filter(Boolean))];
            const spiceLevels = [...new Set(availableItems.map(item => item.spiceLevel).filter(Boolean))];

            // Popular search terms (you can customize this based on analytics)
            const popularSearches = [
                'spicy', 'mild', 'vegetarian', 'rice', 'sweet'
            ];

            return {
                success: true,
                data: {
                    categories,
                    subCategories,
                    spiceLevels,
                    popularSearches
                }
            };
        } catch (error) {
            return {
                success: false,
                data: { categories: [], subCategories: [], spiceLevels: [], popularSearches: [] }
            };
        }
    }

    // Get recent searches from localStorage
    getRecentSearches() {
        try {
            const recent = localStorage.getItem('recentSearches');
            return recent ? JSON.parse(recent) : [];
        } catch (error) {
            return [];
        }
    }

    // Save search to recent searches
    saveRecentSearch(query) {
        try {
            if (!query || query.trim().length < 2) return;

            let recentSearches = this.getRecentSearches();

            // Remove if already exists
            recentSearches = recentSearches.filter(search => search !== query);

            // Add to beginning
            recentSearches.unshift(query);

            // Keep only last 10 searches
            recentSearches = recentSearches.slice(0, 10);

            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        } catch (error) {
            console.error('Failed to save recent search:', error);
        }
    }

    // Clear recent searches
    clearRecentSearches() {
        try {
            localStorage.removeItem('recentSearches');
        } catch (error) {
            console.error('Failed to clear recent searches:', error);
        }
    }
}

export default new SearchService();