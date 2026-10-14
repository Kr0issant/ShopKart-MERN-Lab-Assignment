import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders, updateOrderStatus } from "../services/api";

const statusSteps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [copiedId, setCopiedId] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOrders();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(err.response?.data?.message || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  // Bonus Challenge: Simulate order progression
  const handleSimulateStatus = async (orderId, currentStatus) => {
    const currentIndex = statusSteps.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusSteps.length;
    const nextStatus = statusSteps[nextIndex];

    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "badge-delivered";
      case "SHIPPED":
        return "badge-shipped";
      case "CONFIRMED":
        return "badge-confirmed";
      case "PLACED":
        return "badge-placed";
      default:
        return "badge-pending";
    }
  };

  return (
    <div className="orders-page container">
      {/* Hero Header */}
      <div className="orders-hero-header">
        <div className="orders-hero-info">
          <h1>My Orders</h1>
          <p className="orders-subtitle">
            Review and track all your previous purchases and verified deliveries.
          </p>
        </div>

        {orders.length > 0 && (
          <Link to="/products" className="btn-continue-shopping">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Continue Shopping</span>
          </Link>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="orders-loading-state">
          <div className="spinner-large" />
          <h3>Loading your orders...</h3>
          <p>Retrieving your order history from the server</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="orders-error-state">
          <div className="error-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Failed to load orders</h3>
          <p>{error}</p>
          <button type="button" className="btn btn-primary retry-btn" onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="orders-empty-state">
          <div className="orders-empty-icon-circle">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h2>No orders placed yet</h2>
          <p>
            When you complete a purchase, your verified order details and tracking milestones will appear here.
          </p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        /* Populated Orders List */
        <div className="orders-list">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            const currentStepIdx = statusSteps.indexOf(order.status);

            return (
              <div key={order._id} className="order-card">
                {/* Order Card Header */}
                <div className="order-card-header">
                  <div className="order-card-meta">
                    <div className="order-id-row">
                      <span className="order-id-label">Order:</span>
                      <code className="order-id-code">#{order._id}</code>
                      <button
                        type="button"
                        className="btn-copy-order-id"
                        onClick={() => handleCopyId(order._id)}
                        title="Copy Order ID"
                      >
                        {copiedId === order._id ? "Copied" : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <span className="order-date">{formattedDate}</span>
                  </div>

                  <div className="order-card-badges">
                    <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`order-payment-badge ${order.paymentStatus === "PAID" ? "paid" : "pending"}`}>
                      {order.paymentStatus === "PAID" ? "Paid Online" : order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Status Progression Tracker / Stepper */}
                <div className="order-stepper-box">
                  <div className="order-stepper">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;

                      return (
                        <div
                          key={step}
                          className={`stepper-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                        >
                          <div className="stepper-dot">
                            {isCompleted ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          <span className="stepper-label">{step}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Progression Simulator */}
                  <div className="bonus-simulator-bar">
                    <span className="simulator-hint">
                      Status Progression:
                    </span>
                    <button
                      type="button"
                      className="btn-advance-status"
                      onClick={() => handleSimulateStatus(order._id, order.status)}
                      disabled={updatingId === order._id}
                    >
                      {updatingId === order._id ? (
                        <>
                          <svg className="spin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          <span>Advancing...</span>
                        </>
                      ) : (
                        <>
                          <span>Advance Status</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Items Snapshot List */}
                <div className="order-card-items">
                  {order.items?.map((item, idx) => (
                    <div key={item._id || idx} className="order-card-item">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="order-item-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/80x80?text=Product";
                        }}
                      />
                      <div className="order-item-desc">
                        <h4 className="order-item-title">{item.name}</h4>
                        <span className="order-item-unit-calc">
                          Quantity: <strong>{item.quantity}</strong> × ₹{item.price?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="order-item-total">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="order-card-footer">
                  <div className="order-shipping-summary">
                    <span className="summary-ship-label">Delivery to:</span>
                    <span className="summary-ship-val">
                      {order.shippingAddress?.fullName}, {order.shippingAddress?.city} ({order.shippingAddress?.pincode})
                    </span>
                  </div>

                  <div className="order-card-grand-total">
                    <span className="grand-total-label">Total Paid:</span>
                    <span className="grand-total-val">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
