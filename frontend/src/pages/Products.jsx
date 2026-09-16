import { useState, useEffect, useCallback } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchFilterBar from "../components/SearchFilterBar";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="products-page container">
      {/* Page Header */}
      <div className="products-header">
        <div>
          <h1>Explore Products</h1>
          <p>Discover our curated collection of quality products</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
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
          <div className="spinner-large"></div>
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
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="empty-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <h3>No products found</h3>
          <p>We couldn't find any products matching your current filters.</p>
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
            <span>Showing {products.length} {products.length === 1 ? "product" : "products"}</span>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
