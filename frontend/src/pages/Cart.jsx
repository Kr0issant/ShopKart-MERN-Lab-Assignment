import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

const Cart = () => {
  const {
    cartItems,
    loading,
    error,
    mutatingItemId,
    totalUnits,
    subtotal,
    updateQuantity,
    removeFromCart,
    refreshCart
  } = useCart();

  const [actionError, setActionError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const handleUpdateQuantity = async (productId, newQuantity) => {
    setActionError("");
    try {
      await updateQuantity(productId, newQuantity);
    } catch (err) {
      console.error("Error updating quantity:", err);
      setActionError(
        err.response?.data?.message || "Failed to update quantity. Please try again."
      );
      setTimeout(() => setActionError(""), 4500);
    }
  };

  const handleRemove = async (productId) => {
    setActionError("");
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error("Error removing item:", err);
      setActionError(
        err.response?.data?.message || "Failed to remove item from cart. Please try again."
      );
      setTimeout(() => setActionError(""), 4500);
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (code === "SHOPKART10" || code === "WELCOME10" || code === "SAVE10") {
      setAppliedCoupon({ code, discountPercent: 10 });
      setCouponCode("");
    } else if (code === "PREMIER20") {
      setAppliedCoupon({ code, discountPercent: 20 });
      setCouponCode("");
    } else {
      setCouponError("Invalid or expired promo code");
      setTimeout(() => setCouponError(""), 3500);
    }
  };

  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="cart-page container">
      {/* 3-Step Checkout Milestone Breadcrumb */}
      <div className="checkout-step-progress">
        <div className="step-node active">
          <div className="step-circle">1</div>
          <span className="step-label">Shopping Bag</span>
        </div>
        <div className="step-connector" />
        <div className="step-node">
          <div className="step-circle">2</div>
          <span className="step-label">Shipping &amp; Payment</span>
        </div>
        <div className="step-connector" />
        <div className="step-node">
          <div className="step-circle">3</div>
          <span className="step-label">Confirmation</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="cart-hero-header">
        <div className="cart-hero-info">
          <h1>My Cart</h1>
          <p className="cart-subtitle">
            Review your chosen items, adjust quantities, and proceed to secure checkout.
          </p>
        </div>

        {cartItems.length > 0 && !loading && (
          <div className="cart-header-actions">
            <Link to="/products" className="btn-continue-shopping">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Continue Shopping</span>
            </Link>
          </div>
        )}
      </div>

      {/* Free Shipping Milestone Notice */}
      {cartItems.length > 0 && !loading && (
        <div className="free-shipping-milestone-banner">
          <div className="milestone-content">
            <div className="milestone-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div className="milestone-info">
              <span className="milestone-text">
                <strong>Free Standard Delivery Unlocked!</strong> Your order qualifies for zero shipping fees.
              </span>
            </div>
          </div>
          <div className="milestone-bar-outer">
            <div className="milestone-bar-inner" style={{ width: "100%" }} />
          </div>
        </div>
      )}

      {/* Mutation Error Alert if any */}
      {actionError && (
        <div className="alert alert-error cart-alert" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{actionError}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="cart-loading-state">
          <div className="spinner-large" />
          <h3>Loading your cart...</h3>
          <p>Retrieving your saved bag items</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="cart-error-state">
          <div className="cart-error-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Unable to load your cart</h3>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm retry-btn"
            onClick={refreshCart}
          >
            Try Again
          </button>
        </div>
      ) : cartItems.length === 0 ? (
        /* Empty State */
        <div className="cart-empty-state">
          <div className="cart-empty-radiant-glow">
            <div className="cart-empty-ring outer" />
            <div className="cart-empty-ring inner" />
            <div className="cart-empty-circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
          </div>
          <h2>Your cart is currently empty</h2>
          <p>
            Explore our curated catalog of electronics, lifestyle apparel, and accessories to find something you love.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      ) : (
        /* Populated 2-Column Cart Layout */
        <div className="cart-layout">
          {/* Left Column: Cart Items List */}
          <div className="cart-items-column">
            <div className="cart-items-count-banner">
              <span>
                {totalUnits} {totalUnits === 1 ? "item" : "items"} in your shopping bag
              </span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                if (!item.product) return null;
                return (
                  <CartItem
                    key={item.product._id}
                    item={item}
                    isMutating={mutatingItemId === item.product._id}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                  />
                );
              })}
            </div>
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="cart-summary-column">
            <div className="order-summary-card">
              <h2 className="summary-title">Order Summary</h2>

              {/* Promo Code Box */}
              <div className="cart-promo-section">
                <form onSubmit={handleApplyCoupon} className="promo-form">
                  <input
                    type="text"
                    placeholder="Enter promo code (e.g. SAVE10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="promo-input"
                  />
                  <button type="submit" className="btn-promo-apply">
                    Apply
                  </button>
                </form>
                {couponError && <span className="promo-error-msg">{couponError}</span>}
                {appliedCoupon && (
                  <div className="applied-coupon-tag">
                    <span className="coupon-tag-text">
                      🎉 <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountPercent}% OFF)
                    </span>
                    <button
                      type="button"
                      className="btn-remove-coupon"
                      onClick={() => setAppliedCoupon(null)}
                      title="Remove coupon"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="summary-rows">
                <div className="summary-row">
                  <span className="summary-label">Items Count:</span>
                  <span className="summary-value">{totalUnits}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Subtotal:</span>
                  <span className="summary-value">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {appliedCoupon && (
                  <div className="summary-row discount-row">
                    <span className="summary-label">Promo Discount:</span>
                    <span className="summary-value discount-val">
                      -₹{discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="summary-row">
                  <span className="summary-label">Shipping:</span>
                  <span className="summary-value-badge free">Free Standard</span>
                </div>
              </div>

              <div className="summary-divider" />

              <div className="summary-total-row">
                <span className="total-label">Estimated Total:</span>
                <span className="total-value">₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>

              <p className="summary-tax-note">All taxes included. Free standard shipping.</p>

              <Link
                to="/checkout"
                className="btn-checkout-cta"
              >
                <span>Proceed to Checkout</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>

              <div className="summary-perks">
                <div className="summary-perk-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>Free shipping on all orders</span>
                </div>
                <div className="summary-perk-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Safe &amp; secure payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
