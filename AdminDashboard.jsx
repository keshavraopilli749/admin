import React, { useState } from "react";

// Single source of truth for the API base URL — avoids drift between
// components that each used to hardcode their own fallback.
const API_BASE = import.meta.env.VITE_API_URL || "https://crms-1.onrender.com/api";

// Single source of truth for "today" — was previously hardcoded as the
// literal string for July 14 2026 in ~25 places across the file.
const TODAY = new Date().toISOString().slice(0, 10);

// Small date helpers so "tomorrow" / "this week" / "this month" are computed
// relative to TODAY instead of being separate hardcoded date literals.
const addDaysToDateStr = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const TOMORROW = addDaysToDateStr(TODAY, 1);
const THIS_WEEK_START = addDaysToDateStr(TODAY, -2);
const THIS_WEEK_END = addDaysToDateStr(TODAY, 4);
const THIS_MONTH_PREFIX = TODAY.slice(0, 7); // "YYYY-MM"

// ----------------------------------------------------
// Initial datasets — start empty; no seeded demo data.
// ----------------------------------------------------
const initialTasks = [];

// Default profile information (Single source of truth)
const defaultProfileData = {
  firstName: "",
  lastName: "",
  displayName: "",
  dob: "",
  gender: "",
  nationality: "",
  
  employeeId: "",
  designation: "",
  department: "",
  company: "",
  officeLocation: "",
  employmentType: "",
  joiningDate: "",
  reportingManager: "",
  employmentStatus: "Active",
  
  officialEmail: "",
  personalEmail: "",
  phoneNumber: "",
  alternatePhone: "",
  emergencyContact: "",
  emergencyPhone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  
  bio: "",
  skills: "",
  experience: "",
  languagesKnown: "",
  avatar: "",

  linkedin: "",
  portfolio: "",
  github: "",
  website: "",
  
  // CRM Preferences
  defaultDashboard: "Sales",
  defaultPipeline: "Standard",
  currency: "INR (₹)",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12-hour",
  notificationPreference: "Email & Push Alerts",

  // Account Info
  username: "",
  role: "",
  accountStatus: "Active",
  lastLogin: "",
  createdOn: "",

  // Settings preferences
  theme: "Light",
  language: "English",
  timeZone: "GMT+5:30 (IST)",
  notifEmail: true,
  notifPush: true
};

// Initial Events List (Single Source of Truth)
const initialEvents = [];

// Helper to resolve color style depending on Type & Status
const getEventColor = (type, status) => {
  if (status === "Completed") return "#10b981"; // Green (Completed)
  if (status === "Missed") return "#ef4444"; // Red (Missed)
  switch (type) {
    case "Meeting": return "#2563eb"; // Blue
    case "Reminder": return "#eab308"; // Yellow
    case "Follow-up": return "#f97316"; // Orange
    case "Demo": return "#a855f7"; // Purple
    case "Call": return "#f97316"; // Orange (Calls)
    default: return "#64748b"; // Gray
  }
};

const getEventBootstrapIcon = (type) => {
  switch (type) {
    case "Meeting": return "bi-people";
    case "Reminder": return "bi-alarm";
    case "Follow-up": return "bi-journal-check";
    case "Demo": return "bi-laptop";
    case "Call": return "bi-telephone";
    default: return "bi-calendar-event";
  }
};

// ----------------------------------------------------
// SALES ANALYTICS CHART COMPONENT (Dependency-free Responsive SVG)
// ----------------------------------------------------
const SalesChartComponent = () => {
  return (
    <div style={{ height: "240px", width: "100%", position: "relative", padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="text-center text-muted" style={{ padding: "40px" }}>
        <i className="bi bi-graph-up-arrow text-secondary mb-3" style={{ fontSize: "40px", display: "block" }}></i>
        <h5 style={{ fontSize: "14px", fontWeight: "750", color: "var(--crm-dark)", margin: "0 0 6px 0" }}>No Sales Data Available</h5>
        <p style={{ fontSize: "12px", maxWidth: "280px", margin: "0 auto" }}>Create custom customer deals or log transactions to view sales revenue curves.</p>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// SIDEBAR MENU
// ----------------------------------------------------
const Sidebar = ({ activeMenu, setActiveMenu, onLogout, setMobileActive }) => {
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { key: "me", label: "Me", icon: "bi-person" },
    { key: "news", label: "News", icon: "bi-newspaper" },
    { key: "calendar", label: "Calendar", icon: "bi-calendar-event" },
    { key: "tasks", label: "Tasks", icon: "bi-check2-square" },
    { key: "team", label: "Team", icon: "bi-people" },
    { key: "documents", label: "Documents", icon: "bi-file-earmark-text" },
    { key: "notifications", label: "Notifications", icon: "bi-bell" },
    { key: "settings", label: "Settings", icon: "bi-gear" }
  ];

  return (
    <aside className="crm-sidebar-menu">
      <ul className="sidebar-links-stack">
        {menuItems.map(item => (
          <li className={activeMenu === item.key ? "active" : ""} key={item.key}>
            <button
              title={item.label}
              aria-label={item.label}
              aria-current={activeMenu === item.key ? "page" : undefined}
              onClick={() => { setActiveMenu(item.key); setMobileActive(false); }}
            >
              <i className={`bi ${item.icon}`} aria-hidden="true"></i>
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          </li>
        ))}
        <li className="sidebar-logout-item">
          <button title="Logout" aria-label="Logout" onClick={onLogout}>
            <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
            <span className="sidebar-nav-label">Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  );
};

// Helper for rendering circular image initials avatar
const AvatarRenderer = ({ profile, size }) => {
  if (profile && profile.avatar) {
    return <img src={profile.avatar} alt="Profile" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  const initials = `${profile?.firstName?.[0] || ""}${profile?.lastName?.[0] || ""}`.toUpperCase();
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: "#e2e8f0",
      color: "var(--crm-primary)",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size > 60 ? "24px" : "12px"
    }}>
      {initials || "U"}
    </div>
  );
};

// ----------------------------------------------------
// ME PROFILE PAGE COMPONENT (EDITABLE FORM)
// ----------------------------------------------------
const MeProfile = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...profile });
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: "", type: "success" });

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, avatar: null }));
  };

  const handleReset = () => {
    setFormData({ ...profile });
  };

  const showToastMsg = (text, type = "success") => {
    setToastMsg({ text, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    showToastMsg("Profile updated successfully!");
  };

  // ── Delete Account ──
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const token = localStorage.getItem("crm_token");
      const res = await fetch(`${API_BASE}/profile`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Clear all local auth data (every cache this app writes, not just some of them)
        localStorage.removeItem("crm_token");
        localStorage.removeItem("crm_profile_v2");
        localStorage.removeItem("crm_events_v2");
        localStorage.removeItem("crm_tasks_v2");
        localStorage.removeItem("crm_team_members_v2");
        localStorage.removeItem("crm_notifications_v2");
        localStorage.removeItem("crm_documents_v2");
        showToastMsg("Account deleted successfully.", "success");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setDeleteError(data.message || "Unable to delete account. Please try again.");
        setDeleteLoading(false);
      }
    } catch (err) {
      setDeleteError("Unable to delete account. Please try again.");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="dashboard-card-flat">
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: toastMsg.type === "success" ? "#10b981" : "#ef4444",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          fontWeight: "750",
          zIndex: 9999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <i className={`bi ${toastMsg.type === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}></i>
          {toastMsg.text}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.55)",
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "32px 28px",
            maxWidth: "420px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "50%",
                background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className="bi bi-trash3-fill" style={{ color: "#ef4444", fontSize: "18px" }}></i>
              </div>
              <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>Delete Account</h4>
            </div>
            <p style={{ fontSize: "14px", color: "#475569", marginBottom: "6px" }}>
              Are you sure you want to permanently delete your account?
            </p>
            <p style={{ fontSize: "13px", color: "#ef4444", fontWeight: "600", marginBottom: "20px" }}>
              This action cannot be undone.
            </p>
            {deleteError && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "8px", padding: "10px 14px",
                fontSize: "13px", color: "#dc2626", marginBottom: "16px"
              }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-profile-secondary"
                style={{ padding: "9px 22px" }}
                onClick={() => { setShowDeleteModal(false); setDeleteError(""); }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  padding: "9px 22px",
                  background: deleteLoading ? "#fca5a5" : "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: "7px",
                }}
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading && (
                  <span style={{
                    width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff", borderRadius: "50%", display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }} />
                )}
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card-flat-title-bar">
        <h3><i className="bi bi-person-gear"></i> My Profile</h3>
        <span className="text-muted" style={{ fontSize: "12px", fontWeight: "700" }}>Manage your personal details</span>
      </div>

      {(!profile.firstName || profile.firstName.trim() === "") && (
        <div className="alert alert-info border-0 rounded-3 mb-4 d-flex align-items-center gap-2" style={{ background: "#eff6ff", color: "#2563eb", padding: "16px" }}>
          <i className="bi bi-info-circle-fill" style={{ fontSize: "18px" }}></i>
          <span style={{ fontSize: "13px", fontWeight: "700" }}>Complete your profile to personalize your CRM workspace.</span>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .readonly-clean {
          background: #ffffff !important;
          color: inherit !important;
          cursor: default;
          opacity: 1 !important;
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">

          {/* Profile Photo Upload Panel */}
          <div className="col-12">
            <div className="p-3 border rounded-3 bg-light text-center d-flex flex-column align-items-center gap-3">
              <h5 className="mb-0 text-muted" style={{ fontSize: "12.5px", fontWeight: "755", textTransform: "uppercase" }}>Profile Photo</h5>
              <AvatarRenderer profile={formData} size={100} />
              <div className="d-flex gap-2">
                <label className="btn-profile-primary" style={{ cursor: "pointer", fontSize: "12px", padding: "6px 16px" }}>
                  Upload Image
                  <input type="file" accept="image/png, image/jpeg, image/jpg" style={{ display: "none" }} onChange={handleFileChange} />
                </label>
                {formData.avatar && (
                  <button type="button" className="btn-profile-secondary" style={{ fontSize: "12px", padding: "6px 16px" }} onClick={handleRemovePhoto}>
                    Remove
                  </button>
                )}
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "10px" }}>Accepted formats: JPG, JPEG, PNG</p>
            </div>
          </div>

          {/* 1. Personal Information */}
          <div className="col-12">
            <div className="p-3 border rounded-3">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>Personal Information</h4>
              <div className="row g-3">
                <div className="col-md-4 modal-form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName || ""} onChange={handleTextChange} required />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName || ""} onChange={handleTextChange} required />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Display Name</label>
                  <input type="text" name="displayName" value={formData.displayName || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender || ""} onChange={handleTextChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Nationality</label>
                  <input type="text" name="nationality" value={formData.nationality || ""} onChange={handleTextChange} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Contact Information */}
          <div className="col-12">
            <div className="p-3 border rounded-3">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>Contact Information</h4>
              <div className="row g-3">
                <div className="col-md-6 modal-form-group">
                  <label>Personal Email</label>
                  <input type="email" name="personalEmail" value={formData.personalEmail || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Official Email</label>
                  <input type="email" name="officialEmail" value={formData.officialEmail || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Primary Phone</label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Alternate Phone</label>
                  <input type="text" name="alternatePhone" value={formData.alternatePhone || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Emergency Contact</label>
                  <input type="text" name="emergencyContact" value={formData.emergencyContact || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Emergency Phone</label>
                  <input type="text" name="emergencyPhone" value={formData.emergencyPhone || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-12 modal-form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={formData.address || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>City</label>
                  <input type="text" name="city" value={formData.city || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>State</label>
                  <input type="text" name="state" value={formData.state || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>Country</label>
                  <input type="text" name="country" value={formData.country || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>Zip Code</label>
                  <input type="text" name="zipCode" value={formData.zipCode || ""} onChange={handleTextChange} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Work Information */}
          <div className="col-12">
            <div className="p-3 border rounded-3">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>Work Information</h4>
              <div className="row g-3">
                {/* Read-only fields — clean white, no disabled look */}
                <div className="col-md-4 modal-form-group">
                  <label>Employee ID</label>
                  <input type="text" value={formData.employeeId || ""} className="readonly-clean" readOnly />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Joining Date</label>
                  <input type="text" value={formData.joiningDate || ""} className="readonly-clean" readOnly />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Company</label>
                  <input type="text" value={formData.company || ""} className="readonly-clean" readOnly />
                </div>
                {/* Editable work fields */}
                <div className="col-md-4 modal-form-group">
                  <label>Department</label>
                  <input type="text" name="department" value={formData.department || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Designation</label>
                  <input type="text" name="designation" value={formData.designation || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Reporting Manager</label>
                  <input type="text" name="reportingManager" value={formData.reportingManager || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Office Location</label>
                  <select name="officeLocation" value={formData.officeLocation || "Remote"} onChange={handleTextChange}>
                    <option value="Remote">Remote</option>
                    <option value="Head Office">Head Office</option>
                    <option value="Branch Office">Branch Office</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Employment Type</label>
                  <select name="employmentType" value={formData.employmentType || "Internship"} onChange={handleTextChange}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Employment Status</label>
                  <select name="employmentStatus" value={formData.employmentStatus || "Active"} onChange={handleTextChange}>
                    <option value="Active">Active</option>
                    <option value="Probation">Probation</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Professional Information */}
          <div className="col-12">
            <div className="p-3 border rounded-3">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>Professional Information</h4>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Short Bio</label>
                  <textarea name="bio" rows={2} value={formData.bio || ""} onChange={handleTextChange}></textarea>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Skills</label>
                  <input type="text" name="skills" value={formData.skills || ""} onChange={handleTextChange} placeholder="React, Node.js, etc." />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Experience</label>
                  <input type="text" name="experience" value={formData.experience || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Languages Known</label>
                  <input type="text" name="languagesKnown" value={formData.languagesKnown || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>LinkedIn URL</label>
                  <input type="text" name="linkedin" value={formData.linkedin || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>GitHub URL</label>
                  <input type="text" name="github" value={formData.github || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>Portfolio URL</label>
                  <input type="text" name="portfolio" value={formData.portfolio || ""} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>Website URL</label>
                  <input type="text" name="website" value={formData.website || ""} onChange={handleTextChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons — Cancel | Reset | Delete Account | Save Changes */}
          <div className="col-12 d-flex justify-content-end gap-3 mt-4 flex-wrap">
            <button type="button" className="btn-profile-secondary" style={{ padding: "10px 24px" }} onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="btn-profile-secondary" style={{ padding: "10px 24px" }} onClick={handleReset}>
              Reset
            </button>
            <button
              type="button"
              style={{
                padding: "10px 24px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="bi bi-trash3"></i>
              Delete Account
            </button>
            <button type="submit" className="btn-profile-primary" style={{ padding: "10px 30px" }}>
              Save Changes
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

// SYSTEM SETTINGS COMPONENT
// ----------------------------------------------------
const SettingsPage = ({ profile, onSaveSettings }) => {
  const [settingsData, setSettingsData] = useState({
    theme: profile?.theme || "Light",
    language: profile?.language || "English",
    timeZone: profile?.timeZone || "GMT+5:30 (IST)",
    notifEmail: profile?.notifEmail !== undefined ? profile.notifEmail : true,
    notifPush: profile?.notifPush !== undefined ? profile.notifPush : true
  });
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(settingsData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="dashboard-card-flat">
      <div className="card-flat-title-bar">
        <h3><i className="bi bi-gear"></i> System Settings</h3>
        <span className="text-muted" style={{ fontSize: "12px", fontWeight: "700" }}>Manage application preferences</span>
      </div>

      {showToast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          background: "#10b981", color: "white", padding: "12px 24px",
          borderRadius: "8px", fontWeight: "750", zIndex: 1300,
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          <i className="bi bi-check-circle-fill"></i> Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="row g-4">
          <div className="col-12">
            <div className="p-3 border rounded-3 bg-light">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>Preferences</h4>
              <div className="row g-3">
                <div className="col-md-4 modal-form-group">
                  <label>Theme</label>
                  <select name="theme" value={settingsData.theme} onChange={handleChange}>
                    <option value="Light">Light Mode</option>
                    <option value="Dark">Dark Mode</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Language</label>
                  <select name="language" value={settingsData.language} onChange={handleChange}>
                    <option value="English">English</option>
                    <option value="Spanish">Español</option>
                    <option value="French">Français</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Time Zone</label>
                  <select name="timeZone" value={settingsData.timeZone} onChange={handleChange}>
                    <option value="GMT+5:30 (IST)">GMT+5:30 (IST)</option>
                    <option value="GMT+0:00 (UTC)">GMT+0:00 (UTC)</option>
                    <option value="EST (GMT-5)">EST (GMT-5)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="notifEmail" id="setNotifEmail" checked={settingsData.notifEmail} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="setNotifEmail" style={{ fontSize: "12px", fontWeight: "600" }}>Enable Email Alerts</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="notifPush" id="setNotifPush" checked={settingsData.notifPush} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="setNotifPush" style={{ fontSize: "12px", fontWeight: "600" }}>Enable Push Notifications</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-end mt-4">
          <button type="submit" className="btn-profile-primary" style={{ padding: "10px 24px" }}>
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};


// ----------------------------------------------------
// SIMPLE CRM INTERACTIVE CALENDAR COMPONENT (WITH CRUD)
// ----------------------------------------------------
const CalendarPage = ({ events, onAddEvent, onUpdateEvent, onDeleteEvent, profile }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Selection states
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [activeEvent, setActiveEvent] = useState(null);

  // Modal Visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Forms States
  const [newEventForm, setNewEventForm] = useState({
    title: "",
    description: "",
    type: "Meeting",
    date: TODAY,
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    customer: "",
    priority: "Medium",
    status: "Pending",
    assignedTo: profile?.firstName ? `${profile.firstName} ${profile.lastName}` : "Me",
    location: ""
  });

  const [editEventForm, setEditEventForm] = useState({
    title: "",
    description: "",
    type: "Meeting",
    date: TODAY,
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    customer: "",
    priority: "Medium",
    status: "Pending",
    assignedTo: "",
    location: ""
  });

  // Month structure generator — builds the grid for the current month dynamically
  // (previously hardcoded to always render July 2026 regardless of the real date)
  const calendarCells = [];
  const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
  const [todayYear, todayMonthNum] = TODAY.split("-").map(Number); // todayMonthNum is 1-indexed
  const daysInMonth = new Date(todayYear, todayMonthNum, 0).getDate();
  const daysInPrevMonth = new Date(todayYear, todayMonthNum - 1, 0).getDate();
  const leadingDays = new Date(todayYear, todayMonthNum - 1, 1).getDay(); // 0=Sun..6=Sat
  const prevMonthDate = new Date(todayYear, todayMonthNum - 2, 1);
  const nextMonthDate = new Date(todayYear, todayMonthNum, 1);

  for (let i = 0; i < leadingDays; i++) {
    const dayNum = daysInPrevMonth - leadingDays + 1 + i;
    calendarCells.push({
      dayNum,
      dateStr: `${prevMonthDate.getFullYear()}-${pad2(prevMonthDate.getMonth() + 1)}-${pad2(dayNum)}`,
      inMonth: false
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ dayNum: i, dateStr: `${todayYear}-${pad2(todayMonthNum)}-${pad2(i)}`, inMonth: true });
  }
  const trailingDays = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= trailingDays; i++) {
    calendarCells.push({
      dayNum: i,
      dateStr: `${nextMonthDate.getFullYear()}-${pad2(nextMonthDate.getMonth() + 1)}-${pad2(i)}`,
      inMonth: false
    });
  }

  // Handle Event Creation
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newEventForm.title.trim()) return;
    onAddEvent({
      ...newEventForm,
      id: Date.now()
    });
    // Reset and close
    setNewEventForm({
      title: "",
      description: "",
      type: "Meeting",
      date: selectedDay,
      startTime: "09:00 AM",
      endTime: "10:00 AM",
      customer: "",
      priority: "Medium",
      status: "Pending",
      assignedTo: profile?.firstName ? `${profile.firstName} ${profile.lastName}` : "Me",
      location: ""
    });
    setShowAddModal(false);
  };

  // Handle Event Update
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editEventForm.title.trim()) return;
    onUpdateEvent(editEventForm);
    setActiveEvent(editEventForm);
    setShowEditModal(false);
    setShowDetailsModal(true);
  };

  // Handle Event Deletion
  const handleDeleteConfirmSubmit = () => {
    if (activeEvent) {
      onDeleteEvent(activeEvent.id);
      setActiveEvent(null);
      setShowDeleteConfirm(false);
    }
  };

  // Toggle Completed status
  const handleToggleStatus = (ev) => {
    const updated = {
      ...ev,
      status: ev.status === "Completed" ? "Pending" : "Completed"
    };
    onUpdateEvent(updated);
    setActiveEvent(updated);
    setShowDetailsModal(false);
  };

  // Duplicate Event
  const handleDuplicateEvent = (ev) => {
    onAddEvent({
      ...ev,
      id: Date.now(),
      title: `${ev.title} (Copy)`
    });
    setShowDetailsModal(false);
  };

  // Quick Action triggers
  const triggerQuickAdd = (type) => {
    setNewEventForm(prev => ({
      ...prev,
      type,
      date: selectedDay
    }));
    setShowAddModal(true);
  };

  // Filter Logic (Search + Type dropdown)
  const filteredEvents = (events || []).filter(ev => {
    const matchesSearch = (ev.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ev.customer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ev.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ev.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "All" || 
                          (filterType === "Meetings" && ev.type === "Meeting") ||
                          (filterType === "Calls" && ev.type === "Call") ||
                          (filterType === "Demos" && ev.type === "Demo") ||
                          (filterType === "Reminders" && ev.type === "Reminder") ||
                          (filterType === "Follow-ups" && ev.type === "Follow-up");
    return matchesSearch && matchesFilter;
  });

  // Today's list (July 14, 2026)
  const todaysList = filteredEvents.filter(ev => ev.date === TODAY)
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  // Upcoming list (after July 14, 2026)
  const upcomingList = filteredEvents.filter(ev => ev.date > TODAY)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  // Date Formatter helper: YYYY-MM-DD to "DD Month"
  const formatUpcomingDate = (dateStr) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${day} ${months[monthIdx] || ""}`;
    }
    return dateStr;
  };

  return (
    <div className="dashboard-card-flat">
      
      {/* 1. Header & Controls */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h3 className="mb-1" style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", color: "var(--crm-dark)", letterSpacing: "0.02em" }}>
            Calendar
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
            Manage your meetings, follow-ups and reminders.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="nav-search-bar" style={{ width: "200px", background: "var(--crm-bg)", border: "1px solid var(--crm-border)" }}>
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              className="nav-search-input" 
              placeholder="Search Event..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="form-select btn-profile-secondary py-1 px-3" 
            style={{ width: "130px", fontSize: "12.5px", height: "36px", border: "1px solid var(--crm-border)" }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Meetings">Meetings</option>
            <option value="Calls">Calls</option>
            <option value="Demos">Demos</option>
            <option value="Reminders">Reminders</option>
            <option value="Follow-ups">Follow-ups</option>
          </select>

          <button className="btn-profile-primary" style={{ padding: "8px 20px" }} onClick={() => { setNewEventForm(prev => ({ ...prev, date: selectedDay })); setShowAddModal(true); }}>
            <i className="bi bi-plus-lg"></i> New Event
          </button>
        </div>
      </div>

      {/* 2. Split Workspace Layout */}
      <div className="calendar-layout-wrapper">
        
        {/* Left Hand Block: Grid Calendar (70%) */}
        <div className="calendar-left-main">
          <div className="calendar-grid-header">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="calendar-grid-body mb-4">
            {calendarCells.map((cell, idx) => {
              const dayEvents = filteredEvents.filter(ev => ev.date === cell.dateStr);
              const isSelected = selectedDay === cell.dateStr;
              const isToday = cell.dateStr === TODAY;

              return (
                <div 
                  key={cell.dateStr}
                  className={`calendar-grid-cell ${!cell.inMonth ? "out-of-month" : ""}`}
                  style={isToday ? { border: "2px solid var(--crm-primary)", background: "rgba(37, 99, 235, 0.04)" } : isSelected ? { border: "1.5px dashed #cbd5e1" } : {}}
                  onClick={() => {
                    setSelectedDay(cell.dateStr);
                    setNewEventForm(prev => ({ ...prev, date: cell.dateStr }));
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="calendar-day-num" style={isToday ? { fontWeight: "800", color: "var(--crm-primary)" } : {}}>{cell.dayNum}</span>
                    {isToday && (
                      <span className="badge bg-primary" style={{ padding: "2px 5px", fontSize: "8px", fontWeight: "800" }}>TODAY</span>
                    )}
                  </div>
                  
                  {/* Event list rows inside cell */}
                  <div className="d-flex flex-column gap-1 overflow-hidden" style={{ flex: 1 }}>
                    {dayEvents.slice(0, 3).map(ev => (
                      <div 
                        key={ev.id}
                        className="calendar-cell-event text-truncate"
                        style={{ 
                          backgroundColor: ev.status === "Completed" ? "#e2e8f0" : getEventColor(ev.type, ev.status), 
                          color: ev.status === "Completed" ? "#64748b" : "#ffffff",
                          textDecoration: ev.status === "Completed" ? "line-through" : "none",
                          cursor: "pointer" 
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEvent(ev);
                          setShowDetailsModal(true);
                        }}
                      >
                        <i className={`bi ${getEventBootstrapIcon(ev.type)} me-1`}></i>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-muted" style={{ fontSize: "8px", fontWeight: "700" }}>+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Hand Block: Schedule & Quick Controls (30%) */}
        <div className="calendar-right-side">
          
          {/* A. Upcoming Events list card */}
          <div className="p-3 border rounded-3 bg-light">
            <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.02em", marginBottom: "12px" }}>
              Upcoming Events
            </h4>
            <div className="d-flex flex-column gap-2">
              {upcomingList.length > 0 ? (
                upcomingList.slice(0, 5).map(ev => (
                  <div 
                    key={ev.id}
                    className="p-2 bg-white rounded border-start-custom border"
                    style={{ borderLeft: `4px solid ${getEventColor(ev.type, ev.status)}`, cursor: "pointer" }}
                    onClick={() => {
                      setActiveEvent(ev);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <span style={{ fontSize: "11px", fontWeight: "750" }} className="text-truncate">{ev.title}</span>
                      <span style={{ fontSize: "9px" }} className={`badge-priority ${ev.priority.toLowerCase()}`}>{ev.priority}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-1 text-muted" style={{ fontSize: "9.5px" }}>
                      <span><i className="bi bi-calendar"></i> {formatUpcomingDate(ev.date)}</span>
                      <span>{ev.startTime}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted mb-2" style={{ fontSize: "11.5px" }}>No upcoming events scheduled.</p>
                  <button 
                    type="button" 
                    className="btn-profile-primary py-1 px-3" 
                    style={{ fontSize: "11px" }}
                    onClick={() => { setNewEventForm(prev => ({ ...prev, date: TOMORROW })); setShowAddModal(true); }}
                  >
                    Create Event
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* B. Today's Schedule Card */}
          <div className="p-3 border rounded-3 bg-light">
            <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.02em", marginBottom: "12px" }}>
              Today's Schedule
            </h4>
            <div className="d-flex flex-column gap-2">
              {todaysList.length > 0 ? (
                todaysList.map(ev => (
                  <div 
                    key={ev.id}
                    className="p-2 bg-white rounded border"
                    style={{ borderLeft: `4px solid ${getEventColor(ev.type, ev.status)}`, cursor: "pointer" }}
                    onClick={() => {
                      setActiveEvent(ev);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <strong style={{ fontSize: "11.5px", color: "var(--crm-dark)" }}>{ev.title}</strong>
                      <span style={{ fontSize: "9.5px", fontWeight: "750", color: "var(--crm-primary)" }}>{ev.startTime}</span>
                    </div>
                    <p className="text-muted mb-0 text-truncate" style={{ fontSize: "10px" }}>{ev.description || "No description details"}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-2 mb-0" style={{ fontSize: "11.5px" }}>No meetings scheduled today.</p>
              )}
            </div>
          </div>

          {/* C. Quick Actions block */}
          <div className="p-3 border rounded-3 bg-light">
            <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.02em", marginBottom: "12px" }}>
              Quick Actions
            </h4>
            <div className="d-flex flex-column gap-2">
              <button type="button" className="btn-profile-secondary text-start py-1.5 px-3" style={{ fontSize: "12px", fontWeight: "700" }} onClick={() => triggerQuickAdd("Meeting")}>
                <i className="bi bi-people text-primary me-2"></i> Create Meeting
              </button>
              <button type="button" className="btn-profile-secondary text-start py-1.5 px-3" style={{ fontSize: "12px", fontWeight: "700" }} onClick={() => triggerQuickAdd("Reminder")}>
                <i className="bi bi-bell text-warning me-2"></i> Create Reminder
              </button>
              <button type="button" className="btn-profile-secondary text-start py-1.5 px-3" style={{ fontSize: "12px", fontWeight: "700" }} onClick={() => triggerQuickAdd("Follow-up")}>
                <i className="bi bi-arrow-right-circle text-info me-2"></i> Create Follow-up
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: Create New Event */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-calendar-plus"></i> New Event</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => setShowAddModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="row g-3">
                
                <div className="col-12 modal-form-group">
                  <label>Event Title</label>
                  <input 
                    type="text" 
                    placeholder="Enter title..."
                    value={newEventForm.title} 
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, title: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Category</label>
                  <select 
                    value={newEventForm.type} 
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Call">Call</option>
                    <option value="Reminder">Reminder</option>
                    <option value="Demo">Demo</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={newEventForm.date} 
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, date: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Start Time</label>
                  <input 
                    type="text" 
                    value={newEventForm.startTime} 
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                    placeholder="e.g. 09:00 AM"
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>End Time</label>
                  <input 
                    type="text" 
                    value={newEventForm.endTime} 
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                    placeholder="e.g. 10:00 AM"
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Assign To</label>
                  <input 
                    type="text" 
                    placeholder="Employee name..."
                    value={newEventForm.assignedTo} 
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    placeholder="Location or online link..."
                    value={newEventForm.location} 
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Customer (optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Amazon, Tesla"
                    value={newEventForm.customer} 
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, customer: e.target.value }))}
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Priority</label>
                  <select 
                    value={newEventForm.priority} 
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="col-12 modal-form-group">
                  <label>Description</label>
                  <textarea 
                    rows={2} 
                    value={newEventForm.description}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the event..."
                  ></textarea>
                </div>

              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-profile-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Event Details Viewer */}
      {showDetailsModal && activeEvent && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "450px", maxWidth: "90%" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-info-circle"></i> Event Details</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => setShowDetailsModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="d-flex flex-column gap-3 py-2">
              <div>
                <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>TITLE</span>
                <strong style={{ fontSize: "15px", color: "var(--crm-dark)" }}>{activeEvent.title}</strong>
              </div>

              <div>
                <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>DESCRIPTION</span>
                <p className="mb-0" style={{ fontSize: "12.5px", color: "#475569" }}>{activeEvent.description || "No description provided."}</p>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>DATE</span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{activeEvent.date}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>TIME</span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{activeEvent.startTime} - {activeEvent.endTime}</span>
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>ASSIGN TO</span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{activeEvent.assignedTo || "Unassigned"}</span>
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>LOCATION</span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{activeEvent.location || "None"}</span>
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>CUSTOMER</span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{activeEvent.customer || "Internal"}</span>
                </div>
                <div className="col-3 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>PRIORITY</span>
                  <span className={`badge-priority ${activeEvent.priority.toLowerCase()}`} style={{ fontSize: "9px" }}>{activeEvent.priority}</span>
                </div>
                <div className="col-3 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>STATUS</span>
                  <span className="badge bg-secondary" style={{ fontSize: "9px", fontWeight: "700" }}>{activeEvent.status}</span>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-2 border-top flex-wrap gap-2">
              <div className="d-flex gap-2">
                <button type="button" className="btn-profile-secondary" onClick={() => handleToggleStatus(activeEvent)}>
                  {activeEvent.status === "Completed" ? "Reopen" : "Mark Completed"}
                </button>
                <button type="button" className="btn-profile-secondary" onClick={() => handleDuplicateEvent(activeEvent)}>
                  Duplicate
                </button>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn-profile-secondary" onClick={() => { setEditEventForm({ ...activeEvent }); setShowDetailsModal(false); setShowEditModal(true); }}>
                  Edit
                </button>
                <button type="button" className="btn-profile-secondary text-danger" onClick={() => { setShowDetailsModal(false); setShowDeleteConfirm(true); }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Event Form */}
      {showEditModal && activeEvent && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-pencil-square"></i> Edit Event</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => { setShowEditModal(false); setShowDetailsModal(true); }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="row g-3">
                
                <div className="col-12 modal-form-group">
                  <label>Event Title</label>
                  <input 
                    type="text" 
                    value={editEventForm.title} 
                    onChange={(e) => setEditEventForm(prev => ({ ...prev, title: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Category</label>
                  <select 
                    value={editEventForm.type} 
                    onChange={(e) => setEditEventForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Call">Call</option>
                    <option value="Reminder">Reminder</option>
                    <option value="Demo">Demo</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={editEventForm.date} 
                    onChange={(e) => setEditEventForm(prev => ({ ...prev, date: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Start Time</label>
                  <input 
                    type="text" 
                    value={editEventForm.startTime} 
                    onChange={(e) => setEditEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>End Time</label>
                  <input 
                    type="text" 
                    value={editEventForm.endTime} 
                    onChange={(e) => setEditEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Assign To</label>
                  <input 
                    type="text" 
                    value={editEventForm.assignedTo} 
                    onChange={(e) => setEditEventForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    value={editEventForm.location} 
                    onChange={(e) => setEditEventForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Customer (optional)</label>
                  <input 
                    type="text" 
                    value={editEventForm.customer} 
                    onChange={(e) => setEditEventForm(prev => ({ ...prev, customer: e.target.value }))}
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Priority</label>
                  <select 
                    value={editEventForm.priority} 
                    onChange={(e) => setEditEventForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="col-12 modal-form-group">
                  <label>Description</label>
                  <textarea 
                    rows={2} 
                    value={editEventForm.description}
                    onChange={(e) => setEditEventForm(prev => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>

              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => { setShowEditModal(false); setShowDetailsModal(true); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-profile-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation Overlay */}
      {showDeleteConfirm && activeEvent && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "350px", maxWidth: "90%" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#ef4444", marginBottom: "14px" }}>
              Delete this event?
            </h4>
            <p style={{ fontSize: "12.5px", color: "#64748b" }}>Are you sure you want to permanently delete event "<strong>{activeEvent.title}</strong>"?</p>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
              <button type="button" className="btn-profile-secondary font-weight-700" onClick={() => { setShowDeleteConfirm(false); setShowDetailsModal(true); }}>
                Cancel
              </button>
              <button type="button" className="btn-profile-primary bg-danger text-white" style={{ border: "none" }} onClick={handleDeleteConfirmSubmit}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ----------------------------------------------------
// SIMPLE CRM TASKS MODULE COMPONENT (WITH CRUD)
// ----------------------------------------------------
const TasksPage = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, profile }) => {
  const [activeCategory, setActiveCategory] = useState("My Tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Selection & Drawer states
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states (Create)
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: TODAY,
    dueTime: "12:00 PM",
    assignedTo: profile?.displayName || "Me",
    category: "Sales",
    status: "Pending",
    notes: ""
  });

  // Form states (Edit)
  const [editTaskForm, setEditTaskForm] = useState({
    id: null,
    title: "",
    description: "",
    priority: "Medium",
    dueDate: TODAY,
    dueTime: "12:00 PM",
    assignedTo: "",
    category: "Sales",
    status: "Pending",
    notes: ""
  });

  // Sidebar counters
  const myTasksCount = (tasks || []).filter(t => t.status !== "Completed").length;
  const overdueCount = (tasks || []).filter(t => t.dueDate < TODAY && t.status !== "Completed").length;
  const newCount = (tasks || []).filter(t => t.status === "Pending").length;
  const dueTodayCount = (tasks || []).filter(t => t.dueDate === TODAY && t.status !== "Completed").length;
  const upcomingCount = (tasks || []).filter(t => t.dueDate > TODAY && t.status !== "Completed").length;
  const completedCount = (tasks || []).filter(t => t.status === "Completed").length;
  const allTasksCount = (tasks || []).length;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    onAddTask({
      ...newTaskForm,
      id: Date.now(),
      createdBy: profile?.displayName || "Lakshman Janjanam",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    // Reset Form
    setNewTaskForm({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: TODAY,
      dueTime: "12:00 PM",
      assignedTo: profile?.displayName || "Me",
      category: "Sales",
      status: "Pending",
      notes: ""
    });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTaskForm.title.trim()) return;
    const updated = {
      ...editTaskForm,
      updatedAt: new Date().toISOString()
    };
    onUpdateTask(updated);
    setSelectedTask(updated);
    setShowEditModal(false);
    setShowDetailsDrawer(true);
  };

  const handleToggleTaskStatus = (task, e) => {
    e.stopPropagation(); // Prevent opening details drawer
    const updatedStatus = task.status === "Completed" ? "Pending" : "Completed";
    onUpdateTask({
      ...task,
      status: updatedStatus,
      updatedAt: new Date().toISOString()
    });
    if (selectedTask && selectedTask.id === task.id) {
      setSelectedTask(prev => ({ ...prev, status: updatedStatus }));
    }
  };

  // Get active category tasks
  const getCategoryTasks = () => {
    switch (activeCategory) {
      case "My Tasks":
        return (tasks || []).filter(t => t.status !== "Completed");
      case "Overdue":
        return (tasks || []).filter(t => t.dueDate < TODAY && t.status !== "Completed");
      case "New":
        return (tasks || []).filter(t => t.status === "Pending");
      case "Due Today":
        return (tasks || []).filter(t => t.dueDate === TODAY && t.status !== "Completed");
      case "Upcoming":
        return (tasks || []).filter(t => t.dueDate > TODAY && t.status !== "Completed");
      case "Completed":
        return (tasks || []).filter(t => t.status === "Completed");
      case "All Tasks":
      default:
        return tasks || [];
    }
  };

  const categoryTasks = getCategoryTasks();

  // Apply search and dropdown filters
  const finalTasks = categoryTasks.filter(t => {
    const matchesSearch = (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.category || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;

    let matchesDate = true;
    if (dateFilter === "Today") {
      matchesDate = t.dueDate === TODAY;
    } else if (dateFilter === "This Week") {
      matchesDate = t.dueDate >= THIS_WEEK_START && t.dueDate <= THIS_WEEK_END;
    } else if (dateFilter === "This Month") {
      matchesDate = (t.dueDate || "").startsWith(THIS_MONTH_PREFIX);
    }

    return matchesSearch && matchesPriority && matchesCategory && matchesDate;
  });

  const formatTaskDueDateText = (dateStr) => {
    if (dateStr === TODAY) return "Due Today";
    if (dateStr === TOMORROW) return "Tomorrow";

    const diffDays = Math.round(
      (new Date(`${dateStr}T00:00:00`) - new Date(`${TODAY}T00:00:00`)) / 86400000
    );
    if (diffDays > 1 && diffDays < 7) {
      return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });
    }

    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${day} ${months[monthIdx] || ""}`;
    }
    return dateStr;
  };

  return (
    <div className="dashboard-card-flat">
      <div className="card-flat-title-bar">
        <h3><i className="bi bi-check2-square"></i> My Tasks</h3>
      </div>

      <div className="tasks-layout-wrapper">
        
        {/* LEFT PANEL: Task categories sidebar */}
        <div className="tasks-left-sidebar">
          {[
            { name: "My Tasks", count: myTasksCount },
            { name: "Overdue", count: overdueCount },
            { name: "New", count: newCount },
            { name: "Due Today", count: dueTodayCount },
            { name: "Upcoming", count: upcomingCount },
            { name: "Completed", count: completedCount },
            { name: "All Tasks", count: allTasksCount }
          ].map(cat => (
            <button 
              key={cat.name}
              className={`tasks-sidebar-item ${activeCategory === cat.name ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.name)}
            >
              <span>{cat.name}</span>
              <span className="tasks-sidebar-badge">{cat.count}</span>
            </button>
          ))}
        </div>

        {/* RIGHT PANEL: Task List */}
        <div className="tasks-right-content">
          <div className="empty-state-card">
            <i className="bi bi-clipboard empty-state-icon"></i>
            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 6px 0" }}>No Tasks Found</h4>
            <p className="text-muted mb-0" style={{ fontSize: "12px" }}>There are no tasks available.</p>
          </div>
        </div>

      </div>
      {/* MODAL: Create New Task */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-plus-lg"></i> New Task</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => setShowAddModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Task Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter task name..."
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-12 modal-form-group">
                  <label>Description</label>
                  <textarea 
                    rows={2} 
                    placeholder="Describe the task..."
                    value={newTaskForm.description}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Priority</label>
                  <select 
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Category</label>
                  <select 
                    value={newTaskForm.category}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Sales">Sales</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Call">Call</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Reminder">Reminder</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Due Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 05:00 PM"
                    value={newTaskForm.dueTime}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, dueTime: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Assign To</label>
                  <input 
                    type="text" 
                    value={newTaskForm.assignedTo}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Status</label>
                  <select 
                    value={newTaskForm.status}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="col-12 modal-form-group">
                  <label>Notes</label>
                  <textarea 
                    rows={2} 
                    placeholder="Internal work notes..."
                    value={newTaskForm.notes}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, notes: e.target.value }))}
                  ></textarea>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-profile-primary">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Task */}
      {showEditModal && selectedTask && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-pencil-square"></i> Edit Task</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => { setShowEditModal(false); setShowDetailsDrawer(true); }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Task Name</label>
                  <input 
                    type="text" 
                    value={editTaskForm.title}
                    onChange={(e) => setEditTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-12 modal-form-group">
                  <label>Description</label>
                  <textarea 
                    rows={2} 
                    value={editTaskForm.description}
                    onChange={(e) => setEditTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Priority</label>
                  <select 
                    value={editTaskForm.priority}
                    onChange={(e) => setEditTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Category</label>
                  <select 
                    value={editTaskForm.category}
                    onChange={(e) => setEditTaskForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Sales">Sales</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Call">Call</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Reminder">Reminder</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={editTaskForm.dueDate}
                    onChange={(e) => setEditTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Due Time</label>
                  <input 
                    type="text" 
                    value={editTaskForm.dueTime}
                    onChange={(e) => setEditTaskForm(prev => ({ ...prev, dueTime: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Assign To</label>
                  <input 
                    type="text" 
                    value={editTaskForm.assignedTo}
                    onChange={(e) => setEditTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Status</label>
                  <select 
                    value={editTaskForm.status}
                    onChange={(e) => setEditTaskForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="col-12 modal-form-group">
                  <label>Notes</label>
                  <textarea 
                    rows={2} 
                    value={editTaskForm.notes}
                    onChange={(e) => setEditTaskForm(prev => ({ ...prev, notes: e.target.value }))}
                  ></textarea>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => { setShowEditModal(false); setShowDetailsDrawer(true); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-profile-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Side Drawer */}
      {showDetailsDrawer && selectedTask && (
        <>
          {/* Overlay mask */}
          <div 
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: "rgba(15, 23, 42, 0.15)",
              zIndex: 1099
            }}
            onClick={() => setShowDetailsDrawer(false)}
          ></div>
          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "420px",
            maxWidth: "100%",
            background: "var(--crm-card)",
            boxShadow: "-4px 0 24px rgba(15, 23, 42, 0.15)",
            zIndex: 1100,
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            height: "100vh"
          }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
              <h3 className="mb-0" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-dark)", textTransform: "uppercase" }}>Task Details</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => setShowDetailsDrawer(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Details Body */}
            <div className="d-flex flex-column gap-3 flex-grow-1 overflow-y-auto" style={{ paddingRight: "4px" }}>
              <div>
                <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>TITLE</span>
                <strong style={{ fontSize: "15px", color: "var(--crm-dark)" }}>{selectedTask.title}</strong>
              </div>

              <div>
                <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>DESCRIPTION</span>
                <p className="mb-0" style={{ fontSize: "12.5px", color: "#475569", lineHeight: "1.4" }}>{selectedTask.description || "No description provided."}</p>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>ASSIGNED BY</span>
                  <span style={{ fontSize: "12.5px", fontWeight: "600" }}>{selectedTask.createdBy || "System"}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>ASSIGNED TO</span>
                  <span style={{ fontSize: "12.5px", fontWeight: "600" }}>{selectedTask.assignedTo || "Unassigned"}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>DUE DATE</span>
                  <span style={{ fontSize: "12.5px", fontWeight: "600" }}>{selectedTask.dueDate}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>DUE TIME</span>
                  <span style={{ fontSize: "12.5px", fontWeight: "600" }}>{selectedTask.dueTime || "None"}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>PRIORITY</span>
                  <span className={`badge-priority ${selectedTask.priority.toLowerCase()}`} style={{ fontSize: "8.5px" }}>{selectedTask.priority}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>STATUS</span>
                  <span className={`badge bg-${selectedTask.status === "Completed" ? "success" : selectedTask.status === "In Progress" ? "warning" : "secondary"}`} style={{ fontSize: "8.5px", fontWeight: "700" }}>{selectedTask.status}</span>
                </div>
              </div>

              <div>
                <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>NOTES</span>
                <p className="mb-0 p-2 border rounded bg-light text-muted" style={{ fontSize: "11.5px", minHeight: "50px" }}>
                  {selectedTask.notes || "No notes available."}
                </p>
              </div>

              <div>
                <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>ATTACHMENTS</span>
                <div className="p-2 border rounded bg-light d-flex align-items-center gap-2" style={{ fontSize: "11.5px" }}>
                  <i className="bi bi-file-earmark-arrow-up text-primary"></i>
                  <span className="text-muted">No attachments uploaded</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="d-flex flex-column gap-2 border-top pt-3 mt-3">
              {selectedTask.status !== "Completed" ? (
                <button 
                  type="button" 
                  className="btn-profile-primary w-100" 
                  style={{ background: "#10b981" }}
                  onClick={() => {
                    const updated = { ...selectedTask, status: "Completed" };
                    onUpdateTask(updated);
                    setSelectedTask(updated);
                  }}
                >
                  <i className="bi bi-check2-circle"></i> Mark Complete
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn-profile-secondary w-100"
                  onClick={() => {
                    const updated = { ...selectedTask, status: "Pending" };
                    onUpdateTask(updated);
                    setSelectedTask(updated);
                  }}
                >
                  Reopen Task
                </button>
              )}
              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  className="btn-profile-secondary flex-grow-1"
                  onClick={() => {
                    setEditTaskForm({ ...selectedTask });
                    setShowDetailsDrawer(false);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button 
                  type="button" 
                  className="btn-profile-secondary text-danger flex-grow-1"
                  onClick={() => {
                    if (confirm("Delete this task?")) {
                      onDeleteTask(selectedTask.id);
                      setShowDetailsDrawer(false);
                      setSelectedTask(null);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

// ----------------------------------------------------
// CRM TEAM MANAGEMENT COMPONENT (WITH CRUD & SIDE DRAWER)
// ----------------------------------------------------
const TeamPage = ({ teamMembers, onAddMember, onUpdateMember, onDeleteMember }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selection states
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  // Form States (Create)
  const [newMemberForm, setNewMemberForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "Sales",
    designation: "",
    role: "Employee",
    manager: "",
    officeLocation: "Remote",
    joiningDate: TODAY,
    status: "Online",
    profileImage: ""
  });

  // Form States (Edit)
  const [editMemberForm, setEditMemberForm] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    designation: "",
    role: "Employee",
    manager: "",
    officeLocation: "Remote",
    joiningDate: "",
    status: "Online",
    profileImage: ""
  });

  // Photo Upload Handler
  const handlePhotoUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditMemberForm(prev => ({ ...prev, profileImage: reader.result }));
        } else {
          setNewMemberForm(prev => ({ ...prev, profileImage: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newMemberForm.firstName.trim() || !newMemberForm.lastName.trim()) return;
    onAddMember({
      ...newMemberForm,
      id: Date.now().toString()
    });
    // Reset Form
    setNewMemberForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      employeeId: "",
      department: "Sales",
      designation: "",
      role: "Employee",
      manager: "",
      officeLocation: "Remote",
      joiningDate: TODAY,
      status: "Online",
      profileImage: ""
    });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editMemberForm.firstName.trim() || !editMemberForm.lastName.trim()) return;
    onUpdateMember(editMemberForm);
    setSelectedMember(editMemberForm);
    setShowEditModal(false);
    setShowDetailsDrawer(true);
  };

  // Stats Calculations
  const totalEmployees = (teamMembers || []).length;
  const uniqueDepts = Array.from(new Set((teamMembers || []).map(m => m.department).filter(Boolean)));
  const totalDepartments = uniqueDepts.length;
  const totalManagers = (teamMembers || []).filter(m => m.role === "Manager").length;
  const totalOnline = (teamMembers || []).filter(m => m.status === "Online").length;

  // Department counts helper
  const getDeptEmployeeCount = (deptName) => {
    return (teamMembers || []).filter(m => m.department === deptName).length;
  };

  // Filters logic
  const filteredMembers = (teamMembers || []).filter(m => {
    const fullName = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                          (m.designation || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.employeeId || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === "All" || m.department === deptFilter;
    const matchesRole = roleFilter === "All" || m.role === roleFilter;
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (status === "Online") return "#10b981"; // Green
    if (status === "Away") return "#eab308"; // Yellow
    return "#64748b"; // Gray
  };

  return (
    <div className="dashboard-card-flat">
      
      {/* 1. Header */}
      <div className="mb-4 pb-3 border-bottom">
        <h3 className="mb-0" style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", color: "var(--crm-dark)", letterSpacing: "0.02em" }}>
          Team Management
        </h3>
      </div>

      {/* 2. Team Overview Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Employees", val: totalEmployees, icon: "bi-people", color: "var(--crm-primary)" },
          { label: "Departments", val: totalDepartments, icon: "bi-building", color: "#a855f7" },
          { label: "Managers", val: totalManagers, icon: "bi-person-badge", color: "#f97316" },
          { label: "Online", val: totalOnline, icon: "bi-wifi", color: "#10b981" }
        ].map((stat) => (
          <div className="col-6 col-md-3" key={stat.label}>
            <div className="p-3 border rounded-3 bg-light text-center h-100 d-flex flex-column justify-content-center">
              <span className="text-muted d-block mb-1" style={{ fontSize: "10.5px", fontWeight: "755", textTransform: "uppercase" }}>
                {stat.label}
              </span>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <i className={`bi ${stat.icon}`} style={{ color: stat.color, fontSize: "18px" }}></i>
                <strong style={{ fontSize: "20px", color: "var(--crm-dark)" }}>{stat.val}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr />

      {/* 3. Main Split View Wrapper */}
      <div className="team-layout-wrapper">
        
        {/* Left Column: Departments Filter Panel */}
        <div className="team-left-sidebar d-none d-md-flex flex-column gap-2">
          <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.02em", marginBottom: "4px" }}>
            Departments
          </h4>
          {[
            { name: "All", count: totalEmployees },
            { name: "Sales", count: getDeptEmployeeCount("Sales") },
            { name: "Engineering", count: getDeptEmployeeCount("Engineering") },
            { name: "Marketing", count: getDeptEmployeeCount("Marketing") },
            { name: "Support", count: getDeptEmployeeCount("Support") },
            { name: "HR", count: getDeptEmployeeCount("HR") }
          ].map(d => (
            <div 
              key={d.name}
              className={`team-dept-card ${deptFilter === d.name ? "active" : ""}`}
              onClick={() => setDeptFilter(d.name)}
            >
              <div className="team-dept-name">{d.name}</div>
              <div className="team-dept-count">{d.count} Employees</div>
            </div>
          ))}
        </div>

        {/* Right Column: Members Listing */}
        <div className="team-right-content">
          <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.02em", marginBottom: "4px" }}>
            Team Members
          </h4>
          
          {filteredMembers.length > 0 ? (
            <div className="team-grid-container">
              {filteredMembers.map(member => {
                const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase();
                return (
                  <div className="team-member-card" key={member.id}>
                    {member.profileImage ? (
                      <img src={member.profileImage} alt="Profile" className="member-card-photo" />
                    ) : (
                      <div className="member-card-initials">{initials || "U"}</div>
                    )}
                    <h5 className="member-card-name">{member.firstName} {member.lastName}</h5>
                    <span className="member-card-designation">{member.designation}</span>
                    <span className="member-card-dept">{member.department}</span>

                    <div className="member-card-meta">
                      <span>ID: <strong>{member.employeeId || "None"}</strong></span>
                      <span>Email: <strong>{member.email}</strong></span>
                      <span>Phone: <strong>{member.phone}</strong></span>
                    </div>

                    <div className={`member-status-indicator ${member.status.toLowerCase()}`}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: getStatusColor(member.status), display: "inline-block" }}></span>
                      {member.status}
                    </div>

                    <button 
                      className="profile-view-link mt-2" 
                      onClick={() => {
                        setSelectedMember(member);
                        setShowDetailsDrawer(true);
                      }}
                    >
                      View Profile →
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-card py-5">
              <i className="bi bi-people empty-state-icon" style={{ fontSize: "52px" }}></i>
              <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 8px 0" }}>No Team Members Found</h4>
              <p className="text-muted mb-0" style={{ fontSize: "12.5px" }}>
                No employees have been added yet.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: Add Team Member */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "550px", maxWidth: "95%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-person-plus"></i> Add Team Member</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => setShowAddModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="row g-3">
                <div className="col-md-6 modal-form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter first name..."
                    value={newMemberForm.firstName}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, firstName: e.target.value }))}
                    required 
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter last name..."
                    value={newMemberForm.lastName}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, lastName: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Official Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter official email..."
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    required 
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. +91 98765 43210"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Employee ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. EMP-1001"
                    value={newMemberForm.employeeId}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    required 
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Department</label>
                  <select 
                    value={newMemberForm.department}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Designation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sales Executive, Developer"
                    value={newMemberForm.designation}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, designation: e.target.value }))}
                    required 
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Role</label>
                  <select 
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Manager</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Lakshman Janjanam"
                    value={newMemberForm.manager}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, manager: e.target.value }))}
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Office Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Remote, Hyderabad"
                    value={newMemberForm.officeLocation}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, officeLocation: e.target.value }))}
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Joining Date</label>
                  <input 
                    type="date" 
                    value={newMemberForm.joiningDate}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, joiningDate: e.target.value }))}
                    required 
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Employment Status</label>
                  <select 
                    value={newMemberForm.status}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Online">Online</option>
                    <option value="Away">Away</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div className="col-12 modal-form-group">
                  <label>Profile Photo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, false)} 
                  />
                  {newMemberForm.profileImage && (
                    <img 
                      src={newMemberForm.profileImage} 
                      alt="Preview" 
                      style={{ width: "40px", height: "40px", borderRadius: "50%", marginTop: "10px", objectFit: "cover" }} 
                    />
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-profile-primary">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Team Member */}
      {showEditModal && selectedMember && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "550px", maxWidth: "95%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-pencil-square"></i> Edit Team Member</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => { setShowEditModal(false); setShowDetailsDrawer(true); }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="row g-3">
                <div className="col-md-6 modal-form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    value={editMemberForm.firstName}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, firstName: e.target.value }))}
                    required 
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    value={editMemberForm.lastName}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, lastName: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Official Email</label>
                  <input 
                    type="email" 
                    value={editMemberForm.email}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    required 
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={editMemberForm.phone}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                    required 
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Employee ID</label>
                  <input 
                    type="text" 
                    value={editMemberForm.employeeId}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    required 
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Department</label>
                  <select 
                    value={editMemberForm.department}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Designation</label>
                  <input 
                    type="text" 
                    value={editMemberForm.designation}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, designation: e.target.value }))}
                    required 
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Role</label>
                  <select 
                    value={editMemberForm.role}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Manager</label>
                  <input 
                    type="text" 
                    value={editMemberForm.manager}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, manager: e.target.value }))}
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Office Location</label>
                  <input 
                    type="text" 
                    value={editMemberForm.officeLocation}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, officeLocation: e.target.value }))}
                  />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Joining Date</label>
                  <input 
                    type="date" 
                    value={editMemberForm.joiningDate}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, joiningDate: e.target.value }))}
                    required 
                  />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Employment Status</label>
                  <select 
                    value={editMemberForm.status}
                    onChange={(e) => setEditMemberForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Online">Online</option>
                    <option value="Away">Away</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div className="col-12 modal-form-group">
                  <label>Profile Photo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, true)} 
                  />
                  {editMemberForm.profileImage && (
                    <img 
                      src={editMemberForm.profileImage} 
                      alt="Preview" 
                      style={{ width: "40px", height: "40px", borderRadius: "50%", marginTop: "10px", objectFit: "cover" }} 
                    />
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => { setShowEditModal(false); setShowDetailsDrawer(true); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-profile-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Member Profile Details Side panel / Drawer */}
      {showDetailsDrawer && selectedMember && (
        <>
          {/* Overlay mask */}
          <div 
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: "rgba(15, 23, 42, 0.15)",
              zIndex: 1099
            }}
            onClick={() => setShowDetailsDrawer(false)}
          ></div>
          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "440px",
            maxWidth: "100%",
            background: "var(--crm-card)",
            boxShadow: "-4px 0 24px rgba(15, 23, 42, 0.15)",
            zIndex: 1100,
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            height: "100vh"
          }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
              <h3 className="mb-0" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-dark)", textTransform: "uppercase" }}>Employee Profile</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => setShowDetailsDrawer(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Details Body */}
            <div className="d-flex flex-column gap-3 flex-grow-1 overflow-y-auto" style={{ paddingRight: "4px" }}>
              <div className="text-center pb-3 border-bottom">
                {selectedMember.profileImage ? (
                  <img src={selectedMember.profileImage} alt="Profile" className="member-card-photo" style={{ width: "90px", height: "90px" }} />
                ) : (
                  <div className="member-card-initials mx-auto" style={{ width: "90px", height: "90px", fontSize: "32px" }}>
                    {`${selectedMember.firstName?.[0] || ""}${selectedMember.lastName?.[0] || ""}`.toUpperCase()}
                  </div>
                )}
                <h4 style={{ fontSize: "16px", fontWeight: "800", margin: "10px 0 2px 0" }}>{selectedMember.firstName} {selectedMember.lastName}</h4>
                <span className="badge bg-primary-subtle text-primary" style={{ fontSize: "11px", fontWeight: "700" }}>{selectedMember.designation}</span>
              </div>

              <div className="row g-3" style={{ fontSize: "12.5px" }}>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>EMPLOYEE ID</span>
                  <strong>{selectedMember.employeeId || "None"}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>DEPARTMENT</span>
                  <strong>{selectedMember.department}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>JOINING DATE</span>
                  <strong>{selectedMember.joiningDate}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>OFFICE LOCATION</span>
                  <strong>{selectedMember.officeLocation || "Remote"}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>REPORTING MANAGER</span>
                  <strong>{selectedMember.manager || "Not assigned"}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>ROLE</span>
                  <strong>{selectedMember.role}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>OFFICIAL EMAIL</span>
                  <strong>{selectedMember.email}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>PHONE NUMBER</span>
                  <strong>{selectedMember.phone}</strong>
                </div>
              </div>

              <hr />

              <div style={{ fontSize: "12.5px" }}>
                <span className="text-muted d-block mb-1" style={{ fontSize: "10px", fontWeight: "700" }}>ACTIVE PROJECTS</span>
                <strong>CRM Custom Implementation</strong>
              </div>

              <div style={{ fontSize: "12.5px" }}>
                <span className="text-muted d-block mb-1" style={{ fontSize: "10px", fontWeight: "700" }}>CURRENT TASKS</span>
                <div className="d-flex flex-column gap-1">
                  <span className="text-muted"><i className="bi bi-dot"></i> Follow up Amazon pitch</span>
                  <span className="text-muted"><i className="bi bi-dot"></i> Draft contract parameters</span>
                </div>
              </div>

              <div style={{ fontSize: "12.5px" }}>
                <span className="text-muted d-block mb-1" style={{ fontSize: "10px", fontWeight: "700" }}>PERFORMANCE STATUS</span>
                <span className="badge bg-success" style={{ fontSize: "10px", fontWeight: "700" }}>Excellent</span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="d-flex flex-column gap-2 border-top pt-3 mt-3">
              <button 
                type="button" 
                className="btn-profile-primary w-100"
                onClick={() => alert(`Opening collaboration messaging panel with ${selectedMember.firstName}...`)}
              >
                <i className="bi bi-chat-left-dots"></i> Message
              </button>
              <button 
                type="button" 
                className="btn-profile-secondary w-100"
                onClick={() => alert(`Redirecting to tasks creator to assign task to ${selectedMember.firstName}...`)}
              >
                <i className="bi bi-plus-check"></i> Assign Task
              </button>
              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  className="btn-profile-secondary flex-grow-1"
                  onClick={() => {
                    setEditMemberForm({ ...selectedMember });
                    setShowDetailsDrawer(false);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button 
                  type="button" 
                  className="btn-profile-secondary text-danger flex-grow-1"
                  onClick={() => {
                    if (confirm(`Remove ${selectedMember.firstName} ${selectedMember.lastName} from team?`)) {
                      onDeleteMember(selectedMember.id);
                      setShowDetailsDrawer(false);
                      setSelectedMember(null);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

// ----------------------------------------------------
// MAIN CONTAINER COMPOSITION
// ----------------------------------------------------

// ----------------------------------------------------
// CRM NOTIFICATIONS PAGE COMPONENT
// ----------------------------------------------------
const NotificationsPage = ({ notifications, onMarkAllRead, onUpdateNotification, onDeleteNotification, setActiveMenu }) => {
  const [filterTab, setFilterTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "Lead Created":
      case "Customer Assigned":
      case "Lead Assigned":
        return "bi-person-plus-fill text-primary";
      case "Task Completed":
      case "Task Assigned":
        return "bi-check2-square text-success";
      case "Meeting Reminder":
      case "Calendar Event":
        return "bi-calendar-event text-warning";
      case "Deal Updated":
      case "Deal Won":
      case "Deal Lost":
        return "bi-cash-coin text-success";
      case "Invoice Paid":
      case "Payment Received":
        return "bi-credit-card text-success";
      case "Team Invitation":
        return "bi-envelope text-info";
      case "Comment Mention":
        return "bi-chat-text text-primary";
      case "Security Alert":
      case "Password Changed":
        return "bi-shield-lock text-danger";
      case "System Update":
      case "Profile Updated":
        return "bi-hdd-network text-secondary";
      default:
        return "bi-bell text-secondary";
    }
  };

  // Dynamic counts calculations
  const totalCount = (notifications || []).length;
  const unreadCount = (notifications || []).filter(n => n.unread && !n.archived).length;
  const archivedCount = (notifications || []).filter(n => n.archived).length;
  const todayCount = (notifications || []).filter(n => n.date === TODAY && !n.archived).length;

  // Filter list
  const filteredList = (notifications || []).filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterTab === "Unread") return matchesSearch && n.unread && !n.archived;
    if (filterTab === "Mentions") return matchesSearch && n.type === "Comment Mention" && !n.archived;
    if (filterTab === "Archived") return matchesSearch && n.archived;
    return matchesSearch && !n.archived;
  });

  return (
    <div className="dashboard-card-flat">
      
      {/* Header Panel */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h3 className="mb-1" style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", color: "var(--crm-dark)", letterSpacing: "0.02em" }}>
            Notifications
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
            Manage all system, customer, team and activity notifications in one place.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button 
            type="button" 
            className="btn-profile-secondary py-1.5 px-3" 
            style={{ fontSize: "12px", fontWeight: "700" }} 
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
          >
            <i className="bi bi-check-all"></i> Mark All as Read
          </button>
          <button 
            type="button" 
            className="btn-profile-secondary py-1.5 px-3" 
            style={{ fontSize: "12px", fontWeight: "700" }} 
            onClick={() => setActiveMenu("settings")}
          >
            <i className="bi bi-sliders"></i> Notification Settings
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="notif-layout-wrapper">
        
        {/* Main Content Area */}
        <div className="notif-main-content">
          
          {/* Tab Filters and Search */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-2">
            <div className="notif-filter-tabs">
              <button className={`notif-filter-tab ${filterTab === "All" ? "active" : ""}`} onClick={() => setFilterTab("All")}>
                All <span className="notif-badge-blue">{totalCount - archivedCount}</span>
              </button>
              <button className={`notif-filter-tab ${filterTab === "Unread" ? "active" : ""}`} onClick={() => setFilterTab("Unread")}>
                Unread {unreadCount > 0 && <span className="notif-badge-blue">{unreadCount}</span>}
              </button>
              <button className={`notif-filter-tab ${filterTab === "Mentions" ? "active" : ""}`} onClick={() => setFilterTab("Mentions")}>
                Mentions
              </button>
              <button className={`notif-filter-tab ${filterTab === "Archived" ? "active" : ""}`} onClick={() => setFilterTab("Archived")}>
                Archived <span className="notif-badge-blue">{archivedCount}</span>
              </button>
            </div>

            <div className="nav-search-bar" style={{ width: "240px", background: "var(--crm-bg)", border: "1px solid var(--crm-border)" }}>
              <i className="bi bi-search"></i>
              <input 
                type="text" 
                className="nav-search-input" 
                placeholder="Search notifications..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Notifications Listing */}
          {filteredList.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {filteredList.map(notif => (
                <div key={notif.id} className={`notif-card-item ${notif.unread ? "unread" : ""}`}>
                  <div className="notif-icon-box">
                    <i className={`bi ${getNotifIcon(notif.type)}`}></i>
                  </div>
                  <div className="notif-card-body">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h5 className="notif-card-title mb-0">{notif.title}</h5>
                      {notif.unread && <span className="badge bg-primary" style={{ fontSize: "8px", fontWeight: "800" }}>NEW</span>}
                    </div>
                    <p className="notif-card-desc mb-2">{notif.description}</p>
                    <div className="notif-card-meta">
                      <span><i className="bi bi-clock"></i> {notif.time}</span>
                      <span>•</span>
                      <span className={`notif-priority-badge ${notif.priority.toLowerCase()}`}>
                        {notif.priority} Priority
                      </span>
                    </div>
                  </div>
                  <div className="notif-actions-panel">
                    <button 
                      type="button" 
                      className="notif-action-btn"
                      title={notif.unread ? "Mark as Read" : "Mark as Unread"}
                      onClick={() => onUpdateNotification({ ...notif, unread: !notif.unread })}
                    >
                      <i className={notif.unread ? "bi bi-envelope-open" : "bi bi-envelope"}></i>
                    </button>
                    <button 
                      type="button" 
                      className="notif-action-btn"
                      title={notif.archived ? "Unarchive" : "Archive"}
                      onClick={() => onUpdateNotification({ ...notif, archived: !notif.archived })}
                    >
                      <i className={notif.archived ? "bi bi-archive-fill" : "bi bi-archive"}></i>
                    </button>
                    <button 
                      type="button" 
                      className="notif-action-btn btn-delete"
                      title="Delete"
                      onClick={() => onDeleteNotification(notif.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-card py-5">
              <i className="bi bi-bell-slash empty-state-icon" style={{ fontSize: "52px" }}></i>
              <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 8px 0" }}>
                {searchQuery ? "No Matching Notifications" : "No notifications yet"}
              </h4>
              <p className="text-muted mb-4" style={{ fontSize: "12.5px", maxWidth: "420px", margin: "0 auto 20px auto" }}>
                {searchQuery 
                  ? "Try refining your search terms or checking another filter tab." 
                  : "You'll receive notifications here when important CRM activities, task assignments, or team invitations happen."}
              </p>
              <button 
                className="btn-profile-primary" 
                style={{ padding: "10px 24px" }} 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Right Sidebar Summary */}
        <div className="notif-side-summary">
          <div className="p-3 border rounded-3 bg-light">
            <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.02em", marginBottom: "12px" }}>
              Summary
            </h4>
            <div className="d-flex flex-column gap-3" style={{ fontSize: "12.5px" }}>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Unread Notifications</span>
                <strong className={unreadCount > 0 ? "text-primary" : ""}>{unreadCount}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Today's Notifications</span>
                <strong>{todayCount}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">This Week</span>
                <strong>{totalCount - archivedCount}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center border-top pt-2">
                <span className="text-muted">Archived</span>
                <strong>{archivedCount}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

// ----------------------------------------------------
// MAIN CONTAINER COMPOSITION
// ----------------------------------------------------

// ----------------------------------------------------
// CRM DOCUMENTS COMPONENT (WITH FOLDER & FILE CRUD)
// ----------------------------------------------------
const DocumentsPage = ({ documents, onUpload, onCreateFolder, onDelete, onUpdate, profile }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  // Popup Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Form states
  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "Contract",
    department: "Sales",
    description: "",
    visibility: "Public",
    sizeVal: 1.5, // MB
    extension: "PDF"
  });

  const [folderForm, setFolderForm] = useState({
    name: "",
    department: "Sales"
  });

  const [renameValue, setRenameValue] = useState("");
  const [moveDeptValue, setMoveDeptValue] = useState("Sales");

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) return;
    const extensionMap = {
      PDF: ".pdf",
      DOCX: ".docx",
      XLSX: ".xlsx",
      CSV: ".csv",
      PPT: ".ppt",
      PNG: ".png",
      JPG: ".jpg",
      ZIP: ".zip"
    };
    const extension = extensionMap[uploadForm.extension] || ".pdf";
    onUpload({
      id: Date.now().toString(),
      name: uploadForm.name.trim() + extension,
      type: "File",
      category: uploadForm.category,
      department: uploadForm.department,
      uploadedBy: profile.firstName ? `${profile.firstName} ${profile.lastName}` : "Me",
      size: `${uploadForm.sizeVal} MB`,
      sizeBytes: uploadForm.sizeVal * 1024 * 1024,
      lastModified: TODAY,
      status: uploadForm.visibility === "Private" ? "Private" : uploadForm.visibility === "Public" ? "Active" : "Shared",
      description: uploadForm.description,
      extension: extension
    });
    // Reset Form
    setUploadForm({
      name: "",
      category: "Contract",
      department: "Sales",
      description: "",
      visibility: "Public",
      sizeVal: 1.5,
      extension: "PDF"
    });
    setShowUploadModal(false);
  };

  const handleFolderSubmit = (e) => {
    e.preventDefault();
    if (!folderForm.name.trim()) return;
    onCreateFolder({
      id: Date.now().toString(),
      name: folderForm.name.trim(),
      type: "Folder",
      category: "Directory",
      department: folderForm.department,
      uploadedBy: profile.firstName ? `${profile.firstName} ${profile.lastName}` : "Me",
      size: "-",
      sizeBytes: 0,
      lastModified: TODAY,
      status: "Active",
      description: "Document folder container",
      extension: "Folder"
    });
    // Reset Form
    setFolderForm({
      name: "",
      department: "Sales"
    });
    setShowFolderModal(false);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!renameValue.trim() || !selectedDoc) return;
    // Keep original extension if file
    let newName = renameValue.trim();
    if (selectedDoc.type === "File" && selectedDoc.extension && !newName.endsWith(selectedDoc.extension)) {
      newName += selectedDoc.extension;
    }
    onUpdate({
      ...selectedDoc,
      name: newName
    });
    setSelectedDoc(null);
    setShowRenameModal(false);
  };

  const handleMoveSubmit = (e) => {
    e.preventDefault();
    if (!selectedDoc) return;
    onUpdate({
      ...selectedDoc,
      department: moveDeptValue
    });
    setSelectedDoc(null);
    setShowMoveModal(false);
  };

  const getFileIcon = (item) => {
    if (item.type === "Folder") return "bi-folder-fill text-warning";
    const ext = (item.extension || "").toLowerCase();
    switch (ext) {
      case ".pdf": return "bi-file-earmark-pdf-fill text-danger";
      case ".docx": return "bi-file-earmark-word-fill text-primary";
      case ".xlsx": return "bi-file-earmark-excel-fill text-success";
      case ".csv": return "bi-filetype-csv text-success";
      case ".ppt": return "bi-file-earmark-ppt-fill text-warning";
      case ".png":
      case ".jpg":
      case ".jpeg":
        return "bi-file-earmark-image-fill text-info";
      case ".zip": return "bi-file-earmark-zip-fill text-warning";
      default: return "bi-file-earmark-fill text-secondary";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active": return "bg-success-subtle text-success";
      case "Archived": return "bg-secondary-subtle text-secondary";
      case "Private": return "bg-danger-subtle text-danger";
      case "Shared": return "bg-primary-subtle text-primary";
      default: return "bg-light text-dark";
    }
  };

  // Calculations
  const totalDocs = (documents || []).filter(d => d.type === "File").length;
  const totalFolders = (documents || []).filter(d => d.type === "Folder").length;
  const totalSizeBytes = (documents || []).reduce((acc, d) => acc + (d.sizeBytes || 0), 0);
  
  const getStorageString = (bytes) => {
    if (bytes === 0) return "0.00 KB";
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const recentUploads = (documents || [])
    .filter(d => d.type === "File")
    .slice(0, 3);

  // Filters logic
  const filteredDocs = (documents || []).filter(d => {
    const nameMatches = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (d.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = catFilter === "All" || d.category === catFilter;
    const matchesDept = deptFilter === "All" || d.department === deptFilter;
    
    // Type Filter
    let matchesType = true;
    if (typeFilter !== "All") {
      if (typeFilter === "Folder") matchesType = d.type === "Folder";
      else matchesType = d.type === "File" && d.name.toLowerCase().endsWith(typeFilter.toLowerCase());
    }

    const matchesStatus = statusFilter === "All" || d.status === statusFilter;

    return nameMatches && matchesCat && matchesDept && matchesType && matchesStatus;
  });

  // Sort
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === "Name") return a.name.localeCompare(b.name);
    if (sortBy === "Oldest") return a.id.localeCompare(b.id);
    return b.id.localeCompare(a.id); // Newest
  });

  return (
    <div className="dashboard-card-flat">
      
      {/* 1. Header */}
      <div className="mb-4 pb-3 border-bottom">
        <h3 className="mb-1" style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", color: "var(--crm-dark)", letterSpacing: "0.02em" }}>
          Documents
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
          Browse and manage company files.
        </p>
      </div>

      {/* 2. Top Filter and Sort Controls */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="nav-search-bar" style={{ width: "200px", background: "var(--crm-bg)", border: "1px solid var(--crm-border)" }}>
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              className="nav-search-input" 
              placeholder="Search Documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select className="form-select py-1 px-3" style={{ width: "130px", fontSize: "12.5px", height: "36px" }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="All">Category</option>
            <option value="Contract">Contract</option>
            <option value="Proposal">Proposal</option>
            <option value="Invoice">Invoice</option>
            <option value="Directory">Folder</option>
            <option value="Internal">Internal</option>
          </select>

          <select className="form-select py-1 px-3" style={{ width: "130px", fontSize: "12.5px", height: "36px" }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="All">Department</option>
            <option value="Sales">Sales</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Support">Support</option>
            <option value="HR">HR</option>
          </select>

          <select className="form-select py-1 px-3" style={{ width: "120px", fontSize: "12.5px", height: "36px" }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">File Type</option>
            <option value="Folder">Folder</option>
            <option value=".pdf">PDF</option>
            <option value=".docx">Word</option>
            <option value=".xlsx">Excel</option>
            <option value=".zip">ZIP</option>
          </select>

          <select className="form-select py-1 px-3" style={{ width: "110px", fontSize: "12.5px", height: "36px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">Status</option>
            <option value="Active">Active</option>
            <option value="Private">Private</option>
            <option value="Shared">Shared</option>
          </select>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted" style={{ fontSize: "12px", fontWeight: "700" }}>Sort By:</span>
          <select className="form-select py-1 px-3" style={{ width: "120px", fontSize: "12.5px", height: "36px" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="Name">Name</option>
          </select>
        </div>
      </div>

      {/* 3. Main Split View Layout */}
      <div className="team-layout-wrapper">
        
        {/* Left Side: Document Listing */}
        <div className="team-right-content">
          {sortedDocs.length > 0 ? (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="table-responsive bg-white rounded-3 border d-none d-md-block">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                  <thead className="table-light text-muted" style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                    <tr>
                      <th>File Name</th>
                      <th>Category</th>
                      <th>Department</th>
                      <th>Uploaded By</th>
                      <th>Size</th>
                      <th>Last Modified</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDocs.map(doc => (
                      <tr key={doc.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <i className={`bi ${getFileIcon(doc)}`} style={{ fontSize: "18px" }}></i>
                            <strong className="text-dark">{doc.name}</strong>
                          </div>
                        </td>
                        <td><span className="text-muted">{doc.category}</span></td>
                        <td><span className="badge bg-light text-dark">{doc.department}</span></td>
                        <td><span className="text-muted">{doc.uploadedBy}</span></td>
                        <td><span className="text-muted">{doc.size}</span></td>
                        <td><span className="text-muted">{doc.lastModified}</span></td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(doc.status)}`}>{doc.status}</span>
                        </td>
                        <td className="text-end">
                          <div className="dropdown d-inline-block">
                            <button className="btn btn-sm btn-light border py-1 px-2 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                              Options
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" style={{ fontSize: "12.5px" }}>
                              <li>
                                <button 
                                  className="dropdown-item" 
                                  type="button"
                                  onClick={() => alert(`Opening preview window for ${doc.name}...`)}
                                >
                                  <i className="bi bi-eye"></i> View
                                </button>
                              </li>
                              {doc.type === "File" && (
                                <li>
                                  <button 
                                    className="dropdown-item" 
                                    type="button"
                                    onClick={() => alert(`Starting download for ${doc.name} (${doc.size})...`)}
                                  >
                                    <i className="bi bi-download"></i> Download
                                  </button>
                                </li>
                              )}
                              <li>
                                <button 
                                  className="dropdown-item" 
                                  type="button"
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setRenameValue(doc.name.replace(doc.extension || "", ""));
                                    setShowRenameModal(true);
                                  }}
                                >
                                  <i className="bi bi-pencil-square"></i> Rename
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item" 
                                  type="button"
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setMoveDeptValue(doc.department);
                                    setShowMoveModal(true);
                                  }}
                                >
                                  <i className="bi bi-folder-symlink"></i> Move
                                </button>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button 
                                  className="dropdown-item text-danger" 
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
                                      onDelete(doc.id);
                                    }
                                  }}
                                >
                                  <i className="bi bi-trash"></i> Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE STACKED CARDS VIEW */}
              <div className="d-md-none d-flex flex-column gap-2">
                {sortedDocs.map(doc => (
                  <div key={doc.id} className="p-3 bg-white rounded-3 border">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${getFileIcon(doc)}`} style={{ fontSize: "18px" }}></i>
                        <strong className="text-dark">{doc.name}</strong>
                      </div>
                      
                      {/* Actions dropdown */}
                      <div className="dropdown">
                        <button className="btn btn-sm btn-light border py-1 px-2 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          Options
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" style={{ fontSize: "12.5px" }}>
                          <li>
                            <button className="dropdown-item" type="button" onClick={() => alert(`Opening preview window for ${doc.name}...`)}>
                              <i className="bi bi-eye"></i> View
                            </button>
                          </li>
                          {doc.type === "File" && (
                            <li>
                              <button className="dropdown-item" type="button" onClick={() => alert(`Starting download for ${doc.name} (${doc.size})...`)}>
                                <i className="bi bi-download"></i> Download
                              </button>
                            </li>
                          )}
                          <li>
                            <button className="dropdown-item" type="button" onClick={() => {
                              setSelectedDoc(doc);
                              setRenameValue(doc.name.replace(doc.extension || "", ""));
                              setShowRenameModal(true);
                            }}>
                              <i className="bi bi-pencil-square"></i> Rename
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item" type="button" onClick={() => {
                              setSelectedDoc(doc);
                              setMoveDeptValue(doc.department);
                              setShowMoveModal(true);
                            }}>
                              <i className="bi bi-folder-symlink"></i> Move
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button className="dropdown-item text-danger" type="button" onClick={() => {
                              if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
                                onDelete(doc.id);
                              }
                            }}>
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2 text-muted" style={{ fontSize: "11.5px" }}>
                      <span>Category: <strong>{doc.category}</strong></span>
                      <span>•</span>
                      <span>Dept: <span className="badge bg-light text-dark">{doc.department}</span></span>
                      <span>•</span>
                      <span>Size: <strong>{doc.size}</strong></span>
                    </div>
                    <div className="mt-2 pt-2 border-top d-flex justify-content-between text-muted align-items-center" style={{ fontSize: "11px" }}>
                      <span>By: {doc.uploadedBy}</span>
                      <span>Mod: {doc.lastModified}</span>
                      <span className={`badge ${getStatusBadgeClass(doc.status)}`}>{doc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state-card py-5">
              <i className="bi bi-folder2-open empty-state-icon" style={{ fontSize: "52px" }}></i>
              <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 8px 0" }}>No Documents Found</h4>
              <p className="text-muted mb-0" style={{ fontSize: "12.5px" }}>
                There are currently no company documents.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Upload Document */}
      {showUploadModal && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "500px", maxWidth: "95%" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-file-earmark-arrow-up"></i> Upload Document</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => setShowUploadModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Choose File</label>
                  <input 
                    type="file" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const nameParts = file.name.split(".");
                        const ext = nameParts.length > 1 ? "." + nameParts.pop() : "";
                        const baseName = nameParts.join(".");
                        setUploadForm(prev => ({
                          ...prev,
                          name: baseName,
                          sizeVal: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
                          extension: ext.replace(".", "").toUpperCase() || "PDF"
                        }));
                      }
                    }}
                    required
                  />
                </div>

                <div className="col-md-8 modal-form-group">
                  <label>Document Name (without extension)</label>
                  <input 
                    type="text" 
                    placeholder="Enter document name..." 
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="col-md-4 modal-form-group">
                  <label>File Type</label>
                  <select 
                    value={uploadForm.extension}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, extension: e.target.value }))}
                  >
                    <option value="PDF">PDF (.pdf)</option>
                    <option value="DOCX">Word (.docx)</option>
                    <option value="XLSX">Excel (.xlsx)</option>
                    <option value="CSV">CSV (.csv)</option>
                    <option value="PPT">PowerPoint (.ppt)</option>
                    <option value="PNG">PNG Image (.png)</option>
                    <option value="JPG">JPG Image (.jpg)</option>
                    <option value="ZIP">ZIP Archive (.zip)</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Category</label>
                  <select 
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Contract">Contract</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Internal">Internal Documentation</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Department</label>
                  <select 
                    value={uploadForm.department}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div className="col-12 modal-form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    placeholder="Short description about file context..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>

                <div className="col-12">
                  <label className="d-block mb-2" style={{ fontSize: "11px", fontWeight: "750", textTransform: "uppercase", color: "#64748b" }}>Visibility</label>
                  <div className="d-flex gap-4">
                    {["Public", "Private", "Team Only"].map(vis => (
                      <div className="form-check" key={vis}>
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="visRadio" 
                          id={`vis-${vis}`} 
                          checked={uploadForm.visibility === vis}
                          onChange={() => setUploadForm(prev => ({ ...prev, visibility: vis }))}
                        />
                        <label className="form-check-label" htmlFor={`vis-${vis}`} style={{ fontSize: "12px", fontWeight: "600" }}>{vis}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-profile-primary">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Folder */}
      {showFolderModal && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "420px", maxWidth: "95%" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-folder-plus"></i> Create Folder</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => setShowFolderModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleFolderSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Folder Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter folder name..." 
                    value={folderForm.name}
                    onChange={(e) => setFolderForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="col-12 modal-form-group">
                  <label>Department</label>
                  <select 
                    value={folderForm.department}
                    onChange={(e) => setFolderForm(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => setShowFolderModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-profile-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Rename */}
      {showRenameModal && selectedDoc && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "400px", maxWidth: "95%" }}>
            <div className="card-flat-title-bar">
              <h3>Rename Document</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => { setShowRenameModal(false); setSelectedDoc(null); }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleRenameSubmit}>
              <div className="modal-form-group mb-3">
                <label>New Name</label>
                <input 
                  type="text" 
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  required
                />
                {selectedDoc.type === "File" && selectedDoc.extension && (
                  <span className="text-muted mt-1 d-block" style={{ fontSize: "11px" }}>Extension {selectedDoc.extension} will be preserved automatically.</span>
                )}
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => { setShowRenameModal(false); setSelectedDoc(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-profile-primary">
                  Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Move */}
      {showMoveModal && selectedDoc && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "400px", maxWidth: "95%" }}>
            <div className="card-flat-title-bar">
              <h3>Move Department</h3>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "12px", border: "none", background: "transparent" }}
                onClick={() => { setShowMoveModal(false); setSelectedDoc(null); }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleMoveSubmit}>
              <div className="modal-form-group mb-3">
                <label>Move to Department</label>
                <select 
                  value={moveDeptValue}
                  onChange={(e) => setMoveDeptValue(e.target.value)}
                >
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Support">Support</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => { setShowMoveModal(false); setSelectedDoc(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-profile-primary">
                  Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// ----------------------------------------------------
// NEWS / ANNOUNCEMENTS PAGE
// ----------------------------------------------------
const NewsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("crm_token");
      const res = await fetch(`${API_BASE}/news`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnnouncements(data.announcements || []);
      } else {
        setError(data.message || "Failed to load announcements.");
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchAnnouncements(); }, []);

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const deptColors = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];
  const getDeptColor = (dept = "") => deptColors[dept.charCodeAt(0) % deptColors.length];

  return (
    <div className="dashboard-card-flat">
      {/* Header */}
      <div className="mb-4 pb-3 border-bottom">
        <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          NEWS
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: "12.5px" }}>
          Company announcements and internal updates.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="d-flex align-items-center justify-content-center py-5 gap-3">
          <div style={{ width: "20px", height: "20px", border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span className="text-muted" style={{ fontSize: "13px" }}>Loading announcements...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="empty-state-card py-5">
          <i className="bi bi-wifi-off empty-state-icon"></i>
          <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 6px" }}>Connection Error</h4>
          <p className="text-muted mb-3" style={{ fontSize: "12px" }}>{error}</p>
          <button className="btn-profile-primary" style={{ padding: "8px 20px" }} onClick={fetchAnnouncements}>
            <i className="bi bi-arrow-clockwise"></i> Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && announcements.length === 0 && (
        <div className="empty-state-card py-5">
          <i className="bi bi-newspaper empty-state-icon"></i>
          <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 6px" }}>No Announcements</h4>
          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>No announcements available.</p>
        </div>
      )}

      {/* Announcements Feed */}
      {!loading && !error && announcements.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {announcements.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#ffffff",
                border: "1px solid #eef0f6",
                borderRadius: "14px",
                padding: "20px 22px",
                boxShadow: "0 1px 5px rgba(15,23,42,0.05)",
              }}
            >
              {/* Author Row */}
              <div className="d-flex align-items-center gap-3 mb-3">
                {/* Avatar */}
                {item.authorAvatar ? (
                  <img
                    src={item.authorAvatar}
                    alt={item.authorName}
                    style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
                    background: getDeptColor(item.department),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: "800", fontSize: "14px", letterSpacing: "-0.5px",
                  }}>
                    {getInitials(item.authorName)}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                    {item.authorName}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                    {item.department}
                    {item.createdAt && (
                      <> &nbsp;•&nbsp; {formatDate(item.createdAt)}</>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#2563eb", margin: "0 0 8px" }}>
                {item.title}
              </h4>

              {/* Content */}
              <p style={{ fontSize: "13.5px", color: "#334155", lineHeight: "1.65", margin: 0, whiteSpace: "pre-line" }}>
                {item.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ----------------------------------------------------
// MAIN CONTAINER COMPOSITION
// ----------------------------------------------------
const Dashboard = () => {

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarActive, setMobileSidebarActive] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dropdowns
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMsgMenu, setShowMsgMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Single Source of Truth Profile State (synchronized via LocalStorage)
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_profile_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return { ...defaultProfileData, ...parsed };
        }
      }
    } catch (e) {
      console.error("Error reading crm_profile_v2", e);
    }
    return defaultProfileData;
  });

  // ── Employee Workspace Dashboard State (backend-ready, all default to 0) ──
  // TODO: Replace each null with an API call (e.g. useEffect → fetch/axios)
  const [employeeStats, setEmployeeStats] = useState(null);
  // Shape: { leavesThisYear: 0, overdueTasks: 0, overtimeHours: 0, projects: 0 }

  const [workSummary, setWorkSummary] = useState(null);
  // Shape: { todaysMeetings: 0, pendingTasks: 0, openDeals: 0, upcomingEvents: 0, recentActivity: 0, notifications: 0 }

  const [productivity, setProductivity] = useState(null);
  // Shape: { weeklyPercent: 0 }

  const [attendance, setAttendance] = useState(null);
  // Shape: { monthlyPercent: 0 }

  const [leaveData, setLeaveData] = useState(null);
  // Shape: { teamOnLeave: [], requests: [] }

  const [leaveBalance, setLeaveBalance] = useState(null);
  // Shape: { remainingLeave: 0, earnedLeave: 0 }

  const [otherEvents, setOtherEvents] = useState([]);
  // Shape: Array of event objects

  // Single Source of Truth Events State (synchronized via LocalStorage)
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_events_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading crm_events_v2", e);
    }
    return initialEvents;
  });

  // Today's tasks checklist state
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_tasks_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading crm_tasks_v2", e);
    }
    return initialTasks;
  });

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem("crm_profile_v2", JSON.stringify(updatedProfile));
    triggerNotification(
      "Profile Updated",
      "Your personal CRM profile details were modified successfully.",
      "Low",
      "Profile Updated"
    );
  };

  const handleSaveSettings = (settingsData) => {
    const updatedProfile = { ...profile, ...settingsData };
    setProfile(updatedProfile);
    localStorage.setItem("crm_profile_v2", JSON.stringify(updatedProfile));
    triggerNotification(
      "Settings Saved",
      "System and notification preferences have been saved.",
      "Low",
      "System Update"
    );
  };

  // Dark mode removed — light theme only

  const handleAddEvent = (newEvent) => {
    const updatedEvents = [...(events || []), newEvent];
    setEvents(updatedEvents);
    localStorage.setItem("crm_events_v2", JSON.stringify(updatedEvents));
    triggerNotification(
      "Calendar Event Created",
      `Event "${newEvent.title}" has been scheduled for ${newEvent.date} at ${newEvent.startTime}.`,
      "Medium",
      "Calendar Event"
    );
  };

  const handleUpdateEvent = (updatedEvent) => {
    const updatedEvents = (events || []).map(ev => ev.id === updatedEvent.id ? updatedEvent : ev);
    setEvents(updatedEvents);
    localStorage.setItem("crm_events_v2", JSON.stringify(updatedEvents));
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = (events || []).filter(ev => ev.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem("crm_events_v2", JSON.stringify(updatedEvents));
  };

  const handleAddTask = (newTask) => {
    const updated = [...(tasks || []), newTask];
    setTasks(updated);
    localStorage.setItem("crm_tasks_v2", JSON.stringify(updated));
    triggerNotification(
      "Task Assigned",
      `Task "${newTask.title}" has been assigned to ${newTask.assignedTo || "yourself"}.`,
      newTask.priority === "High" ? "High" : "Medium",
      "Task Assigned"
    );
  };

  const handleUpdateTask = (updatedTask) => {
    const updated = (tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updated);
    localStorage.setItem("crm_tasks_v2", JSON.stringify(updated));
  };

  const handleDeleteTask = (taskId) => {
    const updated = (tasks || []).filter(t => t.id !== taskId);
    setTasks(updated);
    localStorage.setItem("crm_tasks_v2", JSON.stringify(updated));
  };

  // Single Source of Truth Team Members State (starts empty by default for production CRM style)
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_team_members_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading crm_team_members_v2", e);
    }
    return [];
  });

  const handleAddMember = (newMember) => {
    const updated = [...(teamMembers || []), newMember];
    setTeamMembers(updated);
    localStorage.setItem("crm_team_members_v2", JSON.stringify(updated));
    triggerNotification(
      "Team Invitation Sent",
      `Invitation sent to ${newMember.firstName} ${newMember.lastName} as ${newMember.designation} in ${newMember.department}.`,
      "Medium",
      "Team Invitation"
    );
  };

  const handleUpdateMember = (updatedMember) => {
    const updated = (teamMembers || []).map(m => m.id === updatedMember.id ? updatedMember : m);
    setTeamMembers(updated);
    localStorage.setItem("crm_team_members_v2", JSON.stringify(updated));
  };

  const handleDeleteMember = (memberId) => {
    const updated = (teamMembers || []).filter(m => m.id !== memberId);
    setTeamMembers(updated);
    localStorage.setItem("crm_team_members_v2", JSON.stringify(updated));
  };

  // Single Source of Truth Notifications State (starts empty by default for production CRM style)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_notifications_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading crm_notifications_v2", e);
    }
    return [];
  });

  const triggerNotification = (title, desc, priority = "Medium", type = "System Update") => {
    const newNotif = {
      id: Date.now().toString(),
      title,
      description: desc,
      time: "Just now",
      date: TODAY,
      unread: true,
      archived: false,
      priority,
      type
    };
    setNotifications(prev => {
      const updated = [newNotif, ...(prev || [])];
      localStorage.setItem("crm_notifications_v2", JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllNotifsRead = () => {
    const updated = (notifications || []).map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    localStorage.setItem("crm_notifications_v2", JSON.stringify(updated));
  };

  const handleUpdateNotification = (updatedNotif) => {
    const updated = (notifications || []).map(n => n.id === updatedNotif.id ? updatedNotif : n);
    setNotifications(updated);
    localStorage.setItem("crm_notifications_v2", JSON.stringify(updated));
  };

  const handleDeleteNotification = (notifId) => {
    const updated = (notifications || []).filter(n => n.id !== notifId);
    setNotifications(updated);
    localStorage.setItem("crm_notifications_v2", JSON.stringify(updated));
  };

  // Single Source of Truth Documents State (starts empty by default for production CRM style)
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_documents_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading crm_documents_v2", e);
    }
    return [];
  });

  const handleUploadDocument = (newDoc) => {
    const updated = [newDoc, ...(documents || [])];
    setDocuments(updated);
    localStorage.setItem("crm_documents_v2", JSON.stringify(updated));
    triggerNotification(
      "Document Uploaded",
      `Document "${newDoc.name}" (${newDoc.size}) uploaded successfully to ${newDoc.department} department.`,
      "Medium",
      "System Update"
    );
  };

  const handleCreateFolder = (newFolder) => {
    const updated = [newFolder, ...(documents || [])];
    setDocuments(updated);
    localStorage.setItem("crm_documents_v2", JSON.stringify(updated));
    triggerNotification(
      "Folder Created",
      `Folder "${newFolder.name}" created successfully inside ${newFolder.department} department directory.`,
      "Low",
      "System Update"
    );
  };

  const handleDeleteDocument = (docId) => {
    const targetDoc = (documents || []).find(d => d.id === docId);
    const updated = (documents || []).filter(d => d.id !== docId);
    setDocuments(updated);
    localStorage.setItem("crm_documents_v2", JSON.stringify(updated));
    if (targetDoc) {
      triggerNotification(
        "Document Deleted",
        `Document "${targetDoc.name}" has been deleted from the company repository.`,
        "Low",
        "System Update"
      );
    }
  };

  const handleUpdateDocument = (updatedDoc) => {
    const updated = (documents || []).map(d => d.id === updatedDoc.id ? updatedDoc : d);
    setDocuments(updated);
    localStorage.setItem("crm_documents_v2", JSON.stringify(updated));
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  const completedTasksCount = (tasks || []).filter(t => t.status === "Completed").length;
  const pendingTasksCount = (tasks || []).filter(t => t.status !== "Completed").length;
  const taskProgressPercent = (tasks || []).length > 0 ? Math.round((completedTasksCount / (tasks || []).length) * 100) : 0;

  // Sync dashboard stat card and schedules with the actual dynamic events list!
  const todaysEventsList = (events || []).filter(ev => ev.date === TODAY)
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  const activeDealsCount = (events || []).filter(e => e.type === "Demo" || e.type === "Meeting").length;

  const isFirstTime = (events || []).length === 0 && 
                      (tasks || []).length === 0 && 
                      (teamMembers || []).length === 0 && 
                      (!profile.firstName || profile.firstName.trim() === "");

  return (
    <>
      <style>{`/* Styling layout resets for CRM dashboard & Me profile */

:root {
  --crm-primary: #2563eb;
  --crm-dark: #0f172a;
  --crm-bg: #f8fafc;
  --crm-card: #ffffff;
  --crm-border: #e2e8f0;
  --crm-hover: #eff6ff;
  --sidebar-w: 250px;
  --sidebar-collapsed-w: 72px;
  --topbar-h: 72px;
}

body {
  margin: 0;
  background-color: var(--crm-bg);
  color: var(--crm-dark);
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.crm-dashboard-layout {
  position: relative;
  min-height: 100vh;
  background: var(--crm-bg);
}

/* TOP NAVBAR */
.crm-top-navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: var(--topbar-h);
  background: var(--crm-card);
  border-bottom: 1px solid var(--crm-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-brand {
  text-decoration: none;
  font-weight: 700;
  font-size: 18px;
  color: var(--crm-dark);
  display: flex;
  align-items: center;
  gap: 6px;
}

.logo-brand i {
  color: var(--crm-primary);
  font-size: 20px;
}

.nav-hamburger-btn {
  background: transparent;
  border: none;
  color: var(--crm-dark);
  font-size: 20px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease, transform 0.1s ease;
}

.nav-hamburger-btn:hover {
  background: var(--crm-hover);
  color: var(--crm-primary);
}

.theme-toggle-navbar-btn:hover {
  background: var(--crm-hover) !important;
}

.nav-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 6px 12px;
  width: 300px;
}

.nav-search-bar i {
  color: #94a3b8;
  font-size: 13px;
}

.nav-search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 13px;
  color: var(--crm-dark);
}

.nav-right-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-icon-control {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 16px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
}

.nav-icon-control:hover {
  background: var(--crm-hover);
  color: var(--crm-primary);
}

.control-badge-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: #ffffff;
  font-size: 8px;
  font-weight: 700;
  border-radius: 50%;
  width: 13px;
  height: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ffffff;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
}

.profile-trigger:hover {
  background: var(--crm-hover);
}

.avatar-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e2e8f0;
  color: var(--crm-primary);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.profile-name-text {
  font-size: 13px;
  font-weight: 600;
}

/* Dropdown Overlay Panels */
.controls-dropdown-panel {
  position: absolute;
  top: 52px;
  background: var(--crm-card);
  border: 1px solid var(--crm-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  padding: 6px;
  display: flex;
  flex-direction: column;
  z-index: 1100;
}

.controls-dropdown-panel.notifs { right: 140px; width: 280px; }
.controls-dropdown-panel.msgs { right: 100px; width: 260px; }
.controls-dropdown-panel.profile { right: 20px; width: 180px; }

.dropdown-header-label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 6px 10px;
  border-bottom: 1px solid var(--crm-border);
}

.dropdown-row-link {
  display: flex;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--crm-dark);
  font-size: 12px;
  transition: background 0.1s ease;
}

.dropdown-row-link:hover {
  background: var(--crm-hover);
}

.dropdown-row-link.logout-btn {
  color: #ef4444;
}

.dropdown-row-link.logout-btn:hover {
  background: #fef2f2;
}

/* SIDEBAR STYLING */
/* =============================================
   ENTERPRISE CRM SIDEBAR — Zoho/ERP Style
   ============================================= */
.crm-sidebar-menu {
  position: fixed;
  top: var(--topbar-h);
  bottom: 0;
  left: 0;
  width: var(--sidebar-w);
  background: #ffffff;
  border-right: 1px solid #E5E7EB;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 8px 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 300ms ease;
}

.sidebar-links-stack {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* Every nav item — full-width stacked box */
.sidebar-links-stack li {
  width: 100%;
  position: relative;
}

.sidebar-links-stack li button {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 58px;
  padding: 0 0 0 22px;
  border: none;
  border-bottom: 1px solid #E5E7EB;
  border-radius: 0;
  background: #ffffff;
  color: #374151;
  font-weight: 500;
  font-size: 13.5px;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease;
}

.sidebar-links-stack li button i {
  font-size: 17px;
  color: #9CA3AF;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
  transition: color 0.2s ease;
}

.sidebar-nav-label {
  transition: opacity 300ms ease, width 300ms ease;
  overflow: hidden;
  white-space: nowrap;
}

/* Hover state */
.sidebar-links-stack li button:hover {
  background: #EFF6FF;
  color: #1D4ED8;
}

.sidebar-links-stack li button:hover i {
  color: #2563EB;
}

/* Active state — blue gradient */
.sidebar-links-stack li.active button {
  background: linear-gradient(135deg, #4F8DFD 0%, #2F6BFF 100%);
  color: #ffffff;
  font-weight: 600;
  border-bottom-color: transparent;
}

.sidebar-links-stack li.active button i {
  color: #ffffff;
}

/* Logout item separator */
.sidebar-logout-item {
  margin-top: auto !important;
  border-top: 2px solid #E5E7EB;
}

.sidebar-logout-item button {
  color: #EF4444 !important;
}

.sidebar-logout-item button i {
  color: #EF4444 !important;
}

.sidebar-logout-item button:hover {
  background: #FEF2F2 !important;
  color: #DC2626 !important;
}

.sidebar-logout-item button:hover i {
  color: #DC2626 !important;
}

/* =============================================
   COLLAPSED SIDEBAR
   ============================================= */
.crm-dashboard-layout.collapsed-sidebar .crm-sidebar-menu {
  width: var(--sidebar-collapsed-w);
}

.crm-dashboard-layout.collapsed-sidebar .sidebar-nav-label {
  opacity: 0;
  width: 0;
  pointer-events: none;
}

/* Tooltip on hover when collapsed */
.crm-dashboard-layout.collapsed-sidebar .sidebar-links-stack li button[title]:hover::after {
  content: attr(title);
  position: absolute;
  left: calc(var(--sidebar-collapsed-w) + 8px);
  top: 50%;
  transform: translateY(-50%);
  background: #1E293B;
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* MAIN VIEWPORT */
.crm-viewport-content {
  flex: 1;
  margin-top: var(--topbar-h);
  margin-left: var(--sidebar-w);
  padding: 24px;
  min-height: calc(100vh - var(--topbar-h));
  transition: margin-left 300ms ease;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.crm-dashboard-layout.collapsed-sidebar .crm-viewport-content {
  margin-left: var(--sidebar-collapsed-w);
}

/* COMPACT WELCOME CARD */
.compact-welcome-box {
  background: var(--crm-card);
  border: 1px solid var(--crm-border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.welcome-focus-badge {
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
}

.welcome-bullet-item {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.welcome-bullet-dot {
  color: #2563eb;
  margin-right: 4px;
}

@media (min-width: 768px) {
  .border-start-custom {
    border-left: 1px solid var(--crm-border);
  }
}

/* COMPACT PROFILE WIDGET */
.compact-profile-widget {
  background: var(--crm-card);
  border: 1px solid var(--crm-border);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.profile-widget-name {
  font-size: 14px;
  font-weight: 800;
  margin: 0 0 2px 0;
  color: var(--crm-dark);
}

.profile-widget-desc {
  font-size: 11.5px;
  color: #64748b;
  margin: 0;
}

.profile-widget-dept {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  margin: 2px 0 6px 0;
}

.profile-status-dot {
  font-size: 11px;
  font-weight: 750;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.profile-view-link {
  font-size: 12px;
  color: var(--crm-primary);
  font-weight: 700;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
}

.profile-view-link:hover {
  text-decoration: underline;
}

/* STAT CARD COMPACT */
.stat-card-compact {
  background: var(--crm-card);
  border: 1px solid var(--crm-border);
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-label-compact {
  font-size: 12.5px;
  font-weight: 700;
  color: #64748b;
}

.stat-value-compact {
  font-size: 26px;
  font-weight: 850;
  color: var(--crm-dark);
  margin: 6px 0;
}

.stat-footer-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
}

/* TODAY'S SCHEDULE CARD */
.schedule-item-row {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

.schedule-item-row:last-child {
  border-bottom: none;
}

.schedule-time {
  font-size: 12.5px;
  font-weight: 750;
  color: var(--crm-primary);
  min-width: 45px;
}

.schedule-desc {
  display: flex;
  flex-direction: column;
}

.schedule-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--crm-dark);
}

.schedule-company {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

/* PIPELINE FUNNEL CARD */
.pipeline-funnel-container {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
}

.pipeline-funnel-stage {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  text-align: center;
}

.pipeline-funnel-stage.active {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.pipeline-stage-lbl {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.pipeline-stage-val {
  font-size: 16px;
  font-weight: 800;
  color: var(--crm-dark);
  margin-top: 2px;
}

.funnel-arrow-connector {
  color: #cbd5e1;
  font-size: 14px;
}

/* WIDGET DESIGNS */
.dashboard-card-flat {
  background: var(--crm-card);
  border: 1px solid var(--crm-border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-flat-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
}

.card-flat-title-bar h3 {
  font-size: 13.5px;
  font-weight: 750;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--crm-dark);
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-flat-title-bar h3 i {
  color: var(--crm-primary);
  font-size: 14px;
}

/* Timeline layout */
.crm-timeline-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  padding-left: 12px;
}

.crm-timeline-stack::before {
  content: "";
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 3px;
  width: 1px;
  background: #e2e8f0;
}

.timeline-row-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  position: relative;
}

.timeline-dot-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--crm-primary);
  margin-top: 5px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.timeline-detail-body {
  font-size: 12.5px;
  color: #475569;
  flex: 1;
}

.timeline-detail-body strong {
  color: var(--crm-dark);
}

.timeline-time-meta {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 1px;
}

/* Smart Recommendations */
.ai-panel-flat {
  border: 1px solid #bfdbfe;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

.ai-panel-flat::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: var(--crm-primary);
}

.ai-suggestion-badge {
  background: #dbeafe;
  color: #1e40af;
  font-size: 10px;
  font-weight: 750;
  padding: 2px 8px;
  border-radius: 4px;
}

.ai-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 14px 0;
}

.ai-row-bullet {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
}

.ai-row-bullet i {
  color: var(--crm-primary);
  font-size: 14px;
}

.btn-ai-insights {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: var(--crm-primary);
  color: #ffffff;
  border: none;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-ai-insights:hover {
  background: #1d4ed8;
}

.ai-expandable-box {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #bfdbfe;
  font-size: 12px;
  color: #1e40af;
  line-height: 1.4;
}

/* Interactive Calendar Page styling */
.calendar-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 700;
  font-size: 12.5px;
  color: #64748b;
  margin-bottom: 8px;
}

.calendar-grid-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  border-top: 1px solid var(--crm-border);
  border-left: 1px solid var(--crm-border);
}

.calendar-grid-cell {
  background: var(--crm-card);
  border-right: 1px solid var(--crm-border);
  border-bottom: 1px solid var(--crm-border);
  min-height: 95px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: background 0.1s ease;
}

.calendar-grid-cell:hover {
  background: var(--crm-hover);
}

.calendar-grid-cell.out-of-month {
  background: #f8fafc;
  color: #cbd5e1;
}

.calendar-day-num {
  font-size: 12px;
  font-weight: 750;
  color: var(--crm-dark);
}

.calendar-cell-event {
  font-size: 9px;
  font-weight: 750;
  padding: 2px 4px;
  border-radius: 4px;
  color: #ffffff;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Me Profile specific inputs styling */
.profile-photo-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1px dashed var(--crm-border);
  border-radius: 12px;
  background: #f8fafc;
}

.read-only-input {
  background-color: #f1f5f9 !important;
  color: #64748b !important;
  cursor: not-allowed;
  font-weight: 600;
}

.modal-form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-form-group label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.modal-form-group input, .modal-form-group select, .modal-form-group textarea {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--crm-border);
  font-size: 13px;
  outline: none;
  background-color: var(--crm-card);
  color: var(--crm-dark);
}

.modal-form-group input:focus, .modal-form-group select:focus, .modal-form-group textarea:focus {
  border-color: var(--crm-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.btn-profile-primary {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--crm-primary);
  color: #ffffff;
  border: none;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s ease;
}

.btn-profile-primary:hover {
  background: #1d4ed8;
}

.btn-profile-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--crm-card);
  color: var(--crm-dark);
  border: 1px solid var(--crm-border);
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
}

.btn-profile-secondary:hover {
  background: var(--crm-hover);
  color: var(--crm-primary);
  border-color: var(--crm-primary);
}

/* Clean Footer styling */
.clean-dashboard-footer {
  text-align: center;
  padding: 16px 0;
  border-top: 1px solid var(--crm-border);
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.clean-dashboard-footer span {
  font-weight: 600;
}

.clean-footer-links {
  display: flex;
  gap: 12px;
}

.clean-footer-links a {
  text-decoration: none;
  color: #94a3b8;
  font-weight: 600;
}

.clean-footer-links a:hover {
  color: var(--crm-primary);
}

/* Mobile Sidebar Drawer styling */
.hamburger-mobile-topbar {
  display: none;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 22px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .hamburger-mobile-topbar {
    display: block;
  }
  
  .sidebar-toggle {
    display: none;
  }
  
  .crm-sidebar-menu {
    transform: translateX(-100%);
  }
  
  .crm-dashboard-layout.mobile-sidebar-active .crm-sidebar-menu {
    transform: translateX(0);
    box-shadow: 10px 0 25px rgba(15, 23, 42, 0.08);
  }
  
  .crm-viewport-content {
    margin-left: 0 !important;
    padding: 16px;
  }
  
  .nav-search-bar {
    display: none;
  }
}

.mobile-drawer-overlay {
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(1.5px);
  z-index: 998;
}
 
 @media (max-width: 768px) {
   .crm-dashboard-layout.mobile-sidebar-active .mobile-drawer-overlay {
     display: block;
   }
 }
 
 /* Tasks Sidebar and Card layout styling */
 .tasks-layout-wrapper {
   display: flex;
   gap: 24px;
   align-items: flex-start;
   margin-top: 16px;
 }
 
 .tasks-left-sidebar {
   width: 200px;
   flex-shrink: 0;
   display: flex;
   flex-direction: column;
   gap: 4px;
 }
 
 .tasks-sidebar-item {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 10px 14px;
   border-radius: 8px;
   color: #475569;
   font-weight: 700;
   font-size: 13px;
   background: transparent;
   border: none;
   cursor: pointer;
   width: 100%;
   text-align: left;
   transition: all 0.15s ease;
 }
 
 .tasks-sidebar-item:hover {
   background: var(--crm-hover);
   color: var(--crm-primary);
 }
 
 .tasks-sidebar-item.active {
   background: var(--crm-primary);
   color: #ffffff;
 }
 
 .tasks-sidebar-badge {
   font-size: 11px;
   font-weight: 750;
   padding: 2px 8px;
   border-radius: 999px;
   background: #f1f5f9;
   color: #475569;
 }
 
 .tasks-sidebar-item.active .tasks-sidebar-badge {
   background: rgba(255, 255, 255, 0.2);
   color: #ffffff;
 }
 
 .tasks-right-content {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 16px;
 }
 
 .tasks-toolbar {
   background: var(--crm-card);
   border: 1px solid var(--crm-border);
   border-radius: 12px;
   padding: 12px;
   display: flex;
   gap: 10px;
   align-items: center;
   flex-wrap: wrap;
 }
 
 .task-row-card {
   background: var(--crm-card);
   border: 1px solid var(--crm-border);
   border-radius: 12px;
   padding: 16px;
   display: flex;
   align-items: center;
   gap: 16px;
   cursor: pointer;
   transition: all 0.15s ease;
 }
 
 .task-row-card:hover {
   border-color: var(--crm-primary);
   box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
   background: var(--crm-hover);
 }
 
 .task-row-checkbox {
   width: 18px;
   height: 18px;
   border-radius: 4px;
   cursor: pointer;
   border: 2px solid #94a3b8;
   display: flex;
   align-items: center;
   justify-content: center;
   flex-shrink: 0;
   transition: all 0.1s ease;
 }
 
 .task-row-checkbox.completed {
   border-color: #10b981;
   background-color: #10b981;
 }
 
 .task-row-checkbox i {
   color: white;
   font-size: 12px;
 }
 
 .empty-state-card {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: 60px 20px;
   text-align: center;
   border: 1px dashed var(--crm-border);
   border-radius: 16px;
   background: var(--crm-card);
   color: #64748b;
 }
 
 .empty-state-icon {
   font-size: 48px;
   color: #cbd5e1;
   margin-bottom: 16px;
 }
 
 @media (max-width: 768px) {
    .tasks-layout-wrapper {
      flex-direction: column;
    }
    .tasks-left-sidebar {
      width: 100%;
      flex-direction: row;
      flex-wrap: wrap;
    }
    .tasks-sidebar-item {
      width: auto;
      flex: 1 1 120px;
    }
  }
  
  /* Team Section layout styling */
  .team-layout-wrapper {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    margin-top: 16px;
  }
  
  .team-left-sidebar {
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .team-dept-card {
    background: var(--crm-card);
    border: 1px solid var(--crm-border);
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .team-dept-card:hover, .team-dept-card.active {
    border-color: var(--crm-primary);
    background: var(--crm-hover);
  }
  
  .team-dept-card.active {
    border-color: var(--crm-primary);
    background-color: var(--crm-hover);
    box-shadow: 0 0 0 1px var(--crm-primary);
  }
  
  .team-dept-name {
    font-weight: 700;
    font-size: 13px;
    color: var(--crm-dark);
    margin-bottom: 2px;
  }
  
  .team-dept-count {
    font-size: 11px;
    color: #64748b;
    font-weight: 650;
  }
  
  .team-right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .team-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .team-member-card {
    background: var(--crm-card);
    border: 1px solid var(--crm-border);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    transition: all 0.15s ease;
    position: relative;
  }
  
  .team-member-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
    border-color: var(--crm-primary);
  }
  
  .member-card-photo {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 12px;
  }
  
  .member-card-initials {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: #eff6ff;
    color: var(--crm-primary);
    font-size: 24px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    border: 2px solid var(--crm-primary);
  }
  
  .member-card-name {
    font-size: 15px;
    font-weight: 800;
    color: var(--crm-dark);
    margin-bottom: 4px;
  }
  
  .member-card-designation {
    font-size: 12px;
    font-weight: 700;
    color: var(--crm-primary);
    margin-bottom: 2px;
  }
  
  .member-card-dept {
    font-size: 11.5px;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .member-card-meta {
    font-size: 11px;
    color: #475569;
    font-weight: 600;
    margin-bottom: 12px;
    width: 100%;
    border-top: 1px solid #f1f5f9;
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .member-status-indicator {
    font-size: 11px;
    font-weight: 750;
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
    margin-bottom: 12px;
  }
  
  .member-status-indicator.online { color: #10b981; }
  .member-status-indicator.away { color: #eab308; }
  .member-status-indicator.offline { color: #64748b; }
  
  @media (max-width: 768px) {
    .team-layout-wrapper {
      flex-direction: column;
    }
    .team-left-sidebar {
      width: 100%;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  /* Split Calendar Layout Styles */
  .calendar-layout-wrapper {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    margin-top: 16px;
  }
  
  .calendar-left-main {
    flex: 7;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  
  .calendar-right-side {
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  .border-start-custom {
    border-left-width: 4px !important;
  }

  @media (max-width: 992px) {
    .calendar-layout-wrapper {
      flex-direction: column;
    }
    .calendar-left-main,
    .calendar-right-side {
      width: 100%;
      flex: none;
    }
  }

  /* Notifications Layout Styles */
  .notif-layout-wrapper {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    margin-top: 16px;
  }
  
  .notif-main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .notif-side-summary {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .notif-filter-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--crm-border);
    padding-bottom: 8px;
    flex-wrap: wrap;
  }
  
  .notif-filter-tab {
    background: transparent;
    border: none;
    padding: 8px 16px;
    font-weight: 700;
    font-size: 13px;
    color: #64748b;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;
  }
  
  .notif-filter-tab:hover {
    background: var(--crm-hover);
    color: var(--crm-primary);
  }
  
  .notif-filter-tab.active {
    background: var(--crm-primary);
    color: #ffffff;
  }
  
  .notif-badge-blue {
    background: var(--crm-primary);
    color: #ffffff;
    font-size: 10px;
    font-weight: 800;
    padding: 1px 6px;
    border-radius: 999px;
    display: inline-block;
  }
  
  .notif-filter-tab.active .notif-badge-blue {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .notif-card-item {
    background: var(--crm-card);
    border: 1px solid var(--crm-border);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    transition: all 0.15s ease;
  }
  
  .notif-card-item:hover {
    border-color: var(--crm-primary);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  }
  
  .notif-card-item.unread {
    background: #f8fafc;
    border-left: 4px solid var(--crm-primary);
  }
  
  .notif-icon-box {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .notif-card-body {
    flex: 1;
  }
  
  .notif-card-title {
    font-size: 13.5px;
    font-weight: 800;
    color: var(--crm-dark);
    margin-bottom: 4px;
  }
  
  .notif-card-desc {
    font-size: 12.5px;
    color: #475569;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  
  .notif-card-meta {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 11px;
    color: #64748b;
    font-weight: 650;
  }
  
  .notif-priority-badge {
    font-size: 9px;
    font-weight: 850;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 4px;
  }
  
  .notif-priority-badge.high { background: #fee2e2; color: #ef4444; }
  .notif-priority-badge.medium { background: #fef3c7; color: #d97706; }
  .notif-priority-badge.low { background: #f1f5f9; color: #64748b; }
  
  .notif-actions-panel {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }
  
  .notif-action-btn {
    background: transparent;
    border: 1px solid var(--crm-border);
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748b;
    font-size: 13px;
    transition: all 0.1s ease;
  }
  
  .notif-action-btn:hover {
    background: var(--crm-hover);
    color: var(--crm-primary);
    border-color: var(--crm-primary);
  }
  
  .notif-action-btn.btn-delete:hover {
    color: #ef4444;
    border-color: #fee2e2;
    background: #fff5f5;
  }
  
  }
  
  /* Light theme only — dark mode removed */
  
  @media (max-width: 768px) {
    .notif-layout-wrapper {
      flex-direction: column;
    }
    .notif-side-summary {
      width: 100%;
    }
  }
`}</style>

      <div className={`crm-dashboard-layout ${sidebarCollapsed ? "collapsed-sidebar" : ""} ${mobileSidebarActive ? "mobile-sidebar-active" : ""}`}>
        
        {/* Backdrop for mobile */}
        {mobileSidebarActive && (
          <div className="mobile-drawer-overlay" onClick={() => setMobileSidebarActive(false)}></div>
        )}

        {/* 1. TOP NAVIGATION */}
        <header className="crm-top-navbar" style={{ height: "72px", borderBottom: "1px solid var(--crm-border)", boxShadow: "0 1px 3px rgba(15,23,42,0.05)", background: "var(--crm-card)" }}>
          <div className="brand-section" style={{ display: "flex", alignItems: "center", gap: "16px", paddingLeft: "24px" }}>
            <button
              className="nav-hamburger-btn"
              aria-label={sidebarCollapsed || mobileSidebarActive ? "Expand sidebar" : "Collapse sidebar"}
              style={{ background: "transparent", border: "none", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--crm-dark)", transition: "background 0.2s" }}
              onClick={() => {
                // Desktop and mobile use two different off-canvas mechanisms
                // (width-collapse vs. translateX drawer) — only touch the one
                // that applies to the current viewport instead of toggling both.
                if (window.innerWidth <= 768) {
                  setMobileSidebarActive(prev => !prev);
                } else {
                  setSidebarCollapsed(prev => !prev);
                }
              }}
            >
              <i className={`bi ${sidebarCollapsed ? "bi-list" : "bi-x-lg"} d-none d-md-inline-block`} style={{ fontSize: "22px", lineHeight: 1 }}></i>
              <i className={`bi ${mobileSidebarActive ? "bi-x-lg" : "bi-list"} d-inline-block d-md-none`} style={{ fontSize: "22px", lineHeight: 1 }}></i>
            </button>
            <span style={{ fontSize: "28px", fontWeight: "700", display: "flex", alignItems: "center", lineHeight: 1, letterSpacing: "-0.02em" }}>
              <span style={{ color: "#2563eb" }}>CRM</span>
              <span style={{ color: "var(--crm-dark)", marginLeft: "4px" }}>Platform</span>
            </span>
          </div>

          <div className="nav-right-controls" style={{ display: "flex", alignItems: "center", gap: "16px", paddingRight: "24px" }}>

            {/* Admin profile widget - dynamically binds from unified profile state */}
            <div className="profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", height: "40px" }}>
              <div className="avatar-circle" style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", background: "var(--crm-hover)", color: "var(--crm-primary)", overflow: "hidden" }}>
                {profile && profile.avatar ? <img src={profile.avatar} alt="Profile" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} /> : `${profile?.firstName?.[0] || ""}${profile?.lastName?.[0] || ""}`}
              </div>
              <div className="profile-name-text d-none d-lg-block" style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--crm-dark)" }}>
                {profile?.displayName || `${profile?.firstName || ""} ${profile?.lastName || ""}`}
              </div>
              <i className="bi bi-chevron-down d-none d-sm-inline-block" style={{ fontSize: "11px", color: "#94a3b8" }}></i>

              {showProfileMenu && (
                <div className="controls-dropdown-panel profile" style={{ top: "60px", right: "24px" }}>
                  <div className="dropdown-header-label">Account Options</div>
                  <button className="dropdown-row-link" onClick={() => { setActiveMenu("me"); setShowProfileMenu(false); }} style={{ border: "none", background: "transparent", width: "100%", textAlign: "left" }}>
                    <i className="bi bi-person"></i> My Profile
                  </button>
                  <button className="dropdown-row-link" onClick={() => { setActiveMenu("settings"); setShowProfileMenu(false); }} style={{ border: "none", background: "transparent", width: "100%", textAlign: "left" }}>
                    <i className="bi bi-gear"></i> Settings
                  </button>
                  <button className="dropdown-row-link" onClick={() => { alert("CRM Support Help Center: Contact support at support@crmplatform.internal or dial 1-800-CRM-PLATFORM."); setShowProfileMenu(false); }} style={{ border: "none", background: "transparent", width: "100%", textAlign: "left" }}>
                    <i className="bi bi-question-circle"></i> Help
                  </button>
                  <button className="dropdown-row-link logout-btn" onClick={handleLogout} style={{ border: "none", background: "transparent", width: "100%", textAlign: "left" }}>
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 2. LEFT SIDEBAR */}
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu} 
          onLogout={handleLogout} 
          setMobileActive={setMobileSidebarActive}
        />

        {/* MAIN VIEWPORT */}
        <main className="crm-viewport-content">

          {/* VIEW: DASHBOARD TAB — Employee Workspace */}
          {activeMenu === "dashboard" && (
            <>
              <style>{`
                /* ── Employee Workspace Dashboard ── */
                .ew-root {
                  display: flex;
                  gap: 20px;
                  align-items: flex-start;
                  padding: 24px;
                  background: #f5f7fb;
                  min-height: 100%;
                  box-sizing: border-box;
                }

                /* LEFT COLUMN */
                .ew-left {
                  width: 280px;
                  min-width: 260px;
                  display: flex;
                  flex-direction: column;
                  gap: 14px;
                }

                /* RIGHT COLUMN */
                .ew-right {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 16px;
                  min-width: 0;
                }

                /* Card base */
                .ew-card {
                  background: #ffffff;
                  border-radius: 14px;
                  box-shadow: 0 1px 6px rgba(15,23,42,0.06);
                  border: 1px solid #eef0f6;
                  overflow: hidden;
                }

                /* ── Profile Card ── */
                .ew-profile-card {
                  padding: 24px 20px 20px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  text-align: center;
                }
                .ew-avatar {
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  object-fit: cover;
                  background: linear-gradient(135deg, #2563eb, #60a5fa);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 26px;
                  font-weight: 800;
                  color: #fff;
                  letter-spacing: -1px;
                  margin-bottom: 12px;
                  flex-shrink: 0;
                }
                .ew-profile-name {
                  font-size: 15.5px;
                  font-weight: 800;
                  color: #0f172a;
                  margin: 0 0 3px;
                  line-height: 1.3;
                }
                .ew-profile-designation {
                  font-size: 12px;
                  color: #2563eb;
                  font-weight: 600;
                  margin: 0 0 2px;
                }
                .ew-profile-dept {
                  font-size: 11.5px;
                  color: #64748b;
                  font-weight: 500;
                  margin: 0 0 14px;
                }
                .ew-status-badge {
                  display: inline-flex;
                  align-items: center;
                  gap: 5px;
                  background: #ecfdf5;
                  color: #059669;
                  font-size: 11px;
                  font-weight: 700;
                  padding: 3px 10px;
                  border-radius: 20px;
                  margin-bottom: 16px;
                }
                .ew-status-dot {
                  width: 7px;
                  height: 7px;
                  border-radius: 50%;
                  background: #10b981;
                }
                .ew-divider {
                  width: 100%;
                  height: 1px;
                  background: #f1f5f9;
                  margin: 4px 0 14px;
                }
                .ew-info-grid {
                  width: 100%;
                  text-align: left;
                  display: flex;
                  flex-direction: column;
                  gap: 9px;
                }
                .ew-info-row {
                  display: flex;
                  flex-direction: column;
                  gap: 1px;
                }
                .ew-info-label {
                  font-size: 10px;
                  color: #94a3b8;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .ew-info-value {
                  font-size: 12.5px;
                  color: #334155;
                  font-weight: 500;
                  word-break: break-word;
                }
                .ew-info-value.empty {
                  color: #cbd5e1;
                  font-style: italic;
                }

                /* ── Mini Stat Cards (2x2 grid) ── */
                .ew-mini-stats {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 10px;
                }
                .ew-mini-card {
                  background: #ffffff;
                  border-radius: 12px;
                  box-shadow: 0 1px 5px rgba(15,23,42,0.05);
                  border: 1px solid #eef0f6;
                  padding: 13px 12px;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                }
                .ew-mini-label {
                  font-size: 10px;
                  color: #94a3b8;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.4px;
                }
                .ew-mini-value {
                  font-size: 22px;
                  font-weight: 800;
                  color: #0f172a;
                  line-height: 1;
                }

                /* ── Work Summary Card ── */
                .ew-summary-card {
                  padding: 20px 24px;
                }
                .ew-summary-header {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-bottom: 18px;
                }
                .ew-summary-title {
                  font-size: 14px;
                  font-weight: 800;
                  color: #0f172a;
                  margin: 0;
                }
                .ew-summary-date {
                  font-size: 12px;
                  color: #64748b;
                  font-weight: 500;
                }
                .ew-summary-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 14px;
                }
                .ew-summary-item {
                  background: #f8fafc;
                  border-radius: 10px;
                  padding: 13px 14px;
                  border: 1px solid #f1f5f9;
                }
                .ew-summary-item-label {
                  font-size: 10.5px;
                  color: #94a3b8;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.4px;
                  margin-bottom: 5px;
                }
                .ew-summary-item-value {
                  font-size: 24px;
                  font-weight: 800;
                  color: #0f172a;
                  line-height: 1;
                }

                /* ── Progress Row ── */
                .ew-progress-row {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 16px;
                }
                .ew-progress-card {
                  padding: 20px 22px;
                }
                .ew-progress-title {
                  font-size: 13.5px;
                  font-weight: 800;
                  color: #0f172a;
                  margin: 0 0 4px;
                }
                .ew-progress-sub {
                  font-size: 11px;
                  color: #94a3b8;
                  font-weight: 500;
                  margin: 0 0 16px;
                }
                .ew-progress-bar-wrap {
                  height: 8px;
                  background: #f1f5f9;
                  border-radius: 99px;
                  overflow: hidden;
                  margin-bottom: 8px;
                }
                .ew-progress-bar-fill {
                  height: 100%;
                  border-radius: 99px;
                  transition: width 0.4s ease;
                }
                .ew-progress-pct {
                  font-size: 13px;
                  font-weight: 700;
                  color: #334155;
                }

                /* ── Leave / Team Row ── */
                .ew-two-col {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 16px;
                }
                .ew-leave-card {
                  padding: 18px 22px;
                  min-height: 160px;
                }
                .ew-leave-title {
                  font-size: 13.5px;
                  font-weight: 800;
                  color: #0f172a;
                  margin: 0 0 16px;
                }
                .ew-empty-state {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  padding: 24px 0 8px;
                }
                .ew-empty-icon {
                  width: 44px;
                  height: 44px;
                  background: #f1f5f9;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #94a3b8;
                  font-size: 20px;
                }
                .ew-empty-text {
                  font-size: 12px;
                  color: #94a3b8;
                  font-weight: 500;
                  text-align: center;
                }

                /* ── Holiday Card ── */
                .ew-holiday-card {
                  padding: 20px 24px;
                  display: flex;
                  align-items: center;
                  gap: 28px;
                }
                .ew-circle-wrap {
                  position: relative;
                  width: 90px;
                  height: 90px;
                  flex-shrink: 0;
                }
                .ew-circle-bg {
                  fill: none;
                  stroke: #e2e8f0;
                  stroke-width: 8;
                }
                .ew-circle-fill {
                  fill: none;
                  stroke: #2563eb;
                  stroke-width: 8;
                  stroke-linecap: round;
                  stroke-dasharray: 220;
                  stroke-dashoffset: 220;
                  transition: stroke-dashoffset 0.6s ease;
                  transform: rotate(-90deg);
                  transform-origin: center;
                }
                .ew-circle-label {
                  position: absolute;
                  inset: 0;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                }
                .ew-circle-num {
                  font-size: 20px;
                  font-weight: 800;
                  color: #0f172a;
                  line-height: 1;
                }
                .ew-circle-sub {
                  font-size: 9px;
                  color: #94a3b8;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.4px;
                }
                .ew-holiday-info {
                  flex: 1;
                }
                .ew-holiday-title {
                  font-size: 14px;
                  font-weight: 800;
                  color: #0f172a;
                  margin: 0 0 10px;
                }
                .ew-holiday-stats {
                  display: flex;
                  gap: 20px;
                  margin-bottom: 14px;
                }
                .ew-holiday-stat {
                  display: flex;
                  flex-direction: column;
                  gap: 2px;
                }
                .ew-holiday-stat-label {
                  font-size: 10px;
                  color: #94a3b8;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.4px;
                }
                .ew-holiday-stat-val {
                  font-size: 18px;
                  font-weight: 800;
                  color: #0f172a;
                }
                .ew-btn-primary {
                  background: #2563eb;
                  color: #fff;
                  border: none;
                  border-radius: 8px;
                  padding: 8px 18px;
                  font-size: 12.5px;
                  font-weight: 700;
                  cursor: pointer;
                  transition: background 0.2s;
                }
                .ew-btn-primary:hover:not(:disabled) { background: #1d4ed8; }
                .ew-btn-primary:disabled {
                  background: #cbd5e1;
                  cursor: not-allowed;
                }

                /* ── Events Card ── */
                .ew-events-card {
                  padding: 20px 24px;
                }
                .ew-events-header {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-bottom: 6px;
                }
                .ew-events-title {
                  font-size: 13.5px;
                  font-weight: 800;
                  color: #0f172a;
                  margin: 0;
                }
                .ew-events-sub {
                  font-size: 11px;
                  color: #94a3b8;
                  margin: 0 0 16px;
                }
                .ew-btn-outline {
                  background: transparent;
                  color: #2563eb;
                  border: 1.5px solid #2563eb;
                  border-radius: 8px;
                  padding: 7px 16px;
                  font-size: 12px;
                  font-weight: 700;
                  cursor: pointer;
                  transition: all 0.2s;
                }
                .ew-btn-outline:hover:not(:disabled) {
                  background: #2563eb;
                  color: #fff;
                }
                .ew-btn-outline:disabled {
                  color: #cbd5e1;
                  border-color: #e2e8f0;
                  cursor: not-allowed;
                }

                @media (max-width: 900px) {
                  .ew-root { flex-direction: column; }
                  .ew-left { width: 100%; }
                  .ew-summary-grid { grid-template-columns: repeat(2, 1fr); }
                  .ew-progress-row, .ew-two-col { grid-template-columns: 1fr; }
                  .ew-holiday-card { flex-direction: column; text-align: center; }
                }
              `}</style>

              <div className="ew-root">

                {/* ════════════ LEFT COLUMN ════════════ */}
                <div className="ew-left">

                  {/* Profile Card */}
                  <div className="ew-card ew-profile-card">
                    {/* Avatar */}
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="avatar" className="ew-avatar" style={{ display: "flex" }} />
                    ) : (
                      <div className="ew-avatar">
                        {`${profile?.firstName?.[0] || ""}${profile?.lastName?.[0] || ""}` || "U"}
                      </div>
                    )}

                    <p className="ew-profile-name">
                      {profile?.displayName || `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Employee Name"}
                    </p>
                    <p className="ew-profile-designation">{profile?.designation || "—"}</p>
                    <p className="ew-profile-dept">{profile?.department || "—"}</p>

                    <div className="ew-status-badge">
                      <span className="ew-status-dot" />
                      {profile?.employmentStatus || "Active"}
                    </div>

                    <div className="ew-divider" />

                    <div className="ew-info-grid">
                      {[
                        { label: "Employee ID",       value: profile?.employeeId },
                        { label: "Company",           value: profile?.company },
                        { label: "Office Location",   value: profile?.officeLocation },
                        { label: "Official Email",    value: profile?.officialEmail },
                        { label: "Phone Number",      value: profile?.phoneNumber },
                        { label: "Joining Date",      value: profile?.joiningDate },
                        { label: "Reporting Manager", value: profile?.reportingManager },
                        { label: "Employment Type",   value: profile?.employmentType },
                      ].map(({ label, value }) => (
                        <div className="ew-info-row" key={label}>
                          <span className="ew-info-label">{label}</span>
                          <span className={`ew-info-value ${!value ? "empty" : ""}`}>
                            {value || "Not set"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4 Mini Stat Cards */}
                  <div className="ew-mini-stats">
                    {[
                      { label: "Leaves This Year", value: employeeStats?.leavesThisYear ?? 0 },
                      { label: "Overdue Tasks",    value: employeeStats?.overdueTasks    ?? 0 },
                      { label: "Overtime (hrs)",   value: employeeStats?.overtimeHours   ?? 0 },
                      { label: "Projects",         value: employeeStats?.projects        ?? 0 },
                    ].map(({ label, value }) => (
                      <div className="ew-mini-card" key={label}>
                        <span className="ew-mini-label">{label}</span>
                        <span className="ew-mini-value">{value}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* ════════════ RIGHT COLUMN ════════════ */}
                <div className="ew-right">

                  {/* ROW 1 — Today's Work Summary */}
                  <div className="ew-card ew-summary-card">
                    <div className="ew-summary-header">
                      <h3 className="ew-summary-title">Today's Work Summary</h3>
                      <span className="ew-summary-date">
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="ew-summary-grid">
                      {[
                        { label: "Today's Meetings",  value: workSummary?.todaysMeetings  ?? 0 },
                        { label: "Pending Tasks",     value: workSummary?.pendingTasks    ?? 0 },
                        { label: "Open Deals",        value: workSummary?.openDeals       ?? 0 },
                        { label: "Upcoming Events",   value: workSummary?.upcomingEvents  ?? 0 },
                        { label: "Recent Activity",   value: workSummary?.recentActivity  ?? 0 },
                        { label: "Notifications",     value: workSummary?.notifications   ?? 0 },
                      ].map(({ label, value }) => (
                        <div className="ew-summary-item" key={label}>
                          <div className="ew-summary-item-label">{label}</div>
                          <div className="ew-summary-item-value">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ROW 2 — Productivity + Attendance */}
                  <div className="ew-progress-row">
                    <div className="ew-card ew-progress-card">
                      <p className="ew-progress-title">Productivity</p>
                      <p className="ew-progress-sub">Weekly performance score</p>
                      <div className="ew-progress-bar-wrap">
                        <div
                          className="ew-progress-bar-fill"
                          style={{ width: `${productivity?.weeklyPercent ?? 0}%`, background: "#2563eb" }}
                        />
                      </div>
                      <span className="ew-progress-pct">{productivity?.weeklyPercent ?? 0}%</span>
                    </div>

                    <div className="ew-card ew-progress-card">
                      <p className="ew-progress-title">Attendance</p>
                      <p className="ew-progress-sub">Monthly attendance rate</p>
                      <div className="ew-progress-bar-wrap">
                        <div
                          className="ew-progress-bar-fill"
                          style={{ width: `${attendance?.monthlyPercent ?? 0}%`, background: "#10b981" }}
                        />
                      </div>
                      <span className="ew-progress-pct">{attendance?.monthlyPercent ?? 0}%</span>
                    </div>
                  </div>

                  {/* ROW 3 — Team Members on Leave + Leave Requests */}
                  <div className="ew-two-col">
                    <div className="ew-card ew-leave-card">
                      <h4 className="ew-leave-title">Team Members On Leave</h4>
                      {(!leaveData?.teamOnLeave || leaveData.teamOnLeave.length === 0) ? (
                        <div className="ew-empty-state">
                          <div className="ew-empty-icon"><i className="bi bi-people" /></div>
                          <span className="ew-empty-text">No employees on leave</span>
                        </div>
                      ) : (
                        leaveData.teamOnLeave.map((m) => (
                          <div key={m.id} style={{ fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                            {m.name} — <span style={{ color: "#94a3b8" }}>{m.type}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="ew-card ew-leave-card">
                      <h4 className="ew-leave-title">Leave Requests</h4>
                      {(!leaveData?.requests || leaveData.requests.length === 0) ? (
                        <div className="ew-empty-state">
                          <div className="ew-empty-icon"><i className="bi bi-calendar-x" /></div>
                          <span className="ew-empty-text">No leave requests</span>
                        </div>
                      ) : (
                        leaveData.requests.map((r) => (
                          <div key={r.id} style={{ fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                            {r.type} — <span style={{ color: "#94a3b8" }}>{r.status}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* ROW 4 — Holiday / Leave Balance */}
                  <div className="ew-card ew-holiday-card">
                    {/* Circular progress */}
                    <div className="ew-circle-wrap">
                      <svg viewBox="0 0 90 90" width="90" height="90">
                        <circle className="ew-circle-bg" cx="45" cy="45" r="35" />
                        <circle
                          className="ew-circle-fill"
                          cx="45" cy="45" r="35"
                          style={{
                            strokeDashoffset: 220 - (220 * ((leaveBalance?.remainingLeave ?? 0) / Math.max(leaveBalance?.earnedLeave ?? 1, 1)))
                          }}
                        />
                      </svg>
                      <div className="ew-circle-label">
                        <span className="ew-circle-num">{leaveBalance?.remainingLeave ?? 0}</span>
                        <span className="ew-circle-sub">Left</span>
                      </div>
                    </div>

                    <div className="ew-holiday-info">
                      <h4 className="ew-holiday-title">Holiday & Leave Balance</h4>
                      <div className="ew-holiday-stats">
                        <div className="ew-holiday-stat">
                          <span className="ew-holiday-stat-label">Remaining Leave</span>
                          <span className="ew-holiday-stat-val">{leaveBalance?.remainingLeave ?? 0}</span>
                        </div>
                        <div className="ew-holiday-stat">
                          <span className="ew-holiday-stat-label">Earned Leave</span>
                          <span className="ew-holiday-stat-val">{leaveBalance?.earnedLeave ?? 0}</span>
                        </div>
                      </div>
                      <button className="ew-btn-primary" disabled title="Leave requests are coming soon">
                        Request Leave
                      </button>
                    </div>
                  </div>

                  {/* ROW 5 — Other Events */}
                  <div className="ew-card ew-events-card">
                    <div className="ew-events-header">
                      <h4 className="ew-events-title">Other Events</h4>
                      <button className="ew-btn-outline" disabled title="Custom event requests are coming soon">Request Event</button>
                    </div>
                    <p className="ew-events-sub">Track your additional leave types and custom events</p>
                    {(!otherEvents || otherEvents.length === 0) && (
                      <div className="ew-empty-state" style={{ paddingBottom: "16px" }}>
                        <div className="ew-empty-icon"><i className="bi bi-calendar2-event" /></div>
                        <span className="ew-empty-text">No upcoming events</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </>
          )}
          {/* VIEW: ME PROFILE TAB */}
          {activeMenu === "me" && (
            <MeProfile 
              profile={profile} 
              onSave={handleSaveProfile} 
              onCancel={() => setActiveMenu("dashboard")}
            />
          )}

          {/* VIEW: NEWS TAB */}
          {activeMenu === "news" && <NewsPage />}

          {/* VIEW: CALENDAR TAB */}
          {activeMenu === "calendar" && (
            <CalendarPage 
              events={events} 
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              profile={profile}
            />
          )}

          {/* VIEW: SYSTEM SETTINGS TAB */}
          {activeMenu === "settings" && (
            <SettingsPage 
              profile={profile} 
              onSaveSettings={handleSaveSettings} 
            />
          )}

          {/* VIEW: TASKS TAB */}
          {activeMenu === "tasks" && (
            <TasksPage 
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              profile={profile}
            />
          )}

          {/* VIEW: TEAM TAB */}
          {activeMenu === "team" && (
            <TeamPage 
              teamMembers={teamMembers}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {/* VIEW: NOTIFICATIONS TAB */}
          {activeMenu === "notifications" && (
            <NotificationsPage 
              notifications={notifications}
              onMarkAllRead={handleMarkAllNotifsRead}
              onUpdateNotification={handleUpdateNotification}
              onDeleteNotification={handleDeleteNotification}
              setActiveMenu={setActiveMenu}
            />
          )}

          {/* VIEW: DOCUMENTS TAB */}
          {activeMenu === "documents" && (
            <DocumentsPage 
              documents={documents}
              onUpload={handleUploadDocument}
              onCreateFolder={handleCreateFolder}
              onDelete={handleDeleteDocument}
              onUpdate={handleUpdateDocument}
              profile={profile}
            />
          )}

          {/* VIEW: OTHER WORKSPACE PLACEHOLDERS */}
          {activeMenu !== "dashboard" && activeMenu !== "me" && activeMenu !== "news" && activeMenu !== "settings" && activeMenu !== "calendar" && activeMenu !== "tasks" && activeMenu !== "team" && activeMenu !== "notifications" && activeMenu !== "documents" && (
            <div className="dashboard-card-flat text-center py-5">
              <h3><i className="bi bi-lock-fill text-muted"></i> {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)} Section</h3>
              <p className="text-muted mt-2">This module is coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Dashboard;
