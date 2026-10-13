import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/api";
import WishlistCard from "../components/WishlistCard";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removeError, setRemoveError] = useState("");

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError("");
    setRemoveError("");

    try {
      const res = await getWishlist();
      if (res.success && Array.isArray(res.wishlist)) {
        setWishlist(res.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Unable to load your wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemoveError("");
    try {
      const res = await removeFromWishlist(productId);
      if (res.success) {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setRemoveError(
        err.response?.data?.message || "Failed to remove product from wishlist. Please try again."
      );
      setTimeout(() => setRemoveError(""), 4000);
    }
  };

  return (
    <div className="wishlist-page container">
      {/* Page Header */}
      <div className="wishlist-hero-header">
        <div className="wishlist-hero-info">
          <div className="wishlist-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>My Collection</span>
          </div>
          <h1>My Wishlist</h1>
          <p className="wishlist-subtitle">
            Saved items you love. Compare, decide, and purchase whenever you're ready.
          </p>
        </div>

        {wishlist.length > 0 && !loading && (
          <div className="wishlist-hero-stats">
            <div className="wishlist-count-chip">
              <span className="count-number">{wishlist.length}</span>
              <span className="count-label">{wishlist.length === 1 ? "item saved" : "items saved"}</span>
            </div>
            <Link to="/products" className="btn-continue-shopping">
              <span>Continue Shopping</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Remove Error Alert if any */}
      {removeError && (
        <div className="alert alert-error wishlist-alert" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{removeError}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="wishlist-loading-state">
          <div className="loading-spinner-wrapper">
            <div className="spinner-large" />
          </div>
          <h3>Loading your wishlist...</h3>
          <p>Retrieving your saved items from ShopKart</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="wishlist-error-state">
          <div className="error-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm retry-btn"
            onClick={fetchWishlist}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>Try Again</span>
          </button>
        </div>
      ) : wishlist.length === 0 ? (
        /* Empty State */
        <div className="wishlist-empty-state">
          <div className="empty-heart-radiant-glow">
            <div className="empty-heart-ring outer" />
            <div className="empty-heart-ring inner" />
            <div className="empty-heart-circle">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>

          <h2>Your wishlist is empty</h2>
          <p>
            You haven't saved any items to your wishlist yet. Explore our latest products and tap the heart icon to save what you love.
          </p>

          <Link to="/products" className="btn-browse-hero">
            <span>Browse Products</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="products-grid wishlist-grid">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
