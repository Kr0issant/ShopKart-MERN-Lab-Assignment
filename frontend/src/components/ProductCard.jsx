import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { addToWishlist, removeFromWishlist } from "../services/api";

const ProductCard = ({ product, isWishlisted = false, onWishlistChange }) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const [wishlistState, setWishlistState] = useState(isWishlisted ? "saved" : "idle"); // idle | saving | saved | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setWishlistState(isWishlisted ? "saved" : "idle");
  }, [isWishlisted]);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistState === "saving") return;

    setErrorMessage("");
    setWishlistState("saving");

    try {
      if (wishlistState === "saved") {
        await removeFromWishlist(product._id);
        setWishlistState("idle");
        if (onWishlistChange) onWishlistChange(product._id, false);
      } else {
        await addToWishlist(product._id);
        setWishlistState("saved");
        if (onWishlistChange) onWishlistChange(product._id, true);
      }
    } catch (err) {
      console.error("Wishlist action failed:", err);
      if (err.response?.status === 409) {
        setWishlistState("saved");
      } else {
        setWishlistState("error");
        setErrorMessage(
          err.response?.data?.message || "Unable to save product. Please try again."
        );
        setTimeout(() => {
          setErrorMessage("");
          setWishlistState(isWishlisted ? "saved" : "idle");
        }, 3500);
      }
    }
  };

  return (
    <div className="product-card">
      {/* Product Image Area */}
      <div className="product-card-image-wrapper">
        <Link to={`/products/${product._id}`} className="product-card-image-link" tabIndex="-1">
          <img
            src={product.image}
            alt={product.name}
            className="product-card-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x300?text=Product+Image";
            }}
          />
        </Link>

        {/* Category Pill */}
        <span className="product-card-category">{product.category}</span>

        {/* Floating Heart Button */}
        <button
          type="button"
          className={`product-card-heart-btn ${wishlistState === "saved" ? "active" : ""}`}
          onClick={handleWishlistClick}
          disabled={wishlistState === "saving"}
          title={wishlistState === "saved" ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label={wishlistState === "saved" ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {wishlistState === "saving" ? (
            <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : wishlistState === "saved" ? (
            <svg className="heart-icon heart-icon-filled" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="heart-icon heart-icon-outline" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>
      </div>

      {/* Product Content Body */}
      <div className="product-card-body">
        <Link to={`/products/${product._id}`} className="product-title-link">
          <h3 className="product-card-title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Pricing and Stock Badge */}
        <div className="product-card-meta">
          <div className="price-group">
            <span className="product-currency">₹</span>
            <span className="product-card-price">
              {product.price?.toLocaleString("en-IN")}
            </span>
          </div>

          <span
            className={`product-stock-badge ${
              isOutOfStock ? "stock-out" : isLowStock ? "stock-low" : "stock-in"
            }`}
          >
            <span className="stock-dot" />
            {isOutOfStock
              ? "Out of Stock"
              : isLowStock
              ? `Only ${product.stock} left`
              : "In Stock"}
          </span>
        </div>

        {/* Error Feedback Message if any */}
        {errorMessage && (
          <div className="product-card-error-msg" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions Row */}
        <div className="product-card-actions">
          <Link
            to={`/products/${product._id}`}
            className="btn-card-details full-width"
          >
            <span>View Details</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
