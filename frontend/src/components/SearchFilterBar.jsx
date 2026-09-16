const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Books",
  "Home",
  "Beauty",
  "Sports",
];

const SearchFilterBar = ({
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  sort,
  setSort,
  onReset,
}) => {
  const isFiltered = searchTerm || category !== "All Categories" || sort !== "";

  return (
    <div className="search-filter-bar">
      {/* Search Input */}
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Controls Group */}
      <div className="filter-controls-group">
        {/* Category Dropdown */}
        <div className="select-wrapper">
          <select
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown (Bonus feature) */}
        <div className="select-wrapper">
          <select
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Sort by: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Reset Filters */}
        {isFiltered && (
          <button
            type="button"
            className="btn btn-secondary btn-sm reset-filter-btn"
            onClick={onReset}
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;
