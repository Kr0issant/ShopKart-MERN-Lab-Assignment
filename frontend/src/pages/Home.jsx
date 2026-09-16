import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page container">
      {/* Welcome Overview */}
      <section className="welcome-banner">
        <div className="banner-content">
          <h1>
            Welcome back, <span className="highlight-name">{user?.fullName || "Customer"}</span>
          </h1>
          <p>Manage your account, view your registered profile details, and shop securely on ShopKart.</p>
        </div>
      </section>

      {/* Profile Details Container */}
      <div className="dashboard-content">
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
      </div>
    </div>
  );
};

export default Home;
