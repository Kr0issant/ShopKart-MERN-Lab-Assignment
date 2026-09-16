import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page container">
      {/* Welcome Overview Banner */}
      <section className="welcome-banner">
        <div className="welcome-banner-inner">
          <div className="banner-content">
            <div className="welcome-tag">
              <span className="welcome-dot"></span>
              Verified Customer Account
            </div>
            <h1>
              Welcome back, <span className="highlight-name">{user?.fullName || "Customer"}</span>
            </h1>
            <p>
              Manage your personal credentials, track shopping activity, and explore the latest items on ShopKart.
            </p>
          </div>
          <div className="banner-action">
            <Link to="/products" className="btn btn-primary btn-sm banner-btn">
              Explore Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Balanced Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="dashboard-card profile-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h2>Profile Details</h2>
              <p className="card-subtitle">Verified customer credentials</p>
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
        </div>

        {/* Quick Actions & Discovery Card */}
        <div className="dashboard-card action-card">
          <div className="card-header">
            <div className="card-icon action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div>
              <h2>Product Discovery</h2>
              <p className="card-subtitle">Browse products & live inventory</p>
            </div>
          </div>

          <div className="action-card-body">
            <p className="action-card-text">
              Ready to shop? Discover our collection of electronics, fashion, books, and accessories with live stock tracking.
            </p>

            <div className="action-features">
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span>Fast search & instant category filtering</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span>Real-time price sorting and stock updates</span>
              </div>
            </div>

            <Link to="/products" className="btn btn-secondary action-card-btn">
              Browse Product Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
