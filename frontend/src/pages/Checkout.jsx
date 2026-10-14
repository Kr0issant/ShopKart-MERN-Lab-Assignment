import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createPaymentOrder, verifyPayment } from "../services/api";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalUnits, subtotal, loading: cartLoading, clearCartState } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
        phone: prev.phone || user.phone || ""
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else {
      const cleanPhone = formData.phone.replace(/[\s+-]/g, "");
      if (cleanPhone.length < 10 || isNaN(cleanPhone)) {
        errors.phone = "Enter a valid phone number (at least 10 digits).";
      }
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = "Address line is required.";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required.";
    }

    if (!formData.state.trim()) {
      errors.state = "State is required.";
    }

    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = "Pincode must contain exactly 6 digits.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Please add products before placing an order.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Ensure Razorpay Checkout SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setErrorMessage("Failed to load payment gateway SDK. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // 2. Request backend to validate cart, stock, calculate price and create order
      const orderInitData = await createPaymentOrder({
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim()
        }
      });

      if (!orderInitData.success) {
        throw new Error(orderInitData.message || "Failed to initiate order.");
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = orderInitData;

      // 3. Configure Razorpay Standard Checkout
      const options = {
        key: key,
        amount: amount,
        currency: currency || "INR",
        name: "ShopKart",
        description: `Order #${shopKartOrderId.slice(-6).toUpperCase()}`,
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim(),
          email: user?.email || ""
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setErrorMessage("Payment was cancelled. Your cart has been preserved.");
          }
        },
        handler: async function (response) {
          try {
            // 4. Send payment signature to backend for verification
            const verifyRes = await verifyPayment({
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              // 5. Clear global cart state and navigate to order confirmation screen
              clearCartState();
              navigate(`/order-success/${shopKartOrderId}`);
            } else {
              setIsProcessing(false);
              setErrorMessage(verifyRes.message || "Payment verification failed.");
            }
          } catch (verifyErr) {
            console.error("Payment verification error:", verifyErr);
            setIsProcessing(false);
            setErrorMessage(
              verifyErr.response?.data?.message ||
              "Payment verification failed. Please contact support."
            );
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        setIsProcessing(false);
        setErrorMessage(
          response.error?.description ||
          "Payment processing failed. Your cart has not been cleared. Please try again."
        );
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Order creation failed:", err);
      setIsProcessing(false);
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred while initiating your order."
      );
    }
  };

  if (!cartLoading && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="checkout-page container">
        <div className="checkout-empty-state">
          <div className="checkout-empty-icon-box">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>You need to add products to your cart before proceeding to checkout.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      {/* Header */}
      <div className="checkout-hero-header">
        <div className="checkout-hero-info">
          <h1>Shipping & Payment</h1>
          <p className="checkout-subtitle">
            Enter your shipping address and complete your order.
          </p>
        </div>

        <Link to="/cart" className="btn-back-to-cart">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Return to Cart</span>
        </Link>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="alert alert-error checkout-alert" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2-Column Checkout Layout */}
      <div className="checkout-layout">
        {/* Left Column: Shipping Address Form */}
        <div className="checkout-form-column">
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="card-header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h2>Shipping Details</h2>
                <p>Provide the delivery address where your order should be shipped.</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="shipping-form" noValidate>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="fullName" className="form-label">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Aarav Sharma"
                    className={`form-input ${formErrors.fullName ? "input-error" : ""}`}
                    disabled={isProcessing}
                  />
                  {formErrors.fullName && (
                    <span className="field-error-text">{formErrors.fullName}</span>
                  )}
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="phone" className="form-label">
                    Phone Number <span className="required-star">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className={`form-input ${formErrors.phone ? "input-error" : ""}`}
                    disabled={isProcessing}
                  />
                  {formErrors.phone && (
                    <span className="field-error-text">{formErrors.phone}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="addressLine1" className="form-label">
                  Street Address <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Flat / House No., Building, Street Name"
                  className={`form-input ${formErrors.addressLine1 ? "input-error" : ""}`}
                  disabled={isProcessing}
                />
                {formErrors.addressLine1 && (
                  <span className="field-error-text">{formErrors.addressLine1}</span>
                )}
              </div>

              <div className="form-row three-cols">
                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    City <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`form-input ${formErrors.city ? "input-error" : ""}`}
                    disabled={isProcessing}
                  />
                  {formErrors.city && (
                    <span className="field-error-text">{formErrors.city}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="state" className="form-label">
                    State <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`form-input ${formErrors.state ? "input-error" : ""}`}
                    disabled={isProcessing}
                  />
                  {formErrors.state && (
                    <span className="field-error-text">{formErrors.state}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="pincode" className="form-label">
                    Pincode <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6 digits"
                    className={`form-input ${formErrors.pincode ? "input-error" : ""}`}
                    disabled={isProcessing}
                  />
                  {formErrors.pincode && (
                    <span className="field-error-text">{formErrors.pincode}</span>
                  )}
                </div>
              </div>

              {/* Action Button inside Left Column for mobile convenience */}
              <button
                type="submit"
                className="btn-pay-cta desktop-hide"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{subtotal?.toLocaleString("en-IN")} Securely</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary & Review */}
        <div className="checkout-summary-column">
          <div className="checkout-summary-card">
            <h2 className="summary-title">Order Review</h2>

            {/* Items Mini List */}
            <div className="checkout-items-list">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                const lineTotal = (product.price || 0) * (item.quantity || 1);

                return (
                  <div key={product._id} className="checkout-mini-item">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="mini-item-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/80x80?text=Item";
                      }}
                    />
                    <div className="mini-item-details">
                      <h4 className="mini-item-name" title={product.name}>
                        {product.name}
                      </h4>
                      <div className="mini-item-meta">
                        <span className="mini-item-qty">Qty: {item.quantity}</span>
                        <span className="mini-item-unit-price">
                          ₹{product.price?.toLocaleString("en-IN")} each
                        </span>
                      </div>
                    </div>
                    <div className="mini-item-total">
                      ₹{lineTotal.toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider" />

            {/* Calculations Breakdown */}
            <div className="summary-rows">
              <div className="summary-row">
                <span className="summary-label">Total Units:</span>
                <span className="summary-value">{totalUnits}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Items Subtotal:</span>
                <span className="summary-value">₹{subtotal?.toLocaleString("en-IN")}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Shipping:</span>
                <span className="summary-value-badge free">Free Standard</span>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-total-row">
              <span className="total-label">Grand Total:</span>
              <span className="total-value">₹{subtotal?.toLocaleString("en-IN")}</span>
            </div>

            <p className="summary-tax-note">All taxes included. Free standard shipping.</p>

            {/* Desktop Pay CTA */}
            <button
              type="button"
              className="btn-pay-cta mobile-hide"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{subtotal?.toLocaleString("en-IN")} Securely</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>

            {/* User-friendly Trust Badges */}
            <div className="summary-perks">
              <div className="summary-perk-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Safe &amp; Secure Payment</span>
              </div>
              <div className="summary-perk-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Instant Order Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
