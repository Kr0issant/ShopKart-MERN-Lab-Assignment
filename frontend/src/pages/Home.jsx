import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getOrders, getWishlist } from "../services/api";
import ChangePasswordModal from "../components/ChangePasswordModal";

const Home = () => {
  const { user } = useAuth();
  const { totalUnits } = useCart();
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardStats = async () => {
      try {
        const [ordersRes, wishlistRes] = await Promise.allSettled([
          getOrders(),
          getWishlist()
        ]);
        if (isMounted) {
          if (ordersRes.status === "fulfilled" && ordersRes.value?.orders) {
            setOrderCount(ordersRes.value.orders.length);
          }
          if (wishlistRes.status === "fulfilled" && wishlistRes.value?.wishlist) {
            setWishlistCount(wishlistRes.value.wishlist.length);
          }
        }
      } catch {
        // silent fail
      }
    };
    fetchDashboardStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="home-page container">
      {/* Executive Welcome Hero Banner */}
      <section className="welcome-banner">
        <div className="welcome-banner-inner">
          <div className="banner-left-group">
            <div className="user-avatar-halo">
              <span className="avatar-initials">{getInitials(user?.fullName)}</span>
            </div>
            <div className="banner-content">
              <div className="welcome-tag">
                <span className="welcome-dot" />
                Customer Account
              </div>
              <h1>
                Welcome back, <span className="highlight-name">{user?.fullName || "Shopper"}</span>
              </h1>
              <p>
                Manage your past orders, saved wishlist items, and personal account credentials.
              </p>
            </div>
          </div>

          <div className="banner-action">
            <Link to="/products" className="btn btn-primary banner-btn">
              <span>Browse Catalog</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Real Schema-Grounded Metric Tiles */}
      <div className="dashboard-stats-grid">
        <Link to="/orders" className="dash-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Past Orders</span>
            <div className="stat-icon-badge order-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{orderCount}</div>
          <p className="stat-subtext">View orders &amp; status →</p>
        </Link>

        <Link to="/wishlist" className="dash-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Saved Wishlist</span>
            <div className="stat-icon-badge wishlist-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{wishlistCount}</div>
          <p className="stat-subtext">View saved items →</p>
        </Link>

        <Link to="/cart" className="dash-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Shopping Cart</span>
            <div className="stat-icon-badge cart-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{totalUnits}</div>
          <p className="stat-subtext">Proceed to checkout →</p>
        </Link>
      </div>

      {/* Profile Details & Quick Actions Split Grid */}
      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="dashboard-card profile-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h2>Personal Profile</h2>
              <p className="card-subtitle">Verified account credentials</p>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{user?.fullName || "—"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Email Address</span>
              <span className="info-value">{user?.email || "—"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Phone Number</span>
              <span className="info-value">{user?.phone || "—"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Customer ID</span>
              <span className="info-value info-id">{user?._id || "—"}</span>
            </div>
          </div>

          <div className="profile-card-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Quick Shopping Shortcuts Card */}
        <div className="dashboard-card action-card">
          <div className="card-header">
            <div className="card-icon action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <h2>Shopping Shortcuts</h2>
              <p className="card-subtitle">Quick access to essential store actions</p>
            </div>
          </div>

          <div className="action-card-body">
            <div className="quick-links-list">
              <Link to="/products" className="quick-nav-tile">
                <div className="quick-tile-icon blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div className="quick-tile-info">
                  <h4>Browse Products</h4>
                  <p>Discover latest electronics, fashion & accessories</p>
                </div>
                <svg className="tile-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              <Link to="/orders" className="quick-nav-tile">
                <div className="quick-tile-icon emerald">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div className="quick-tile-info">
                  <h4>Track Orders</h4>
                  <p>Check delivery milestones & verified invoices</p>
                </div>
                <svg className="tile-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              <Link to="/wishlist" className="quick-nav-tile">
                <div className="quick-tile-icon rose">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <div className="quick-tile-info">
                  <h4>Saved Favorites</h4>
                  <p>Compare and manage your saved wishlist</p>
                </div>
                <svg className="tile-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default Home;
