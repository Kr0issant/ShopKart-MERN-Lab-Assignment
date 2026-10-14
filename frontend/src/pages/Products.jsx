import { useState, useEffect, useCallback } from "react";
import { getProducts, getWishlist } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchFilterBar from "../components/SearchFilterBar";

const CATEGORY_TABS = [
  { id: "All Categories", label: "All Items", icon: "grid" },
  { id: "Electronics", label: "Electronics", icon: "tech" },
  { id: "Fashion", label: "Fashion", icon: "fashion" },
  { id: "Books", label: "Books", icon: "book" },
  { id: "Home", label: "Home", icon: "home" },
  { id: "Beauty", label: "Beauty", icon: "sparkle" },
  { id: "Sports", label: "Sports", icon: "sports" }
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (category && category !== "All Categories") {
        params.category = category;
      }
      if (sort) {
        params.sort = sort;
      }

      const res = await getProducts(params);
      if (res.success && Array.isArray(res.products)) {
        setProducts(res.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Something went wrong while loading products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, sort]);

  // Load wishlist IDs to initialize card states
  useEffect(() => {
    const fetchUserWishlist = async () => {
      try {
        const res = await getWishlist();
        if (res.success && Array.isArray(res.wishlist)) {
          setWishlistIds(new Set(res.wishlist.map((p) => p._id || p)));
        }
      } catch {
        // silent fail
      }
    };
    fetchUserWishlist();
  }, []);

  const handleWishlistChange = (productId, saved) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  // Debounce search/filter query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategory("All Categories");
    setSort("");
  };

  const renderCategoryIcon = (icon) => {
    switch (icon) {
      case "tech":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      case "fashion":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
          </svg>
        );
      case "book":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        );
      case "home":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case "sparkle":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case "sports":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        );
      case "grid":
      default:
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        );
    }
  };

  return (
    <div className="products-page container">
      {/* Editorial Catalog Header */}
      <div className="catalog-editorial-header">
        <div className="editorial-eyebrow">
          <span className="eyebrow-pill">CATALOGUE</span>
          <span className="eyebrow-dot">•</span>
          <span className="eyebrow-count">
            {loading ? "Updating..." : `${products.length} ${products.length === 1 ? "Product" : "Products"}`}
          </span>
        </div>
        <div className="editorial-title-row">
          <h1 className="editorial-main-title">All Products</h1>
          <p className="editorial-main-subtitle">
            Explore quality essentials across curated departments with real-time stock and transparent pricing.
          </p>
        </div>
      </div>

      {/* Category Quick Pills */}
      <div className="category-pills-bar">
        {CATEGORY_TABS.map((tab) => {
          const isActive = category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`category-pill-btn ${isActive ? "active" : ""}`}
              onClick={() => setCategory(tab.id)}
            >
              <span className="pill-icon">{renderCategoryIcon(tab.icon)}</span>
              <span className="pill-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <SearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        onReset={handleResetFilters}
      />

      {/* Content States */}
      {loading ? (
        <div className="products-loading">
          <div className="spinner-large" />
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="products-error">
          <div className="alert alert-error">{error}</div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={fetchProducts}
          >
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="products-empty">
          <div className="empty-icon-circle">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
          <h3>No products match your search</h3>
          <p>Try adjusting your search keywords, clearing categories, or resetting filters.</p>
          {(searchTerm || category !== "All Categories" || sort) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="products-count-bar">
            <div className="count-stats">
              <span className="count-number">{products.length}</span>
              <span className="count-label">
                {products.length === 1 ? "Product Found" : "Products Found"}
              </span>
              {category !== "All Categories" && (
                <span className="active-cat-tag">in {category}</span>
              )}
            </div>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isWishlisted={wishlistIds.has(product._id)}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
