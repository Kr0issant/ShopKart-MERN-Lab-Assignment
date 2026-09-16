import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/login");
  };

  const handleOpenPasswordModal = () => {
    setDropdownOpen(false);
    setIsPasswordModalOpen(true);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="navbar">
        <div className="container navbar-container">
          <Link to={user ? "/products" : "/login"} className="brand-logo">
            <div className="brand-logo-icon">
              <svg className="brand-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <span className="brand-text">Shop<strong>Kart</strong></span>
          </Link>

          <nav className="nav-links">
            {user ? (
              <>
                <NavLink
                  to="/products"
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  Products
                </NavLink>

                <NavLink
                  to="/home"
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  Dashboard
                </NavLink>

                <div className="nav-user-section" ref={dropdownRef}>
                  {/* Profile Avatar Dropdown Trigger */}
                  <div className="dropdown-wrapper">
                    <button
                      type="button"
                      className="user-avatar-btn"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      aria-label="User menu"
                    >
                      <span className="user-avatar-text">
                        {user.fullName?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </button>

                    {/* Collapsible Menu */}
                    {dropdownOpen && (
                      <div className="dropdown-menu">
                        <div className="dropdown-header">
                          <p className="dropdown-user-name">{user.fullName}</p>
                          <p className="dropdown-user-email">{user.email}</p>
                        </div>

                        <div className="dropdown-divider"></div>

                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={handleOpenPasswordModal}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                          Change Password
                        </button>

                        <div className="dropdown-divider"></div>

                        <button
                          type="button"
                          className="dropdown-item dropdown-item-danger"
                          onClick={handleLogout}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="nav-guest-section">
                <NavLink
                  to="/login"
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  Log In
                </NavLink>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
