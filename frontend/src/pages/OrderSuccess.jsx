import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../services/api";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getOrderById(id);
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError("Order details could not be found.");
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError(err.response?.data?.message || "Failed to load order confirmation.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleCopyId = () => {
    if (order?._id) {
      navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="order-success-page container">
        <div className="order-success-loading">
          <div className="spinner-large" />
          <h2>Confirming your order...</h2>
          <p>Retrieving your confirmed purchase details from the server</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-success-page container">
        <div className="order-success-error">
          <div className="error-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2>Unable to Load Order</h2>
          <p>{error || "We could not find the requested order."}</p>
          <div className="order-success-actions">
            <Link to="/orders" className="btn btn-primary">
              View All Orders
            </Link>
            <Link to="/products" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page container">
      {/* Radiant Success Card */}
      <div className="order-success-card">
        {/* Animated Celebration Icon */}
        <div className="order-success-icon-wrapper">
          <div className="success-pulse-ring outer" />
          <div className="success-pulse-ring inner" />
          <div className="success-icon-circle">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <h1>Thank you for your purchase!</h1>
        <p className="order-success-subtitle">
          Your payment has been confirmed and your order is now placed.
        </p>

        {/* Order Meta Bar */}
        <div className="order-meta-box">
          <div className="order-meta-item">
            <span className="meta-label">Order ID:</span>
            <div className="meta-id-group">
              <code className="meta-id">{order._id}</code>
              <button
                type="button"
                className="btn-copy-id"
                onClick={handleCopyId}
                title="Copy Order ID"
              >
                {copied ? (
                  <span className="copied-text">Copied!</span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="order-meta-item">
            <span className="meta-label">Payment Status:</span>
            <span className="status-pill status-paid">
              <span className="status-dot" />
              {order.paymentStatus}
            </span>
          </div>

          <div className="order-meta-item">
            <span className="meta-label">Order Status:</span>
            <span className="status-pill status-placed">
              {order.status}
            </span>
          </div>

          <div className="order-meta-item">
            <span className="meta-label">Total Amount:</span>
            <span className="meta-total">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Two-Column Details Breakdown */}
        <div className="order-details-grid">
          {/* Purchased Items Snapshot */}
          <div className="order-details-card">
            <h3>Purchased Items ({order.items?.length || 0})</h3>
            <div className="success-items-list">
              {order.items?.map((item, index) => (
                <div key={item._id || index} className="success-item-row">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="success-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/70x70?text=Product";
                    }}
                  />
                  <div className="success-item-info">
                    <h4 className="success-item-title">{item.name}</h4>
                    <span className="success-item-qty">
                      Quantity: <strong>{item.quantity}</strong> × ₹{item.price?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="success-item-price">
                    ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="order-details-card">
            <h3>Delivery & Payment Details</h3>
            <div className="order-info-list">
              <div className="order-info-item">
                <span className="info-key">Recipient:</span>
                <span className="info-val">{order.shippingAddress?.fullName}</span>
              </div>
              <div className="order-info-item">
                <span className="info-key">Phone:</span>
                <span className="info-val">{order.shippingAddress?.phone}</span>
              </div>
              <div className="order-info-item">
                <span className="info-key">Shipping Address:</span>
                <span className="info-val">
                  {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="order-info-item">
                  <span className="info-key">Payment Reference:</span>
                  <code className="info-code">{order.razorpayPaymentId}</code>
                </div>
              )}
              {order.razorpayOrderId && (
                <div className="order-info-item">
                  <span className="info-key">Transaction ID:</span>
                  <code className="info-code">{order.razorpayOrderId}</code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="order-success-actions">
          <Link to="/orders" className="btn btn-primary btn-view-orders">
            <span>View All Orders</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link to="/products" className="btn btn-continue-shopping">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
