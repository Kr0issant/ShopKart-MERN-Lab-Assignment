import { Link } from "react-router-dom";

const CartItem = ({ item, onUpdateQuantity, onRemove, isMutating }) => {
  const { product, quantity } = item;

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isMaxStock = quantity >= product.stock;
  const itemTotal = (product.price || 0) * quantity;

  const handleDecrease = () => {
    if (quantity > 1 && !isMutating) {
      onUpdateQuantity(product._id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (!isMaxStock && !isMutating) {
      onUpdateQuantity(product._id, quantity + 1);
    }
  };

  const handleRemove = () => {
    if (!isMutating) {
      onRemove(product._id);
    }
  };

  return (
    <div className={`cart-item-card ${isMutating ? "item-mutating" : ""}`}>
      {/* Product Image Thumbnail */}
      <Link to={`/products/${product._id}`} className="cart-item-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/160x160?text=Product";
          }}
        />
      </Link>

      {/* Item Details Info */}
      <div className="cart-item-info">
        <div className="cart-item-header">
          <div>
            <span className="cart-item-category">{product.category}</span>
            <Link to={`/products/${product._id}`} className="cart-item-title-link">
              <h3 className="cart-item-title">{product.name}</h3>
            </Link>
          </div>

          {/* Delete Action Button */}
          <button
            type="button"
            className="cart-item-delete-btn"
            onClick={handleRemove}
            disabled={isMutating}
            title="Remove item from cart"
            aria-label="Remove item"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>

        {/* Unit Price & Stock Note */}
        <div className="cart-item-pricing-row">
          <div className="cart-unit-price">
            <span className="unit-label">Price:</span>
            <span className="unit-value">₹{product.price?.toLocaleString("en-IN")}</span>
          </div>

          {isOutOfStock ? (
            <span className="cart-stock-alert out">Out of Stock</span>
          ) : isMaxStock ? (
            <span className="cart-stock-alert max">Max stock reached ({product.stock})</span>
          ) : (
            <span className="cart-stock-alert available">{product.stock} in stock</span>
          )}
        </div>

        {/* Footer: Quantity Controls & Item Subtotal */}
        <div className="cart-item-footer">
          <div className="cart-quantity-controls">
            <button
              type="button"
              className="qty-btn qty-btn-decrease"
              onClick={handleDecrease}
              disabled={quantity <= 1 || isMutating}
              aria-label="Decrease quantity"
              title={quantity <= 1 ? "Minimum quantity is 1" : "Decrease quantity"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <span className="qty-value-display">
              {isMutating ? (
                <svg className="spin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                quantity
              )}
            </span>

            <button
              type="button"
              className="qty-btn qty-btn-increase"
              onClick={handleIncrease}
              disabled={isMaxStock || isMutating}
              aria-label="Increase quantity"
              title={isMaxStock ? `Only ${product.stock} available in stock` : "Increase quantity"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Item Subtotal Calculation */}
          <div className="cart-item-subtotal">
            <span className="subtotal-label">Subtotal:</span>
            <span className="subtotal-amount">₹{itemTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
