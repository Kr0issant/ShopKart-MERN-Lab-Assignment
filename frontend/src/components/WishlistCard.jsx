import { useState } from "react";
import { Link } from "react-router-dom";

const WishlistCard = ({ product, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await onRemove(product._id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className={`product-card wishlist-card ${isRemoving ? "card-removing" : ""}`}>
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

        {/* Actions Row */}
        <div className="product-card-actions">
          <Link
            to={`/products/${product._id}`}
            className="btn-card-details"
          >
            <span>View Details</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <button
            type="button"
            className="btn-card-remove"
            onClick={handleRemove}
            disabled={isRemoving}
            title="Remove from Wishlist"
          >
            {isRemoving ? (
              <>
                <svg className="spin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Removing...</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
