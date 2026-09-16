import { useState } from "react";
import { changePassword } from "../services/api";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleClose = () => {
    setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setError("");
    setSuccess("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.oldPassword || !formData.newPassword) {
      setError("Both old and new passwords are required");
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(res.message || "Password updated successfully!");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to update password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>Change Password</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="modal-oldPassword">Current Password</label>
              <input
                id="modal-oldPassword"
                name="oldPassword"
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={formData.oldPassword}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-newPassword">New Password</label>
              <input
                id="modal-newPassword"
                name="newPassword"
                type="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-confirmPassword">Confirm New Password</label>
              <input
                id="modal-confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : "Save Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
