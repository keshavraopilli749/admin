import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCRMContext } from "../context/CRMContext";
import "../styles/dashboard-layout.css";
import Sidebar from "../components/layout/Sidebar";

// Modular Component Imports
import AdminHome from "../components/admin/AdminHome";
import AdminProfile from "../components/admin/AdminProfile";
import AdminTeam from "../components/admin/AdminTeam";
import AdminNews from "../components/admin/AdminNews";
import AdminCalendar from "../components/admin/AdminCalendar";
import AdminTasks from "../components/admin/AdminTasks";
import AdminDocuments from "../components/admin/AdminDocuments";
import AdminNotifications from "../components/admin/AdminNotifications";
import AdminSettings from "../components/admin/AdminSettings";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useCRMContext();
  const dropdownRef = useRef(null);
  
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // Layout & Navigation State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarActive, setMobileSidebarActive] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  // Captures clicks hitting outside the tracking profile panel boundaries
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  // Captures Escape key down actions to clear open UI dropdown nodes
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showProfileMenu]);

  // Optimized component dictionary layer mapping
  const adminComponentMap = {
    dashboard: <AdminHome setActiveMenu={setActiveMenu} />,
    me: <AdminProfile />,
    team: <AdminTeam />,
    news: <AdminNews />,
    calendar: <AdminCalendar profile={profile} />,
    tasks: <AdminTasks />,
    documents: <AdminDocuments />,
    notifications: <AdminNotifications />,
    settings: <AdminSettings />
  };

  const getAvatarInitials = () => {
    if (profile?.firstName) {
      return `${profile.firstName[0]}${profile?.lastName?.[0] || ""}`.toUpperCase();
    }
    if (user?.fullName) {
      return user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "A";
  };

  return (
    <div className={`crm-dashboard-layout ${sidebarCollapsed ? "collapsed-sidebar" : ""} ${mobileSidebarActive ? "mobile-sidebar-active" : ""}`}>
      
      {/* ENTERPRISE SIDEBAR NAVIGATION COMPONENT */}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        onLogout={handleLogout} 
        setMobileActive={setMobileSidebarActive}
        isAdmin={true} 
      />

      {/* MOBILE COMPONENT OVERLAY DRAWER MASK */}
      {mobileSidebarActive && (
        <div className="crm-mobile-overlay" onClick={() => setMobileSidebarActive(false)}></div>
      )}

      {/* CONTENT PORT AND TOPBAR NAVIGATION CONTROLLER */}
      <main className="crm-main-content-area">
        
        {/* COMPACT TOP NAVIGATION BAR MATCHING DASHBOARD.JSX */}
        <header className="crm-top-navbar">
          <div className="brand-section">
            <button 
              type="button"
              className="nav-hamburger-btn"
              onClick={() => { 
                setSidebarCollapsed(!sidebarCollapsed); 
                setMobileSidebarActive(!mobileSidebarActive); 
              }}
              aria-label="Toggle Navigation Control Panel Menu"
              aria-expanded={!sidebarCollapsed || mobileSidebarActive}
            >
              <i className={`bi ${sidebarCollapsed ? "bi-list" : "bi-x-lg"} d-none d-md-inline-block`} aria-hidden="true"></i>
              <i className={`bi ${mobileSidebarActive ? "bi-x-lg" : "bi-list"} d-inline-block d-md-none`} aria-hidden="true"></i>
            </button>
            <span className="logo-brand">
              <span className="text-primary">CRM</span>
              <span className="text-dark ms-1">Platform</span>
            </span>
          </div>

          {/* DYNAMIC PROFILE HEAD ELEMENT BAR LINK CONTROLS */}
          <div className="nav-right-controls">
            <div 
              className="profile-trigger" 
              ref={dropdownRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              role="button"
              tabIndex={0}
              aria-haspopup="true"
              aria-expanded={showProfileMenu}
              aria-label="Administrator Menu Trigger Options"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowProfileMenu(!showProfileMenu);
                }
              }}
            >
              <div className="avatar-circle">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Active System Admin Portrait Profile Image" />
                ) : (
                  getAvatarInitials()
                )}
              </div>
              <div className="profile-name-text d-none d-lg-block">
                {profile?.displayName || user?.fullName || "Administrator"}
              </div>
              <i className="bi bi-chevron-down d-none d-sm-inline-block text-muted" aria-hidden="true"></i>

              {/* ACCESSIBLE ACTION PROFILE PANEL DROPDOWN */}
              {showProfileMenu && (
                <div className="controls-dropdown-panel profile" role="menu" aria-label="Admin Account Option Settings Dropdown Menu">
                  <div className="dropdown-header-label" role="presentation">Account Options</div>
                  
                  <button 
                    type="button"
                    className="dropdown-row-link text-start" 
                    role="menuitem"
                    onClick={() => { setActiveMenu("me"); setShowProfileMenu(false); }}
                  >
                    <i className="bi bi-person me-2" aria-hidden="true"></i> My Profile
                  </button>
                  
                  <button 
                    type="button"
                    className="dropdown-row-link text-start" 
                    role="menuitem"
                    onClick={() => { setActiveMenu("settings"); setShowProfileMenu(false); }}
                  >
                    <i className="bi bi-gear me-2" aria-hidden="true"></i> Settings
                  </button>
                  
                  <hr />
                  
                  <button 
                    type="button"
                    className="dropdown-row-link text-danger text-start fw-bold" 
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2" aria-hidden="true"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE VIEW PORT FRAME SCROLLABLE LAYER */}
        <div className="crm-scrollable-content">
          {adminComponentMap[activeMenu] || adminComponentMap["dashboard"]}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;







import React, { useState } from "react";

const AdminHome = ({ setActiveMenu }) => {
  // Production operational metrics initialized to structural zeros/empty sets
  const [adminStats, setAdminStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    totalTeams: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    companyDocuments: 0,
    announcements: 0,
    notifications: 0,
    calendarEvents: 0
  });

  const [recentActivities, setRecentActivity] = useState([]);
  const [analyticsCurve, setAnalyticsCurve] = useState([]);

  // Admin contextual quick-action configuration mapper
  const quickActions = [
    { label: "Add Employee", menuKey: "team", icon: "bi-person-plus", color: "text-primary" },
    { label: "Create Announcement", menuKey: "news", icon: "bi-megaphone", color: "text-purple" },
    { label: "Create Task", menuKey: "tasks", icon: "bi-check2-square", color: "text-success" },
    { label: "Upload Document", menuKey: "documents", icon: "bi-file-earmark-arrow-up", color: "text-info" },
    { label: "Schedule Event", menuKey: "calendar", icon: "bi-calendar-plus", color: "text-warning" },
    { label: "Manage Departments", menuKey: "settings", icon: "bi-building", color: "text-secondary" },
    { label: "View System Logs", menuKey: "settings", icon: "bi-shield-check", color: "text-danger" },
    { label: "Send Notification", menuKey: "notifications", icon: "bi-bell", color: "text-primary" }
  ];

  return (
    <div className="ew-root">
      {/* ════════════ LEFT COLUMN: ADMINISTRATION QUICK UTILITIES ════════════ */}
      <div className="ew-left">
        
        {/* Welcome Section Banner */}
        <div className="ew-card ew-profile-card">
          <div className="ew-avatar">
            <i className="bi bi-shield-lock-fill" style={{ fontSize: "2rem" }}></i>
          </div>
          <p className="ew-profile-name">Admin Console</p>
          <p className="ew-profile-designation">System Administrator</p>
          <p className="ew-profile-dept">Global Management Operations</p>
          
          <div className="ew-status-badge">
            <span className="ew-status-dot" />
            System Online
          </div>
          
          <div className="ew-divider" />
          
          <div className="ew-info-grid">
            <div className="ew-info-row">
              <span className="ew-info-label">Console Access</span>
              <span className="ew-info-value">Full Privilege Tier</span>
            </div>
            <div className="ew-info-row">
              <span className="ew-info-label">Environment</span>
              <span className="ew-info-value">Production Workspace</span>
            </div>
          </div>
        </div>

        {/* Operational Scope Mini Summary Cards */}
        <div className="ew-mini-stats">
          <div className="ew-mini-card">
            <span className="ew-mini-label">Total Staff</span>
            <span className="ew-mini-value">{adminStats.totalEmployees}</span>
          </div>
          <div className="ew-mini-card">
            <span className="ew-mini-label">Active Staff</span>
            <span className="ew-mini-value">{adminStats.activeEmployees}</span>
          </div>
          <div className="ew-mini-card">
            <span className="ew-mini-label">Departments</span>
            <span className="ew-mini-value">{adminStats.departments}</span>
          </div>
          <div className="ew-mini-card">
            <span className="ew-mini-label">Active Teams</span>
            <span className="ew-mini-value">{adminStats.totalTeams}</span>
          </div>
        </div>

      </div>

      {/* ════════════ RIGHT COLUMN: CORE CONTROL MONITOR ════════════ */}
      <div className="ew-right">

        {/* System Operations High-Level Metric Summary Cards */}
        <div className="ew-card ew-summary-card">
          <div className="ew-summary-header">
            <h3 className="ew-summary-title">Enterprise System Metrics</h3>
            <span className="ew-summary-date">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="ew-summary-grid">
            <div className="ew-summary-item">
              <div className="ew-summary-item-label">Total Tracked Tasks</div>
              <div className="ew-summary-item-value">{adminStats.totalTasks}</div>
            </div>
            <div className="ew-summary-item">
              <div className="ew-summary-item-label">Completed Tasks</div>
              <div className="ew-summary-item-value">{adminStats.completedTasks}</div>
            </div>
            <div className="ew-summary-item">
              <div className="ew-summary-item-label">Pending Backlog</div>
              <div className="ew-summary-item-value">{adminStats.pendingTasks}</div>
            </div>
            <div className="ew-summary-item">
              <div className="ew-summary-item-label">Shared Documents</div>
              <div className="ew-summary-item-value">{adminStats.companyDocuments}</div>
            </div>
            <div className="ew-summary-item">
              <div className="ew-summary-item-label">Live Broadcasts</div>
              <div className="ew-summary-item-value">{adminStats.announcements}</div>
            </div>
            <div className="ew-summary-item">
              <div className="ew-summary-item-label">Pending Dispatches</div>
              <div className="ew-summary-item-value">{adminStats.notifications}</div>
            </div>
          </div>
        </div>

        {/* Quick Administrative Action Trigger Grid */}
        <div className="dashboard-card-flat">
          <div className="card-flat-title-bar">
            <h3><i className="bi bi-lightning-charge"></i> Immediate Administrative Actions</h3>
          </div>
          <div className="row g-2 mt-1">
            {quickActions.map((action, idx) => (
              <div className="col-6 col-sm-4 col-md-3" key={idx}>
                <button
                  type="button"
                  className="btn-profile-secondary w-100 text-start d-flex align-items-center gap-2 py-2 px-3"
                  style={{ fontSize: "12.5px", fontWeight: "700" }}
                  onClick={() => setActiveMenu(action.menuKey)}
                >
                  <i className={`bi ${action.icon} ${action.color}`} style={{ fontSize: "15px" }}></i>
                  <span>{action.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail Logs & Analytical Trends Sub-split Panels */}
        <div className="ew-two-col">
          
          {/* Audit Logs Block */}
          <div className="ew-card ew-leave-card p-4">
            <h4 className="ew-leave-title mb-3" style={{ fontSize: "13.5px", fontWeight: "800", textTransform: "uppercase" }}>
              <i className="bi bi-journal-text text-primary me-2"></i>Recent System Activity
            </h4>
            {recentActivities.length === 0 ? (
              <div className="ew-empty-state">
                <div className="ew-empty-icon"><i className="bi bi-shield-check" /></div>
                <span className="ew-empty-text">No anomalous security or system state modifications logged.</span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {recentActivities.map((log) => (
                  <div key={log.id} style={{ fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                    {log.description} — <span style={{ color: "#94a3b8" }}>{log.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analytical Analytics Curve Block */}
          <div className="ew-card ew-leave-card p-4">
            <h4 className="ew-leave-title mb-3" style={{ fontSize: "13.5px", fontWeight: "800", textTransform: "uppercase" }}>
              <i className="bi bi-graph-up-arrow text-primary me-2"></i>Performance and Usage Overview
            </h4>
            {analyticsCurve.length === 0 ? (
              <div className="ew-empty-state">
                <div className="ew-empty-icon"><i className="bi bi-bar-chart-line" /></div>
                <span className="ew-empty-text">Connect an operational database endpoint to track resource optimization metrics.</span>
              </div>
            ) : (
              <div style={{ height: "100px", width: "100%" }}>
                {/* SVG/Placeholder calculations mapping here when data exists */}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminHome;






import React, { useState } from "react";

const AdminProfile = ({ onSave, onCancel }) => {
  // Single source of truth for administrative and company data profiles
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    dob: "",
    gender: "",
    nationality: "",
    
    adminId: "AD10001",
    role: "Administrator",
    department: "Global Operations",
    designation: "System Superuser",
    joiningDate: "2026-07-17",
    officeLocation: "Head Office",
    accountStatus: "Active",
    
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
    
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    websiteUrl: "",
    avatar: null
  });

  const [showToast, setShowToast] = useState(false);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: null }));
  };

  const handleReset = () => {
    // Structural reset to pristine system template defaults
    setFormData({
      firstName: "",
      lastName: "",
      displayName: "",
      dob: "",
      gender: "",
      nationality: "",
      adminId: "AD10001",
      role: "Administrator",
      department: "Global Operations",
      designation: "System Superuser",
      joiningDate: "2026-07-17",
      officeLocation: "Head Office",
      accountStatus: "Active",
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
      companyName: "",
      companyEmail: "",
      companyPhone: "",
      companyAddress: "",
      websiteUrl: "",
      avatar: null
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <div className="dashboard-card-flat">
      {/* Dynamic Action Toast Alert Notification */}
      {showToast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          background: "#10b981", color: "white", padding: "12px 24px",
          borderRadius: "8px", fontWeight: "750", zIndex: 9999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          <i className="bi bi-check-circle-fill"></i>
          Administrative profile updated successfully!
        </div>
      )}

      {/* Card Header Title System */}
      <div className="card-flat-title-bar">
        <h3><i className="bi bi-person-badge-fill"></i> Administrative Profile</h3>
        <span className="text-muted" style={{ fontSize: "12px", fontWeight: "700" }}>Manage credential layers and organizational mappings</span>
      </div>

      <style>{`
        .readonly-clean {
          background: #ffffff !important;
          color: inherit !important;
          cursor: default;
          opacity: 1 !important;
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">

          {/* Avatar Panel Container */}
          <div className="col-12">
            <div className="p-3 border rounded-3 bg-light text-center d-flex flex-column align-items-center gap-3">
              <h5 className="mb-0 text-muted" style={{ fontSize: "12.5px", fontWeight: "755", textTransform: "uppercase" }}>Administrator Avatar</h5>
              {formData.avatar ? (
                <img src={formData.avatar} alt="Admin Profile" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#e2e8f0", color: "var(--crm-primary)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                  {formData.firstName?.[0] && formData.lastName?.[0] ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase() : "AD"}
                </div>
              )}
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

          {/* Section 1: Personal Credentials Grid */}
          <div className="col-12">
            <div className="p-3 border rounded-3">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>Personal Information</h4>
              <div className="row g-3">
                <div className="col-md-4 modal-form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleTextChange} required />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleTextChange} required />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Display Token Name</label>
                  <input type="text" name="displayName" value={formData.displayName} onChange={handleTextChange} />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleTextChange} />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Gender Architecture</label>
                  <select name="gender" value={formData.gender} onChange={handleTextChange}>
                    <option value="">Select Option</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Nationality</label>
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleTextChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Core Contact Layer */}
          <div className="col-12">
            <div className="p-3 border rounded-3">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>Contact Infrastructure</h4>
              <div className="row g-3">
                <div className="col-md-6 modal-form-group">
                  <label>Internal Official Email</label>
                  <input type="email" name="officialEmail" value={formData.officialEmail} onChange={handleTextChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Fallback Personal Email</label>
                  <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleTextChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Primary Secure Phone</label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleTextChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Alternate Comms Phone</label>
                  <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleTextChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Emergency Escalation Contact</label>
                  <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleTextChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Escalation Phone Line</label>
                  <input type="text" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleTextChange} />
                </div>
                <div className="col-md-12 modal-form-group">
                  <label>Physical Dispatch Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>State / Province</label>
                  <input type="text" name="state" value={formData.state} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>Country Boundary</label>
                  <input type="text" name="country" value={formData.country} onChange={handleTextChange} />
                </div>
                <div className="col-md-3 modal-form-group">
                  <label>Zip Code / Postal Routing</label>
                  <input type="text" name="zipCode" value={formData.zipCode} onChange={handleTextChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Privileged Operational Parameters */}
          <div className="col-12">
            <div className="p-3 border rounded-3">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>Administrative Assignment</h4>
              <div className="row g-3">
                <div className="col-md-4 modal-form-group">
                  <label>Administrator ID Token</label>
                  <input type="text" value={formData.adminId} className="readonly-clean" readOnly />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Security Assigned Role</label>
                  <input type="text" value={formData.role} className="readonly-clean" readOnly />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Privilege Allocation Date</label>
                  <input type="text" value={formData.joiningDate} className="readonly-clean" readOnly />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Core Governance Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleTextChange} />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Functional Designation</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleTextChange} />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Operating Node Location</label>
                  <select name="officeLocation" value={formData.officeLocation} onChange={handleTextChange}>
                    <option value="Head Office">Head Office</option>
                    <option value="Branch Office">Branch Office</option>
                    <option value="Remote Node">Remote Node</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Enterprise Company Identity Layer */}
          <div className="col-12">
            <div className="p-3 border rounded-3">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>Corporate Entity Parameters</h4>
              <div className="row g-3">
                <div className="col-md-4 modal-form-group">
                  <label>Registered Company Name</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleTextChange} placeholder="e.g. Corporate Entity LLC" />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Corporate Gateway Email</label>
                  <input type="email" name="companyEmail" value={formData.companyEmail} onChange={handleTextChange} placeholder="e.g. info@company.internal" />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Corporate Switchboard Line</label>
                  <input type="text" name="companyPhone" value={formData.companyPhone} onChange={handleTextChange} placeholder="e.g. +1-800-000-0000" />
                </div>
                <div className="col-md-8 modal-form-group">
                  <label>Entity Headquarters Address</label>
                  <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleTextChange} placeholder="HQ Location Complex" />
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Official Web URL Link</label>
                  <input type="text" name="websiteUrl" value={formData.websiteUrl} onChange={handleTextChange} placeholder="https://domain.internal" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Command Action Stack Wrapper */}
          <div className="col-12 d-flex justify-content-end gap-3 mt-4 flex-wrap">
            <button type="button" className="btn-profile-secondary" style={{ padding: "10px 24px" }} onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="btn-profile-secondary" style={{ padding: "10px 24px" }} onClick={handleReset}>
              Reset
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

export default AdminProfile;









import React, { useState } from "react";

const AdminNews = () => {
  // Production reactive states initialized to structural empty layouts
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  // Modal control states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);

  // Form parameters architecture template
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    department: "Sales",
    priority: "Normal",
    status: "Published",
    pinned: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAnnouncementForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;

    const newAnnouncement = {
      ...announcementForm,
      id: Date.now().toString(),
      authorName: "System Administrator",
      createdAt: new Date().toISOString()
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    handleModalClose();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;

    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === activeAnnouncement.id ? { ...item, ...announcementForm } : item
      )
    );
    handleModalClose();
  };

  const handleDeleteClick = (id) => {
    if (confirm("Are you sure you want to permanently delete this announcement?")) {
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setActiveAnnouncement(null);
    setAnnouncementForm({
      title: "",
      content: "",
      department: "Sales",
      priority: "Normal",
      status: "Published",
      pinned: false
    });
  };

  const openEditModal = (item) => {
    setActiveAnnouncement(item);
    setAnnouncementForm({
      title: item.title,
      content: item.content,
      department: item.department,
      priority: item.priority,
      status: item.status,
      pinned: item.pinned || false
    });
    setShowEditModal(true);
  };

  // Shared theme contextual color hashes
  const deptColors = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];
  const getDeptColor = (dept = "") => deptColors[dept.charCodeAt(0) % deptColors.length];

  // Pipeline Filter logic matching dashboard mechanics
  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (sortBy === "Oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="dashboard-card-flat">
      
      {/* 1. View Header System */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Announcement Management
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: "12.5px" }}>
            Publish, schedule, and moderate internal enterprise news feeds.
          </p>
        </div>
        <button type="button" className="btn-profile-primary" style={{ padding: "8px 20px" }} onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Create Announcement
        </button>
      </div>

      {/* 2. Unified Search and Moderation Toolbar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="nav-search-bar" style={{ width: "240px", background: "var(--crm-bg)", border: "1px solid var(--crm-border)" }}>
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              className="nav-search-input" 
              placeholder="Search announcements..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select className="form-select py-1 px-3" style={{ width: "130px", fontSize: "12.5px", height: "36px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <select className="form-select py-1 px-3" style={{ width: "130px", fontSize: "12.5px", height: "36px" }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="Normal">Normal</option>
            <option value="Important">Important</option>
          </select>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted" style={{ fontSize: "12px", fontWeight: "700" }}>Sort Feed:</span>
          <select className="form-select py-1 px-3" style={{ width: "120px", fontSize: "12.5px", height: "36px" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* 3. Recreated Feed Stack Architecture */}
      {sortedAnnouncements.length === 0 ? (
        <div className="empty-state-card py-5">
          <i className="bi bi-newspaper empty-state-icon" style={{ fontSize: "52px" }}></i>
          <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 8px 0" }}>No Broadcasts Located</h4>
          <p className="text-muted mb-0" style={{ fontSize: "12.5px" }}>
            No company updates currently match your applied parameters.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {sortedAnnouncements.map((item) => (
            <div
              key={item.id}
              className="ew-card p-4 position-relative"
              style={{
                background: "#ffffff",
                border: "1px solid #eef0f6",
                borderRadius: "14px",
                boxShadow: "0 1px 5px rgba(15,23,42,0.05)"
              }}
            >
              {/* Top Meta Line */}
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
                    background: getDeptColor(item.department),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: "800", fontSize: "14px"
                  }}>
                    {item.department.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{item.authorName}</div>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                      {item.department} &nbsp;•&nbsp; {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>

                {/* Badge Architecture Layer */}
                <div className="d-flex align-items-center gap-2">
                  {item.pinned && (
                    <span className="badge bg-warning-subtle text-warning border border-warning" style={{ fontSize: "10px", fontWeight: "700" }}>
                      <i className="bi bi-pin-angle-fill me-1"></i>PINNED
                    </span>
                  )}
                  <span className={`badge ${item.priority === "Important" ? "bg-danger-subtle text-danger border border-danger" : "bg-light text-secondary"}`} style={{ fontSize: "10px", fontWeight: "700" }}>
                    {item.priority.toUpperCase()}
                  </span>
                  <span className={`badge ${item.status === "Published" ? "bg-success-subtle text-success border border-success" : item.status === "Draft" ? "bg-warning-subtle text-warning border border-warning" : "bg-secondary-subtle text-secondary"}`} style={{ fontSize: "10px", fontWeight: "700" }}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Broadcast Header text */}
              <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#2563eb", margin: "0 0 8px" }}>{item.title}</h4>
              <p style={{ fontSize: "13.5px", color: "#334155", lineHeight: "1.65", margin: "0 0 16px", whiteSpace: "pre-line" }}>{item.content}</p>

              {/* Executive Operational Triggers */}
              <div className="d-flex gap-2 border-top pt-3 justify-content-end">
                <button type="button" className="btn-profile-secondary py-1 px-3" style={{ fontSize: "12px" }} onClick={() => openEditModal(item)}>
                  <i className="bi bi-pencil me-1"></i>Edit
                </button>
                <button type="button" className="btn-profile-secondary text-danger py-1 px-3" style={{ fontSize: "12px" }} onClick={() => handleDeleteClick(item.id)}>
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL WINDOW SYSTEM ARCHITECTURE (Add & Edit Contexts) */}
      {(showAddModal || showEditModal) && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, left: 0,
          background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200
        }}>
          <div className="dashboard-card-flat" style={{ width: "550px", maxWidth: "95%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-megaphone-fill"></i> {showAddModal ? "New Announcement" : "Modify Announcement"}</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={handleModalClose}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={showAddModal ? handleCreateSubmit : handleEditSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Announcement Title</label>
                  <input type="text" name="title" value={announcementForm.title} onChange={handleInputChange} placeholder="Enter subject heading..." required />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Target Audience/Dept</label>
                  <select name="department" value={announcementForm.department} onChange={handleInputChange}>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="HR">HR</option>
                    <option value="All Personnel">All Personnel</option>
                  </select>
                </div>

                <div className="col-md-3 modal-form-group">
                  <label>Priority Tier</label>
                  <select name="priority" value={announcementForm.priority} onChange={handleInputChange}>
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                  </select>
                </div>

                <div className="col-md-3 modal-form-group">
                  <label>Publish State</label>
                  <select name="status" value={announcementForm.status} onChange={handleInputChange}>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="col-12 modal-form-group">
                  <label>Announcement Body Text</label>
                  <textarea name="content" rows={4} value={announcementForm.content} onChange={handleInputChange} placeholder="Draft broadcast communication..." required></textarea>
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="pinned" id="pinAnnouncementCheck" checked={announcementForm.pinned} onChange={handleInputChange} />
                    <label className="form-check-label" htmlFor="pinAnnouncementCheck" style={{ fontSize: "12px", fontWeight: "600" }}>
                      Pin announcement to header feed
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={handleModalClose}>Cancel</button>
                <button type="submit" className="btn-profile-primary">{showAddModal ? "Publish" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminNews;




import React, { useState } from "react";

const AdminCalendar = ({ profile }) => {
  // Production reactive states initialized to structural clean defaults
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Selection & UI focus anchors
  const [selectedDay, setSelectedDay] = useState("2026-07-17");
  const [activeEvent, setActiveEvent] = useState(null);

  // Modal Overlay controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Management Form Schemes template architectures
  const [eventForm, setAnnouncementForm] = useState({
    title: "",
    description: "",
    type: "Meeting",
    date: "2026-07-17",
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    targetAudience: "All Personnel",
    priority: "Normal",
    status: "Scheduled",
    location: ""
  });

  // Recreated Month structural matrix (July 2026 Monthly Grid)
  const calendarCells = [];
  for (let i = 28; i <= 30; i++) {
    calendarCells.push({ dayNum: i, dateStr: `2026-06-${i}`, inMonth: false });
  }
  for (let i = 1; i <= 31; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    calendarCells.push({ dayNum: i, dateStr: `2026-07-${dayStr}`, inMonth: true });
  }
  for (let i = 1; i <= 8; i++) {
    calendarCells.push({ dayNum: i, dateStr: `2026-08-0${i}`, inMonth: false });
  }

  // Color mapper mirroring the core dashboard palette system
  const getEventColor = (type, status) => {
    if (status === "Cancelled") return "#64748b";
    if (status === "Completed") return "#10b981";
    switch (type) {
      case "Meeting": return "#2563eb";
      case "Holiday": return "#ef4444";
      case "Deadline": return "#dc2626";
      case "Training": return "#a855f7";
      default: return "#f97316";
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "Meeting": return "bi-people";
      case "Holiday": return "bi-calendar-week";
      case "Deadline": return "bi-exclamation-octagon";
      case "Training": return "bi-journal-bookmark";
      default: return "bi-calendar-event";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;
    const newEvent = { ...eventForm, id: Date.now() };
    setEvents(prev => [...prev, newEvent]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;
    setEvents(prev => prev.map(ev => ev.id === activeEvent.id ? { ...ev, ...eventForm } : ev));
    setActiveEvent({ ...activeEvent, ...eventForm });
    setShowEditModal(false);
    setShowDetailsModal(true);
  };

  const handleDeleteConfirmSubmit = () => {
    setEvents(prev => prev.filter(ev => ev.id !== activeEvent.id));
    setActiveEvent(null);
    setShowDeleteConfirm(false);
  };

  const resetForm = () => {
    setAnnouncementForm({
      title: "",
      description: "",
      type: "Meeting",
      date: selectedDay,
      startTime: "09:00 AM",
      endTime: "10:00 AM",
      targetAudience: "All Personnel",
      priority: "Normal",
      status: "Scheduled",
      location: ""
    });
  };

  // Pipeline Filter Mechanics matching Dashboard logic
  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === "All" || ev.type === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const todaysList = filteredEvents.filter(ev => ev.date === "2026-07-17")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingList = filteredEvents.filter(ev => ev.date > "2026-07-17")
    .sort((a, b) => a.date.localeCompare(b.date));

  const formatUpcomingDate = (dateStr) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${day} ${months[parseInt(parts[1], 10) - 1]}`;
    }
    return dateStr;
  };

  return (
    <div className="dashboard-card-flat">
      
      {/* 1. View Header Section Controls */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h3 className="mb-1" style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", color: "var(--crm-dark)", letterSpacing: "0.02em" }}>
            Enterprise Scheduling Console
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
            Coordinate corporate holidays, milestones, team sprints, and internal operational timelines.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="nav-search-bar" style={{ width: "200px", background: "var(--crm-bg)", border: "1px solid var(--crm-border)" }}>
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              className="nav-search-input" 
              placeholder="Filter schedules..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="form-select btn-profile-secondary py-1 px-3" 
            style={{ width: "140px", fontSize: "12.5px", height: "36px", border: "1px solid var(--crm-border)" }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Meeting">Meetings</option>
            <option value="Holiday">Holidays</option>
            <option value="Deadline">Deadlines</option>
            <option value="Training">Training</option>
          </select>

          <button className="btn-profile-primary" style={{ padding: "8px 20px" }} onClick={() => { resetForm(); setShowAddModal(true); }}>
            <i className="bi bi-plus-lg"></i> Schedule Event
          </button>
        </div>
      </div>

      {/* 2. Recreated Shared Split Workspace Layout */}
      <div className="calendar-layout-wrapper">
        
        {/* Left Hand Block: Grid Calendar Viewport (70%) */}
        <div className="calendar-left-main">
          <div className="calendar-grid-header">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="calendar-grid-body mb-4">
            {calendarCells.map((cell, idx) => {
              const cellEvents = filteredEvents.filter(ev => ev.date === cell.dateStr);
              const isSelected = selectedDay === cell.dateStr;
              const isToday = cell.dateStr === "2026-07-17";

              return (
                <div 
                  key={idx}
                  className={`calendar-grid-cell ${!cell.inMonth ? "out-of-month" : ""}`}
                  style={isToday ? { border: "2px solid var(--crm-primary)", background: "rgba(37, 99, 235, 0.04)" } : isSelected ? { border: "1.5px dashed #cbd5e1" } : {}}
                  onClick={() => {
                    setSelectedDay(cell.dateStr);
                    setAnnouncementForm(prev => ({ ...prev, date: cell.dateStr }));
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="calendar-day-num" style={isToday ? { fontWeight: "800", color: "var(--crm-primary)" } : {}}>{cell.dayNum}</span>
                    {isToday && (
                      <span className="badge bg-primary" style={{ padding: "2px 5px", fontSize: "8px", fontWeight: "800" }}>TODAY</span>
                    )}
                  </div>
                  
                  <div className="d-flex flex-column gap-1 overflow-hidden" style={{ flex: 1 }}>
                    {cellEvents.slice(0, 3).map(ev => (
                      <div 
                        key={ev.id}
                        className="calendar-cell-event text-truncate"
                        style={{ backgroundColor: getEventColor(ev.type, ev.status) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEvent(ev);
                          setShowDetailsModal(true);
                        }}
                      >
                        <i className={`bi ${getEventIcon(ev.type)} me-1`}></i>
                        {ev.title}
                      </div>
                    ))}
                    {cellEvents.length > 3 && (
                      <span className="text-muted" style={{ fontSize: "8px", fontWeight: "700" }}>+{cellEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Hand Block: Administrative Moderation Side Panel (30%) */}
        <div className="calendar-right-side">
          
          {/* Upcoming Enterprise Events Context Panel */}
          <div className="p-3 border rounded-3 bg-light">
            <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.02em", marginBottom: "12px" }}>
              Upcoming Corporate Slate
            </h4>
            <div className="d-flex flex-column gap-2">
              {upcomingList.length > 0 ? (
                upcomingList.slice(0, 5).map(ev => (
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
                <p className="text-muted text-center py-2 mb-0" style={{ fontSize: "11.5px" }}>No future milestones scheduled.</p>
              )}
            </div>
          </div>

          {/* Today's Global Operations Overview Panel */}
          <div className="p-3 border rounded-3 bg-light">
            <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.02em", marginBottom: "12px" }}>
              Global Operational Track
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
                    <p className="text-muted mb-0 text-truncate" style={{ fontSize: "10px" }}>{ev.description || "No execution mapping notes defined."}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-2 mb-0" style={{ fontSize: "11.5px" }}>Clear schedule for current timeline.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL ARCHITECTURE: Create Management Event Overlay */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-calendar-plus"></i> Initialize Enterprise Event</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={() => setShowAddModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Event System Title</label>
                  <input type="text" name="title" placeholder="e.g. Q3 Strategic Review" value={eventForm.title} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Schedules Classification Layer</label>
                  <select name="type" value={eventForm.type} onChange={handleInputChange}>
                    <option value="Meeting">Meeting</option>
                    <option value="Holiday">Corporate Holiday</option>
                    <option value="Deadline">Project Milestone Deadline</option>
                    <option value="Training">Corporate Training Session</option>
                  </select>
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Timeline Target Date</label>
                  <input type="date" name="date" value={eventForm.date} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Start Window Time</label>
                  <input type="text" name="startTime" value={eventForm.startTime} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>End Window Time</label>
                  <input type="text" name="endTime" value={eventForm.endTime} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Target Segment Distribution</label>
                  <input type="text" name="targetAudience" value={eventForm.targetAudience} onChange={handleInputChange} placeholder="e.g. Engineering, All Staff" />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Physical Node / Comms Link</label>
                  <input type="text" name="location" value={eventForm.location} onChange={handleInputChange} placeholder="Boardroom A / Meeting Link" />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Urgency Level</label>
                  <select name="priority" value={eventForm.priority} onChange={handleInputChange}>
                    <option value="High">High Priority</option>
                    <option value="Normal">Normal Scope</option>
                    <option value="Low">Low Scope</option>
                  </select>
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>State Baseline</label>
                  <select name="status" value={eventForm.status} onChange={handleInputChange}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Draft Pending">Draft Pending</option>
                  </select>
                </div>
                <div className="col-12 modal-form-group">
                  <label>Operational Briefing Context</label>
                  <textarea name="description" rows={2} value={eventForm.description} onChange={handleInputChange} placeholder="Map agenda parameters..."></textarea>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-profile-primary">Deploy Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ARCHITECTURE: Core Event Specifications Viewer */}
      {showDetailsModal && activeEvent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "450px", maxWidth: "90%" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-info-circle"></i> Milestone Ledger Metrics</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={() => setShowDetailsModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="d-flex flex-column gap-3 py-2">
              <div>
                <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>EVENT LABEL</span>
                <strong style={{ fontSize: "15px", color: "var(--crm-dark)" }}>{activeEvent.title}</strong>
              </div>
              <div>
                <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>EXECUTIVE SUMMARY</span>
                <p className="mb-0" style={{ fontSize: "12.5px", color: "#475569" }}>{activeEvent.description || "No parameter descriptions catalogued."}</p>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>DATE TARGET</span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{activeEvent.date}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>WINDOW LIMITS</span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{activeEvent.startTime} - {activeEvent.endTime}</span>
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>BOUND MAPPING</span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{activeEvent.targetAudience}</span>
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>ROUTING NODE</span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{activeEvent.location || "Internal Stack"}</span>
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>URGENCY LEVEL</span>
                  <span className={`badge-priority ${activeEvent.priority.toLowerCase()}`} style={{ fontSize: "9px" }}>{activeEvent.priority}</span>
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: "10.5px", fontWeight: "700" }}>METRIC STATUS</span>
                  <span className="badge bg-secondary" style={{ fontSize: "9px", fontWeight: "700" }}>{activeEvent.status}</span>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-2 border-top flex-wrap gap-2">
              <button type="button" className="btn-profile-secondary" onClick={() => {
                setEvents(prev => prev.map(ev => ev.id === activeEvent.id ? { ...ev, status: ev.status === "Completed" ? "Scheduled" : "Completed" } : ev));
                setShowDetailsModal(false);
              }}>
                {activeEvent.status === "Completed" ? "Revert State" : "Mark Executed"}
              </button>
              <div className="d-flex gap-2">
                <button type="button" className="btn-profile-secondary" onClick={() => { setAnnouncementForm({ ...activeEvent }); setShowDetailsModal(false); setShowEditModal(true); }}>Edit</button>
                <button type="button" className="btn-profile-secondary text-danger" onClick={() => { setShowDetailsModal(false); setShowDeleteConfirm(true); }}>Purge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ARCHITECTURE: Edit Event Form Configuration Overlay */}
      {showEditModal && activeEvent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-pencil-square"></i> Configure Slates Ledger</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={() => { setShowEditModal(false); setShowDetailsModal(true); }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Event System Title</label>
                  <input type="text" name="title" value={eventForm.title} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Schedules Classification Layer</label>
                  <select name="type" value={eventForm.type} onChange={handleInputChange}>
                    <option value="Meeting">Meeting</option>
                    <option value="Holiday">Corporate Holiday</option>
                    <option value="Deadline">Project Milestone Deadline</option>
                    <option value="Training">Corporate Training Session</option>
                  </select>
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Timeline Target Date</label>
                  <input type="date" name="date" value={eventForm.date} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Start Window Time</label>
                  <input type="text" name="startTime" value={eventForm.startTime} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>End Window Time</label>
                  <input type="text" name="endTime" value={eventForm.endTime} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Target Segment Distribution</label>
                  <input type="text" name="targetAudience" value={eventForm.targetAudience} onChange={handleInputChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Physical Node / Comms Link</label>
                  <input type="text" name="location" value={eventForm.location} onChange={handleInputChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Urgency Level</label>
                  <select name="priority" value={eventForm.priority} onChange={handleInputChange}>
                    <option value="High">High Priority</option>
                    <option value="Normal">Normal Scope</option>
                    <option value="Low">Low Scope</option>
                  </select>
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>State Baseline</label>
                  <select name="status" value={eventForm.status} onChange={handleInputChange}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-12 modal-form-group">
                  <label>Operational Briefing Context</label>
                  <textarea name="description" rows={2} value={eventForm.description} onChange={handleInputChange}></textarea>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => { setShowEditModal(false); setShowDetailsModal(true); }}>Cancel</button>
                <button type="submit" className="btn-profile-primary">Commit Matrix Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ARCHITECTURE: Irreversible State Purge Confirm Overlay */}
      {showDeleteConfirm && activeEvent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "350px", maxWidth: "90%" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#ef4444", marginBottom: "14px" }}>Purge tracking slot?</h4>
            <p style={{ fontSize: "12.5px", color: "#64748b" }}>Are you sure you want to permanently delete event "<strong>{activeEvent.title}</strong>"?</p>
            <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
              <button type="button" className="btn-profile-secondary font-weight-700" onClick={() => { setShowDeleteConfirm(false); setShowDetailsDrawer(true); }}>Cancel</button>
              <button type="button" className="btn-profile-primary bg-danger text-white" style={{ border: "none" }} onClick={handleDeleteConfirmSubmit}>Confirm Purge</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCalendar;









import React, { useState } from "react";

const AdminTasks = () => {
  const [activeCategory, setActiveCategory] = useState("All Tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [departmentFilter, setCategoryFilter] = useState("All");

  // Production state engines initialized to empty clean baselines
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Administrative form schema layer template
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "2026-07-17",
    dueTime: "05:00 PM",
    assignedTo: "",
    department: "Sales",
    status: "Pending",
    notes: ""
  });

  // Sidebar task allocation dynamic counters matching dashboard layout
  const allTasksCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === "Pending").length;
  const progressCount = tasks.filter(t => t.status === "In Progress").length;
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const overdueCount = tasks.filter(t => t.dueDate < "2026-07-17" && t.status !== "Completed").length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    const newTask = {
      ...taskForm,
      id: Date.now().toString(),
      createdBy: "System Administrator",
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);
    handleModalClose();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, ...taskForm } : t));
    handleModalClose();
  };

  const handleStatusToggle = (task, e) => {
    e.stopPropagation();
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
  };

  const handleTaskDelete = (id, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this task?")) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      assignedTo: task.assignedTo,
      department: task.department,
      status: task.status,
      notes: task.notes
    });
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedTask(null);
    setTaskForm({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "2026-07-17",
      dueTime: "05:00 PM",
      assignedTo: "",
      department: "Sales",
      status: "Pending",
      notes: ""
    });
  };

  // Pipeline Filter Mechanics matching Dashboard metrics
  const categoryFilteredTasks = tasks.filter(t => {
    if (activeCategory === "Pending") return t.status === "Pending";
    if (activeCategory === "In Progress") return t.status === "In Progress";
    if (activeCategory === "Completed") return t.status === "Completed";
    if (activeCategory === "Overdue") return t.dueDate < "2026-07-17" && t.status !== "Completed";
    return true;
  });

  const finalFilteredTasks = categoryFilteredTasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;
    const matchesDept = departmentFilter === "All" || t.department === departmentFilter;

    return matchesSearch && matchesPriority && matchesDept;
  });

  return (
    <div className="dashboard-card-flat">
      
      {/* 1. View Header and Master Controls */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h3 className="mb-1" style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", color: "var(--crm-dark)", letterSpacing: "0.02em" }}>
            Task Operations Control
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
            Assign workforce items, monitor operational statuses, and track team backlogs.
          </p>
        </div>
        <button type="button" className="btn-profile-primary" style={{ padding: "8px 20px" }} onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Assign New Task
        </button>
      </div>

      {/* 2. Overview Analytic Mini Grid */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Assigned", val: allTasksCount, icon: "bi-clipboard-data", color: "var(--crm-primary)" },
          { label: "Pending Baseline", val: pendingCount, icon: "bi-pause-circle", color: "#f97316" },
          { label: "Active Sprints", val: progressCount, icon: "bi-arrow-repeat", color: "#a855f7" },
          { label: "Overdue Backlog", val: overdueCount, icon: "bi-exclamation-circle", color: "#ef4444" }
        ].map((stat, idx) => (
          <div className="col-6 col-md-3" key={idx}>
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

      {/* 3. Filtering Modulation Strip */}
      <div className="tasks-toolbar mb-3 p-2 bg-light border rounded-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="nav-search-bar" style={{ width: "220px", background: "#ffffff", border: "1px solid var(--crm-border)" }}>
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              className="nav-search-input" 
              placeholder="Search by title, owner..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select className="form-select btn-profile-secondary py-1 px-3" style={{ width: "130px", fontSize: "12.5px", height: "36px", border: "1px solid var(--crm-border)" }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select className="form-select btn-profile-secondary py-1 px-3" style={{ width: "140px", fontSize: "12.5px", height: "36px", border: "1px solid var(--crm-border)" }} value={departmentFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Departments</option>
            <option value="Sales">Sales</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Support">Support</option>
            <option value="HR">HR</option>
          </select>
        </div>
      </div>

      {/* 4. Split Structural Layout Workspace */}
      <div className="tasks-layout-wrapper">
        
        {/* Left Side Tab Counters Stack */}
        <div className="tasks-left-sidebar">
          {[
            { name: "All Tasks", count: allTasksCount },
            { name: "Pending", count: pendingCount },
            { name: "In Progress", count: progressCount },
            { name: "Completed", count: completedCount },
            { name: "Overdue", count: overdueCount }
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

        {/* Right Side Content Listing */}
        <div className="tasks-right-content">
          {finalFilteredTasks.length === 0 ? (
            <div className="empty-state-card">
              <i className="bi bi-clipboard empty-state-icon"></i>
              <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 6px 0" }}>No Ledger Actions Found</h4>
              <p className="text-muted mb-0" style={{ fontSize: "12px" }}>No tasks matched the specified matrix indices.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {finalFilteredTasks.map(task => (
                <div key={task.id} className="task-row-card d-flex align-items-center justify-content-between p-3 bg-white border rounded-3" onClick={() => openEditModal(task)}>
                  <div className="d-flex align-items-center gap-3 min-width-0">
                    <div className={`task-row-checkbox ${task.status === "Completed" ? "completed" : ""}`} onClick={(e) => handleStatusToggle(task, e)}>
                      {task.status === "Completed" && <i className="bi bi-check"></i>}
                    </div>
                    <div className="text-truncate">
                      <strong className="d-block text-dark" style={{ fontSize: "13.5px", textDecoration: task.status === "Completed" ? "line-through" : "none" }}>{task.title}</strong>
                      <span className="text-muted" style={{ fontSize: "11.5px" }}>Assigned to: <strong>{task.assignedTo || "Unassigned"}</strong> &nbsp;•&nbsp; Dept: <strong>{task.department}</strong></span>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center gap-3">
                    <span className={`badge-priority ${task.priority.toLowerCase()}`} style={{ fontSize: "9.5px" }}>{task.priority}</span>
                    <span className="text-muted" style={{ fontSize: "12px", fontWeight: "600" }}><i className="bi bi-calendar-event me-1"></i>{task.dueDate}</span>
                    <button type="button" className="nav-icon-control text-danger p-0 border-0 bg-transparent" onClick={(e) => handleTaskDelete(task.id, e)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODAL CONFIGURATOR PANEL OVERLAYS */}
      {(showAddModal || showEditModal) && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-file-earmark-check-fill"></i> {showAddModal ? "Assign Matrix Item" : "Modify Task Parameters"}</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={handleModalClose}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={showAddModal ? handleCreateSubmit : handleEditSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Task System Identifier Label</label>
                  <input type="text" name="title" placeholder="Define objective heading..." value={taskForm.title} onChange={handleInputChange} required />
                </div>
                <div className="col-12 modal-form-group">
                  <label>Operational Description Briefing</label>
                  <textarea name="description" rows={2} placeholder="Detail core instructions..." value={taskForm.description} onChange={handleInputChange}></textarea>
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Workforce Assignment Target</label>
                  <input type="text" name="assignedTo" placeholder="Employee Name..." value={taskForm.assignedTo} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Target Core Department</label>
                  <select name="department" value={taskForm.department} onChange={handleInputChange}>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Target Execution Date</label>
                  <input type="date" name="dueDate" value={taskForm.dueDate} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Execution Window Time</label>
                  <input type="text" name="dueTime" value={taskForm.dueTime} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Priority Hierarchy Tier</label>
                  <select name="priority" value={taskForm.priority} onChange={handleInputChange}>
                    <option value="High">High Urgency</option>
                    <option value="Medium">Medium Scope</option>
                    <option value="Low">Low Scope</option>
                  </select>
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>State Baseline</label>
                  <select name="status" value={taskForm.status} onChange={handleInputChange}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-12 modal-form-group">
                  <label>Internal Audit / Supervisor Notes</label>
                  <textarea name="notes" rows={2} placeholder="Add tracking guidelines..." value={taskForm.notes} onChange={handleInputChange}></textarea>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={handleModalClose}>Cancel</button>
                <button type="submit" className="btn-profile-primary">{showAddModal ? "Deploy Task" : "Commit Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTasks;












import React, { useState } from "react";

const AdminTeam = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Production directory state engines initialized to empty pristine layouts
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  // Administrative form schema parameter templates
  const [memberForm, setMemberForm] = useState({
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
    joiningDate: "2026-07-17",
    status: "Offline",
    profileImage: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMemberForm(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!memberForm.firstName.trim() || !memberForm.lastName.trim()) return;

    const newMember = {
      ...memberForm,
      id: Date.now().toString()
    };

    setTeamMembers(prev => [...prev, newMember]);
    handleModalClose();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!memberForm.firstName.trim() || !memberForm.lastName.trim()) return;

    setTeamMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, ...memberForm } : m));
    setSelectedMember({ ...selectedMember, ...memberForm });
    setShowEditModal(false);
    setShowDetailsDrawer(true);
  };

  const handleMemberDelete = (id) => {
    if (confirm(`Permanently remove member from the corporate directory configuration?`)) {
      setTeamMembers(prev => prev.filter(m => m.id !== id));
      setShowDetailsDrawer(false);
      setSelectedMember(null);
    }
  };

  const openEditModal = () => {
    setMemberForm({ ...selectedMember });
    setShowDetailsDrawer(false);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setMemberForm({
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
      joiningDate: "2026-07-17",
      status: "Offline",
      profileImage: ""
    });
  };

  // Directory Overview Stat Aggregators
  const totalEmployees = teamMembers.length;
  const activeDepartments = new Set(teamMembers.map(m => m.department)).size;
  const totalManagers = teamMembers.filter(m => m.role === "Manager").length;
  const totalOnline = teamMembers.filter(m => m.status === "Online").length;

  const getDeptCount = (deptName) => teamMembers.filter(m => m.department === deptName).length;

  // Pipeline Filter Logic matching Dashboard directory mechanics
  const filteredMembers = teamMembers.filter(m => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                          m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || m.department === deptFilter;
    const matchesRole = roleFilter === "All" || m.role === roleFilter;
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (status === "Online") return "#10b981";
    if (status === "Away") return "#eab308";
    return "#64748b";
  };

  return (
    <div className="dashboard-card-flat">
      
      {/* 1. View Header Section */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h3 className="mb-0" style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", color: "var(--crm-dark)", letterSpacing: "0.02em" }}>
            Enterprise Directory Control
          </h3>
        </div>
        <button type="button" className="btn-profile-primary" style={{ padding: "8px 20px" }} onClick={() => setShowAddModal(true)}>
          <i className="bi bi-person-plus me-2"></i>Add Team Member
        </button>
      </div>

      {/* 2. Recreated Corporate Analytic Metric Block Grid */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Employees", val: totalEmployees, icon: "bi-people", color: "var(--crm-primary)" },
          { label: "Active Nodes", val: activeDepartments, icon: "bi-building", color: "#a855f7" },
          { label: "Governance Managers", val: totalManagers, icon: "bi-person-badge", color: "#f97316" },
          { label: "Active Connections", val: totalOnline, icon: "bi-wifi", color: "#10b981" }
        ].map((stat, idx) => (
          <div className="col-6 col-md-3" key={idx}>
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

      {/* 3. Recreated Shared Split Layout Interface */}
      <div className="team-layout-wrapper">
        
        {/* Left Side Column Department Filters Stack */}
        <div className="team-left-sidebar d-none d-md-flex flex-column gap-2">
          <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.02em", marginBottom: "4px" }}>
            Departments
          </h4>
          {[
            { name: "All", count: totalEmployees },
            { name: "Sales", count: getDeptCount("Sales") },
            { name: "Engineering", count: getDeptCount("Engineering") },
            { name: "Marketing", count: getDeptCount("Marketing") },
            { name: "Support", count: getDeptCount("Support") },
            { name: "HR", count: getDeptCount("HR") }
          ].map(d => (
            <div 
              key={d.name}
              className={`team-dept-card ${deptFilter === d.name ? "active" : ""}`}
              onClick={() => setDeptFilter(d.name)}
            >
              <div className="team-dept-name">{d.name}</div>
              <div className="team-dept-count">{d.count} Registered</div>
            </div>
          ))}
        </div>

        {/* Right Side Column Staff Dynamic Grid Directory */}
        <div className="team-right-content">
          <div className="d-flex flex-wrap gap-2 mb-3 align-items-center justify-content-between">
            <div className="nav-search-bar" style={{ width: "240px", background: "var(--crm-bg)", border: "1px solid var(--crm-border)" }}>
              <i className="bi bi-search"></i>
              <input type="text" className="nav-search-input" placeholder="Search ID, name, title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="d-flex gap-2">
              <select className="form-select py-1 px-3" style={{ width: "130px", fontSize: "12.5px", height: "36px" }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="All">All Roles</option>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <select className="form-select py-1 px-3" style={{ width: "130px", fontSize: "12.5px", height: "36px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Online">Online</option>
                <option value="Away">Away</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="empty-state-card py-5">
              <i className="bi bi-people empty-state-icon" style={{ fontSize: "52px" }}></i>
              <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 8px 0" }}>No Staff Configurations Found</h4>
              <p className="text-muted mb-0" style={{ fontSize: "12.5px" }}>No profile ledgers match your target filtering conditions.</p>
            </div>
          ) : (
            <div className="team-grid-container">
              {filteredMembers.map(member => {
                const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase();
                return (
                  <div className="team-member-card" key={member.id}>
                    {member.profileImage ? (
                      <img src={member.profileImage} alt="Profile Card" className="member-card-photo" />
                    ) : (
                      <div className="member-card-initials">{initials || "U"}</div>
                    )}
                    <h5 className="member-card-name">{member.firstName} {member.lastName}</h5>
                    <span className="member-card-designation">{member.designation || "—"}</span>
                    <span className="member-card-dept">{member.department}</span>

                    <div className="member-card-meta">
                      <span>Employee ID: <strong>{member.employeeId || "Not Set"}</strong></span>
                      <span>Email Stack: <strong>{member.email}</strong></span>
                    </div>

                    <div className={`member-status-indicator ${member.status.toLowerCase()}`}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: getStatusColor(member.status), display: "inline-block" }}></span>
                      {member.status}
                    </div>

                    <button type="button" className="profile-view-link mt-2" onClick={() => { setSelectedMember(member); setShowDetailsDrawer(true); }}>
                      View Profile Matrix →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* MODAL CONFIGURATORS: Add and Edit Parameter Overlays */}
      {(showAddModal || showEditModal) && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", center: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "550px", maxWidth: "95%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-person-fill-gear"></i> {showAddModal ? "Configure Profile Slot" : "Modify Member Directives"}</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={handleModalClose}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={showAddModal ? handleCreateSubmit : handleEditSubmit}>
              <div className="row g-3">
                <div className="col-md-6 modal-form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={memberForm.firstName} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={memberForm.lastName} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Enterprise Email Routing</label>
                  <input type="email" name="email" value={memberForm.email} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Secure Communication Phone</label>
                  <input type="text" name="phone" value={memberForm.phone} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Unique Corporate Employee ID</label>
                  <input type="text" name="employeeId" value={memberForm.employeeId} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Operating Unit Department</label>
                  <select name="department" value={memberForm.department} onChange={handleInputChange}>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Functional Title Designation</label>
                  <input type="text" name="designation" value={memberForm.designation} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>System Privilege Group Role</label>
                  <select name="role" value={memberForm.role} onChange={handleInputChange}>
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Direct Reporting Supervisor</label>
                  <input type="text" name="manager" value={memberForm.manager} onChange={handleInputChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Operating Anchor Node Location</label>
                  <input type="text" name="officeLocation" value={memberForm.officeLocation} onChange={handleInputChange} />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Registry Joining Date</label>
                  <input type="date" name="joiningDate" value={memberForm.joiningDate} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Connection Synchronization Status</label>
                  <select name="status" value={memberForm.status} onChange={handleInputChange}>
                    <option value="Online">Online</option>
                    <option value="Away">Away</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div className="col-12 modal-form-group">
                  <label>Directory Photo Identification</label>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={handleModalClose}>Cancel</button>
                <button type="submit" className="btn-profile-primary">{showAddModal ? "Provision Member" : "Commit Edits"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER ARCHITECTURE: Detailed Profile Ledger Drawer System */}
      {showDetailsDrawer && selectedMember && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.15)", zIndex: 1099 }} onClick={() => setShowDetailsDrawer(false)}></div>
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "440px", maxWidth: "100%", background: "var(--crm-card)", boxShadow: "-4px 0 24px rgba(15, 23, 42, 0.15)", zIndex: 1100, display: "flex", flexDirection: "column", padding: "24px", height: "100vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
              <h3 className="mb-0" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-dark)", textTransform: "uppercase" }}>Directory Information</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={() => setShowDetailsDrawer(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="d-flex flex-column gap-3 flex-grow-1 overflow-y-auto" style={{ paddingRight: "4px" }}>
              <div className="text-center pb-3 border-bottom">
                {selectedMember.profileImage ? (
                  <img src={selectedMember.profileImage} alt="Profile Header" className="member-card-photo" style={{ width: "90px", height: "90px" }} />
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
                  <strong>{selectedMember.employeeId || "None Specified"}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>GOVERNANCE NODE</span>
                  <strong>{selectedMember.department}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>REGISTRY DATE</span>
                  <strong>{selectedMember.joiningDate}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>OFFICE NODE</span>
                  <strong>{selectedMember.officeLocation || "Remote"}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>LINE MANAGER</span>
                  <strong>{selectedMember.manager || "Unspecified System Root"}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>PRIVILEGE TIER</span>
                  <strong>{selectedMember.role}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>OFFICIAL EMAIL</span>
                  <strong>{selectedMember.email}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: "10px", fontWeight: "700" }}>PHONE INDEX</span>
                  <strong>{selectedMember.phone}</strong>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 border-top pt-3 mt-3">
              <div className="d-flex gap-2">
                <button type="button" className="btn-profile-secondary flex-grow-1" onClick={openEditModal}>Modify Entry</button>
                <button type="button" className="btn-profile-secondary text-danger flex-grow-1" onClick={() => handleMemberDelete(selectedMember.id)}>Deprovision</button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminTeam;







import React, { useState } from "react";

const AdminDocuments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  // Production data architectures initialized to pristine empty states
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Form parameter state templates
  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "Contract",
    department: "Sales",
    description: "",
    visibility: "Public",
    sizeVal: 0.0,
    extension: "PDF"
  });

  const [folderForm, setFolderForm] = useState({
    name: "",
    department: "Sales"
  });

  const [renameValue, setRenameValue] = useState("");
  const [moveDeptValue, setMoveDeptValue] = useState("Sales");

  // Core Document Actions 
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) return;

    const extMap = { PDF: ".pdf", DOCX: ".docx", XLSX: ".xlsx", CSV: ".csv", ZIP: ".zip", PNG: ".png", JPG: ".jpg" };
    const extension = extMap[uploadForm.extension] || ".pdf";

    const newFile = {
      id: Date.now().toString(),
      name: uploadForm.name.trim() + extension,
      type: "File",
      category: uploadForm.category,
      department: uploadForm.department,
      uploadedBy: "System Administrator",
      size: `${uploadForm.sizeVal || 1.2} MB`,
      lastModified: new Date().toISOString().split("T")[0],
      status: uploadForm.visibility === "Private" ? "Private" : "Active",
      description: uploadForm.description,
      extension: extension
    };

    setDocuments(prev => [newFile, ...prev]);
    setShowUploadModal(false);
    resetUploadForm();
  };

  const handleFolderSubmit = (e) => {
    e.preventDefault();
    if (!folderForm.name.trim()) return;

    const newFolder = {
      id: Date.now().toString(),
      name: folderForm.name.trim(),
      type: "Folder",
      category: "Directory",
      department: folderForm.department,
      uploadedBy: "System Administrator",
      size: "-",
      lastModified: new Date().toISOString().split("T")[0],
      status: "Active",
      description: "Document storage folder",
      extension: "Folder"
    };

    setDocuments(prev => [newFolder, ...prev]);
    setShowFolderModal(false);
    setFolderForm({ name: "", department: "Sales" });
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!renameValue.trim() || !selectedDoc) return;

    let newName = renameValue.trim();
    if (selectedDoc.type === "File" && selectedDoc.extension && !newName.endsWith(selectedDoc.extension)) {
      newName += selectedDoc.extension;
    }

    setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, name: newName } : d));
    setShowRenameModal(false);
    setSelectedDoc(null);
  };

  const handleMoveSubmit = (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, department: moveDeptValue } : d));
    setShowMoveModal(false);
    setSelectedDoc(null);
  };

  const handleDocDelete = (id) => {
    if (confirm("Are you sure you want to permanently delete this repository entry?")) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      name: "",
      category: "Contract",
      department: "Sales",
      description: "",
      visibility: "Public",
      sizeVal: 0.0,
      extension: "PDF"
    });
  };

  // Recreated icon resolver mechanics matching parent dashboard 
  const getFileIcon = (item) => {
    if (item.type === "Folder") return "bi-folder-fill text-warning";
    const ext = (item.extension || "").toLowerCase();
    switch (ext) {
      case ".pdf": return "bi-file-earmark-pdf-fill text-danger";
      case ".docx": return "bi-file-earmark-word-fill text-primary";
      case ".xlsx": return "bi-file-earmark-excel-fill text-success";
      case ".csv": return "bi-filetype-csv text-success";
      case ".zip": return "bi-file-earmark-zip-fill text-warning";
      default: return "bi-file-earmark-fill text-secondary";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active": return "bg-success-subtle text-success";
      case "Private": return "bg-danger-subtle text-danger";
      default: return "bg-light text-dark";
    }
  };

  // Repository aggregate metrics mapping
  const totalFilesCount = documents.filter(d => d.type === "File").length;
  const totalFoldersCount = documents.filter(d => d.type === "Folder").length;

  // Pipeline Filter Logic matching Dashboard directory filters
  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = catFilter === "All" || d.category === catFilter;
    const matchesDept = deptFilter === "All" || d.department === deptFilter;
    const matchesStatus = statusFilter === "All" || d.status === statusFilter;

    let matchesType = true;
    if (typeFilter !== "All") {
      if (typeFilter === "Folder") matchesType = d.type === "Folder";
      else matchesType = d.type === "File" && d.name.toLowerCase().endsWith(typeFilter.toLowerCase());
    }

    return matchesSearch && matchesCat && matchesDept && matchesStatus && matchesType;
  });

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === "Name") return a.name.localeCompare(b.name);
    return b.id.localeCompare(a.id); // Defaulting to newest entries
  });

  return (
    <div className="dashboard-card-flat">
      {/* 1. Header Information System */}
      <div className="mb-4 pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h3 className="mb-1" style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", color: "var(--crm-dark)", letterSpacing: "0.02em" }}>
            Enterprise Repositories
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
            Browse, upload, map permissions, and arrange master documentation matrices.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button type="button" className="btn-profile-secondary" onClick={() => setShowFolderModal(true)}>
            <i className="bi bi-folder-plus me-2"></i>Create Folder
          </button>
          <button type="button" className="btn-profile-primary" onClick={() => setShowUploadModal(true)}>
            <i className="bi bi-file-earmark-arrow-up me-2"></i>Upload Document
          </button>
        </div>
      </div>

      {/* 2. Overview Analytical Metric Grid */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Managed Files", val: totalFilesCount, icon: "bi-file-earmark-text", color: "var(--crm-primary)" },
          { label: "Directory Folders", val: totalFoldersCount, icon: "bi-folder2", color: "#eab308" },
          { label: "System Storage Allocated", val: totalFilesCount > 0 ? `${(totalFilesCount * 1.2).toFixed(1)} MB` : "0.00 KB", icon: "bi-hdd-network", color: "#a855f7" }
        ].map((stat, idx) => (
          <div className="col-12 col-md-4" key={idx}>
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

      {/* 3. Search and Moderation Toolbar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="nav-search-bar" style={{ width: "200px", background: "var(--crm-bg)", border: "1px solid var(--crm-border)" }}>
            <i className="bi bi-search"></i>
            <input type="text" className="nav-search-input" placeholder="Search parameters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <select className="form-select py-1 px-3" style={{ width: "130px", fontSize: "12.5px", height: "36px" }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="All">Category</option>
            <option value="Contract">Contract</option>
            <option value="Proposal">Proposal</option>
            <option value="Invoice">Invoice</option>
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
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted" style={{ fontSize: "12px", fontWeight: "700" }}>Sort:</span>
          <select className="form-select py-1 px-3" style={{ width: "120px", fontSize: "12.5px", height: "36px" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Newest">Newest</option>
            <option value="Name">Name</option>
          </select>
        </div>
      </div>

      {/* 4. Main Documents Matrix Interface Viewport */}
      {sortedDocs.length === 0 ? (
        <div className="empty-state-card py-5">
          <i className="bi bi-folder2-open empty-state-icon" style={{ fontSize: "52px" }}></i>
          <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 8px 0" }}>No Ledger Items Found</h4>
          <p className="text-muted mb-0" style={{ fontSize: "12.5px" }}>The file repository configuration layer contains no tracked nodes matching these indices.</p>
        </div>
      ) : (
        <>
          {/* DESKTOP MATRIX GRID VIEW */}
          <div className="table-responsive bg-white rounded-3 border d-none d-md-block">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
              <thead className="table-light text-muted" style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                <tr>
                  <th>Object Name</th>
                  <th>Category</th>
                  <th>Department Mapping</th>
                  <th>Uploader</th>
                  <th>Size</th>
                  <th>Modified Date</th>
                  <th>Visibility</th>
                  <th className="text-end">Management Actions</th>
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
                    <td><span className={`badge ${getStatusBadgeClass(doc.status)}`}>{doc.status}</span></td>
                    <td className="text-end">
                      <div className="dropdown d-inline-block">
                        <button className="btn btn-sm btn-light border py-1 px-2 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          Actions
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" style={{ fontSize: "12.5px" }}>
                          <li><button className="dropdown-item" type="button" onClick={() => { setSelectedDoc(doc); setRenameValue(doc.name.replace(doc.extension || "", "")); setShowRenameModal(true); }}><i className="bi bi-pencil-square me-2"></i>Rename</button></li>
                          <li><button className="dropdown-item" type="button" onClick={() => { setSelectedDoc(doc); setMoveDeptValue(doc.department); setShowMoveModal(true); }}><i className="bi bi-folder-symlink me-2"></i>Move Node</button></li>
                          <li><hr className="dropdown-divider" /></li>
                          <li><button className="dropdown-item text-danger" type="button" onClick={() => handleDocDelete(doc.id)}><i className="bi bi-trash me-2"></i>Delete</button></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARDS VIEWPORT */}
          <div className="d-md-none d-flex flex-column gap-2">
            {sortedDocs.map(doc => (
              <div key={doc.id} className="p-3 bg-white rounded-3 border">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${getFileIcon(doc)}`} style={{ fontSize: "18px" }}></i>
                    <strong className="text-dark">{doc.name}</strong>
                  </div>
                  
                  <div className="dropdown">
                    <button className="btn btn-sm btn-light border py-1 px-2 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      Actions
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" style={{ fontSize: "12.5px" }}>
                      <li><button className="dropdown-item" type="button" onClick={() => { setSelectedDoc(doc); setRenameValue(doc.name.replace(doc.extension || "", "")); setShowRenameModal(true); }}><i className="bi bi-pencil-square me-2"></i>Rename</button></li>
                      <li><button className="dropdown-item" type="button" onClick={() => { setSelectedDoc(doc); setMoveDeptValue(doc.department); setShowMoveModal(true); }}><i className="bi bi-folder-symlink me-2"></i>Move</button></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><button className="dropdown-item text-danger" type="button" onClick={() => handleDocDelete(doc.id)}><i className="bi bi-trash me-2"></i>Delete</button></li>
                    </ul>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 text-muted" style={{ fontSize: "11.5px" }}>
                  <span>Category: <strong>{doc.category}</strong></span>
                  <span>•</span>
                  <span>Node: <span className="badge bg-light text-dark">{doc.department}</span></span>
                  <span>•</span>
                  <span>Size: <strong>{doc.size}</strong></span>
                </div>
                <div className="mt-2 pt-2 border-top d-flex justify-content-between text-muted align-items-center" style={{ fontSize: "11px" }}>
                  <span>Mod: {doc.lastModified}</span>
                  <span className={`badge ${getStatusBadgeClass(doc.status)}`}>{doc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL ARCHITECTURE: Upload Document Overlay */}
      {showUploadModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "500px", maxWidth: "95%" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-file-earmark-arrow-up"></i> Upload Corporate Document</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={() => setShowUploadModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Select File</label>
                  <input type="file" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const nameParts = file.name.split(".");
                      const ext = nameParts.length > 1 ? "." + nameParts.pop() : "";
                      setUploadForm(prev => ({
                        ...prev,
                        name: nameParts.join("."),
                        sizeVal: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
                        extension: ext.replace(".", "").toUpperCase() || "PDF"
                      }));
                    }
                  }} required />
                </div>

                <div className="col-md-8 modal-form-group">
                  <label>Document Identifier Label</label>
                  <input type="text" placeholder="Enter target name..." value={uploadForm.name} onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))} required />
                </div>

                <div className="col-md-4 modal-form-group">
                  <label>File Structure Type</label>
                  <select value={uploadForm.extension} onChange={(e) => setUploadForm(prev => ({ ...prev, extension: e.target.value }))}>
                    <option value="PDF">PDF (.pdf)</option>
                    <option value="DOCX">Word (.docx)</option>
                    <option value="XLSX">Excel (.xlsx)</option>
                    <option value="ZIP">ZIP Archive (.zip)</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>System Classification Category</label>
                  <select value={uploadForm.category} onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}>
                    <option value="Contract">Contract</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Internal">Internal Reference</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Access Boundary Department</label>
                  <select value={uploadForm.department} onChange={(e) => setUploadForm(prev => ({ ...prev, department: e.target.value }))}>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div className="col-12 modal-form-group">
                  <label>Repository Log Details / Context</label>
                  <textarea rows="3" placeholder="Context description summary..." value={uploadForm.description} onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}></textarea>
                </div>

                <div className="col-12">
                  <label className="d-block mb-2" style={{ fontSize: "11px", fontWeight: "750", textTransform: "uppercase", color: "#64748b" }}>Permission State</label>
                  <div className="d-flex gap-4">
                    {["Public", "Private"].map(vis => (
                      <div className="form-check" key={vis}>
                        <input className="form-check-input" type="radio" name="visRadio" id={`vis-${vis}`} checked={uploadForm.visibility === vis} onChange={() => setUploadForm(prev => ({ ...prev, visibility: vis }))} />
                        <label className="form-check-label" htmlFor={`vis-${vis}`} style={{ fontSize: "12px", fontWeight: "600" }}>{vis}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn-profile-primary">Commit Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURATOR: Create Directory Folder Overlay */}
      {showFolderModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "420px", maxWidth: "95%" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-folder-plus"></i> Initialize Directory Node</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={() => setShowFolderModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleFolderSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Folder Structural Name</label>
                  <input type="text" placeholder="Enter folder name..." value={folderForm.name} onChange={(e) => setFolderForm(prev => ({ ...prev, name: e.target.value }))} required />
                </div>
                <div className="col-12 modal-form-group">
                  <label>Boundary Unit Mapping</label>
                  <select value={folderForm.department} onChange={(e) => setFolderForm(prev => ({ ...prev, department: e.target.value }))}>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => setShowFolderModal(false)}>Cancel</button>
                <button type="submit" className="btn-profile-primary">Deploy Folder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURATOR: Rename File/Folder Node */}
      {showRenameModal && selectedDoc && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "400px", maxWidth: "95%" }}>
            <div className="card-flat-title-bar">
              <h3>Rename Object Node</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={() => { setShowRenameModal(false); setSelectedDoc(null); }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleRenameSubmit}>
              <div className="modal-form-group mb-3">
                <label>Target Identifier Title</label>
                <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} required />
                {selectedDoc.type === "File" && selectedDoc.extension && (
                  <span className="text-muted mt-1 d-block" style={{ fontSize: "11px" }}>Preserving node path extension {selectedDoc.extension} automatically.</span>
                )}
              </div>
              <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => { setShowRenameModal(false); setSelectedDoc(null); }}>Cancel</button>
                <button type="submit" className="btn-profile-primary">Update Name</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURATOR: Move Department Boundary Mapping */}
      {showMoveModal && selectedDoc && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "400px", maxWidth: "95%" }}>
            <div className="card-flat-title-bar">
              <h3>Reassign Unit Node</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={() => { setShowMoveModal(false); setSelectedDoc(null); }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleMoveSubmit}>
              <div className="modal-form-group mb-3">
                <label>Move node to Target Unit</label>
                <select value={moveDeptValue} onChange={(e) => setMoveDeptValue(e.target.value)}>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Support">Support</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={() => { setShowMoveModal(true); setSelectedDoc(null); }}>Cancel</button>
                <button type="submit" className="btn-profile-primary">Commit Move</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDocuments;












import React, { useState } from "react";

const AdminNotifications = () => {
  const [filterTab, setFilterTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Production data architectures initialized to pristine empty states
  const [dispatchedNotifications, setDispatchedNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Administrative message dispatch form template
  const [dispatchForm, setDispatchForm] = useState({
    title: "",
    message: "",
    category: "System Update",
    priority: "Normal",
    recipientGroup: "All Users"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDispatchForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (!dispatchForm.title.trim() || !dispatchForm.message.trim()) return;

    const newNotification = {
      id: Date.now().toString(),
      title: dispatchForm.title.trim(),
      description: dispatchForm.message.trim(),
      category: dispatchForm.category,
      priority: dispatchForm.priority,
      recipientGroup: dispatchForm.recipientGroup,
      time: "Just now",
      date: "2026-07-17",
      unread: true,
      archived: false
    };

    setDispatchedNotifications(prev => [newNotification, ...prev]);
    setShowCreateModal(false);
    setDispatchForm({
      title: "",
      message: "",
      category: "System Update",
      priority: "Normal",
      recipientGroup: "All Users"
    });
  };

  const handleUpdateStatus = (id, field, value) => {
    setDispatchedNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, [field]: value } : n))
    );
  };

  const handlePurgeNotification = (id) => {
    if (confirm("Are you sure you want to permanently delete this dispatch record?")) {
      setDispatchedNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Recreated system layout icons matching the parent dashboard configuration
  const getNotifIcon = (category) => {
    switch (category) {
      case "Task Management": return "bi-check2-square text-success";
      case "Security Alert": return "bi-shield-lock text-danger";
      case "Compliance": return "bi-file-earmark-text text-warning";
      default: return "bi-hdd-network text-secondary";
    }
  };

  // Dispatch metrics analytics counters
  const totalCount = dispatchedNotifications.filter(n => !n.archived).length;
  const unreadCount = dispatchedNotifications.filter(n => n.unread && !n.archived).length;
  const archivedCount = dispatchedNotifications.filter(n => n.archived).length;
  const highPriorityCount = dispatchedNotifications.filter(n => n.priority === "High" && !n.archived).length;

  // Pipeline Filter Logic matching Dashboard structural mechanics
  const filteredNotifications = dispatchedNotifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterTab === "Unread") return matchesSearch && n.unread && !n.archived;
    if (filterTab === "High Priority") return matchesSearch && n.priority === "High" && !n.archived;
    if (filterTab === "Archived") return matchesSearch && n.archived;
    return matchesSearch && !n.archived;
  });

  return (
    <div className="dashboard-card-flat">
      
      {/* 1. Header Information System Control */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h3 className="mb-1" style={{ fontSize: "16px", fontWeight: "800", textTransform: "uppercase", color: "var(--crm-dark)", letterSpacing: "0.02em" }}>
            Notification Dispatch Management
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
            Broadcast real-time system alerts, compliance changes, and targeted organization dispatches.
          </p>
        </div>
        <button type="button" className="btn-profile-primary" style={{ padding: "8px 20px" }} onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-send me-2"></i>Dispatch Notification
        </button>
      </div>

      {/* 2. Recreated Split Architecture Workspace Grid */}
      <div className="notif-layout-wrapper">
        
        {/* Main Content Workspace Column */}
        <div className="notif-main-content">
          
          {/* Filtering Tab Stack Buttons & Localized Query Inputs */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-2">
            <div className="notif-filter-tabs">
              <button type="button" className={`notif-filter-tab ${filterTab === "All" ? "active" : ""}`} onClick={() => setFilterTab("All")}>
                Active Logs <span className="notif-badge-blue">{totalCount}</span>
              </button>
              <button type="button" className={`notif-filter-tab ${filterTab === "Unread" ? "active" : ""}`} onClick={() => setFilterTab("Unread")}>
                Unread {unreadCount > 0 && <span className="notif-badge-blue">{unreadCount}</span>}
              </button>
              <button type="button" className={`notif-filter-tab ${filterTab === "High Priority" ? "active" : ""}`} onClick={() => setFilterTab("High Priority")}>
                High Urgency {highPriorityCount > 0 && <span className="badge bg-danger ms-1 text-white" style={{ fontSize: "9px" }}>{highPriorityCount}</span>}
              </button>
              <button type="button" className={`notif-filter-tab ${filterTab === "Archived" ? "active" : ""}`} onClick={() => setFilterTab("Archived")}>
                Archived Logs <span className="notif-badge-blue">{archivedCount}</span>
              </button>
            </div>

            <div className="nav-search-bar" style={{ width: "240px", background: "var(--crm-bg)", border: "1px solid var(--crm-border)" }}>
              <i className="bi bi-search"></i>
              <input type="text" className="nav-search-input" placeholder="Search dispatches..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {/* Dynamic Feed Listing Viewer */}
          {filteredNotifications.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {filteredNotifications.map(notif => (
                <div key={notif.id} className={`notif-card-item ${notif.unread ? "unread" : ""}`}>
                  <div className="notif-icon-box">
                    <i className={`bi ${getNotifIcon(notif.category)}`}></i>
                  </div>
                  <div className="notif-card-body">
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <h5 className="notif-card-title mb-0">{notif.title}</h5>
                      <span className="badge bg-light text-dark border" style={{ fontSize: "9px", fontWeight: "700" }}>
                        To: {notif.recipientGroup}
                      </span>
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
                  
                  {/* Administrative Action Control Elements Stack */}
                  <div className="notif-actions-panel">
                    <button type="button" className="notif-action-btn" title={notif.unread ? "Mark as Read" : "Mark as Unread"} onClick={() => handleUpdateStatus(notif.id, "unread", !notif.unread)}>
                      <i className={notif.unread ? "bi bi-envelope-open" : "bi bi-envelope"}></i>
                    </button>
                    <button type="button" className="notif-action-btn" title={notif.archived ? "Unarchive" : "Archive"} onClick={() => handleUpdateStatus(notif.id, "archived", !notif.archived)}>
                      <i className={notif.archived ? "bi bi-archive-fill" : "bi bi-archive"}></i>
                    </button>
                    <button type="button" className="notif-action-btn btn-delete" title="Purge Record" onClick={() => handlePurgeNotification(notif.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-card py-5">
              <i className="bi bi-bell-slash empty-state-icon" style={{ fontSize: "52px" }}></i>
              <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--crm-dark)", margin: "0 0 8px 0" }}>No Dispatches Found</h4>
              <p className="text-muted mb-4" style={{ fontSize: "12.5px", maxWidth: "420px", margin: "0 auto" }}>
                No corporate broadcasts match your active filter tab index.
              </p>
              <button className="btn-profile-primary" style={{ padding: "10px 24px" }} onClick={handleRefreshFeed} disabled={isRefreshing}>
                {isRefreshing ? "Synchronizing Matrix..." : "Refresh Feed"}
              </button>
            </div>
          )}

        </div>

        {/* Right Side Column Operational Summary Panel (260px) */}
        <div className="notif-side-summary">
          <div className="p-3 border rounded-3 bg-light">
            <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.02em", marginBottom: "12px" }}>
              Analytics Layer
            </h4>
            <div className="d-flex flex-column gap-3" style={{ fontSize: "12.5px" }}>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Unread Alerts</span>
                <strong className={unreadCount > 0 ? "text-primary" : ""}>{unreadCount}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">High Urgency Alerts</span>
                <strong className={highPriorityCount > 0 ? "text-danger" : ""}>{highPriorityCount}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center border-top pt-2">
                <span className="text-muted">Total Active Records</span>
                <strong>{totalCount}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL CONFIGURATOR: Create and Broadcast Notification Alert Overlay */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="dashboard-card-flat" style={{ width: "500px", maxWidth: "95%" }}>
            <div className="card-flat-title-bar">
              <h3><i className="bi bi-bell-fill"></i> Broadcast Administrative Alert</h3>
              <button type="button" className="btn-close" style={{ fontSize: "12px", border: "none", background: "transparent" }} onClick={handleModalClose}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit}>
              <div className="row g-3">
                <div className="col-12 modal-form-group">
                  <label>Alert Header Summary</label>
                  <input type="text" name="title" placeholder="Enter clear directive heading..." value={dispatchForm.title} onChange={handleInputChange} required />
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Classification Category</label>
                  <select name="category" value={dispatchForm.category} onChange={handleInputChange}>
                    <option value="System Update">System Update</option>
                    <option value="Task Management">Task Management</option>
                    <option value="Security Alert">Security Alert</option>
                    <option value="Compliance">Compliance Directive</option>
                  </select>
                </div>

                <div className="col-md-6 modal-form-group">
                  <label>Target Recipient Cluster</label>
                  <select name="recipientGroup" value={dispatchForm.recipientGroup} onChange={handleInputChange}>
                    <option value="All Users">All Users</option>
                    <option value="Engineering Unit">Engineering Unit</option>
                    <option value="Sales Personnel">Sales Personnel</option>
                    <option value="Management Tier">Management Tier</option>
                  </select>
                </div>

                <div className="col-md-12 modal-form-group">
                  <label>Urgency Threshold Tier</label>
                  <select name="priority" value={dispatchForm.priority} onChange={handleInputChange}>
                    <option value="Normal">Normal Scope</option>
                    <option value="Medium">Medium Scope</option>
                    <option value="High">High Urgency Layer</option>
                  </select>
                </div>

                <div className="col-12 modal-form-group">
                  <label>Message Content Payload</label>
                  <textarea name="message" rows="3" placeholder="Draft exact transmission message text..." value={dispatchForm.message} onChange={handleInputChange} required></textarea>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="btn-profile-secondary" onClick={handleModalClose}>Cancel</button>
                <button type="submit" className="btn-profile-primary">Dispatch Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminNotifications;









import React, { useState } from "react";

const AdminSettings = () => {
  // Production reactive configurations initialized to blank template vectors
  const [companySettings, setCompanySettings] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    websiteUrl: "",
    companyAddress: ""
  });

  const [systemPreferences, setSystemPreferences] = useState({
    timeZone: "GMT+5:30 (IST)",
    defaultLanguage: "English",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12-hour",
    currency: "INR (₹)",
    defaultView: "Operational Metrics",
    sessionTimeout: "30 Minutes",
    autoSave: true
  });

  const [securityPreferences, setSecurityPreferences] = useState({
    twoFactorAuth: false,
    sessionLock: true
  });

  const [showToast, setShowToast] = useState(false);

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanySettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSystemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemPreferences(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, checked } = e.target;
    setSecurityPreferences(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveAllConfigurations = (e) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleTriggerAction = (actionLabel) => {
    alert(`Initializing administrative directive: ${actionLabel}. Preparing data matrix package...`);
  };

  return (
    <div className="dashboard-card-flat">
      {/* Global State Action Toast Alert Banner */}
      {showToast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          background: "#10b981", color: "white", padding: "12px 24px",
          borderRadius: "8px", fontWeight: "750", zIndex: 9999,
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          <i className="bi bi-check-circle-fill"></i> System configurations updated successfully!
        </div>
      )}

      {/* Main Panel View Header */}
      <div className="card-flat-title-bar">
        <h3><i className="bi bi-sliders2-vertical"></i> Company & System Administration Settings</h3>
        <span className="text-muted" style={{ fontSize: "12px", fontWeight: "700" }}>Configure global workspace rules, security layer scopes, and brand parameters</span>
      </div>

      <form onSubmit={handleSaveAllConfigurations}>
        <div className="row g-4">
          
          {/* Section 1: Registered Company Profile Card */}
          <div className="col-12">
            <div className="p-3 border rounded-3 bg-light">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>
                <i className="bi bi-building me-2"></i>Company Profile Information
              </h4>
              <div className="row g-3">
                <div className="col-md-6 modal-form-group">
                  <label>Legal Corporate Entity Name</label>
                  <input type="text" name="companyName" value={companySettings.companyName} onChange={handleCompanyChange} placeholder="Enter registered business name..." />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Administrative Corporate Email</label>
                  <input type="email" name="companyEmail" value={companySettings.companyEmail} onChange={handleCompanyChange} placeholder="e.g. admin@company.internal" />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Corporate Main Switchboard Phone</label>
                  <input type="text" name="companyPhone" value={companySettings.companyPhone} onChange={handleCompanyChange} placeholder="e.g. +91 40 0000 0000" />
                </div>
                <div className="col-md-6 modal-form-group">
                  <label>Official External Website URL</label>
                  <input type="text" name="websiteUrl" value={companySettings.websiteUrl} onChange={handleCompanyChange} placeholder="https://www.company.internal" />
                </div>
                <div className="col-12 modal-form-group">
                  <label>Corporate Headquarters Physical Address</label>
                  <input type="text" name="companyAddress" value={companySettings.companyAddress} onChange={handleCompanyChange} placeholder="Enter full primary office operational location..." />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Global System Preferences & Localization */}
          <div className="col-12">
            <div className="p-3 border rounded-3 bg-light">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>
                <i className="bi bi-gear me-2"></i>Localization & Platform Preferences
              </h4>
              <div className="row g-3">
                <div className="col-md-4 modal-form-group">
                  <label>System Primary Time Zone</label>
                  <select name="timeZone" value={systemPreferences.timeZone} onChange={handleSystemChange}>
                    <option value="GMT+5:30 (IST)">GMT+5:30 (IST)</option>
                    <option value="GMT+0:00 (UTC)">GMT+0:00 (UTC)</option>
                    <option value="EST (GMT-5)">EST (GMT-5)</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Default Interface Language</label>
                  <select name="defaultLanguage" value={systemPreferences.defaultLanguage} onChange={handleSystemChange}>
                    <option value="English">English (US/UK)</option>
                    <option value="Spanish">Español</option>
                    <option value="French">Français</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Base Transaction Currency</label>
                  <select name="currency" value={systemPreferences.currency} onChange={handleSystemChange}>
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>System Date Format Matrix</label>
                  <select name="dateFormat" value={systemPreferences.dateFormat} onChange={handleSystemChange}>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>System Time Format Baseline</label>
                  <select name="timeFormat" value={systemPreferences.timeFormat} onChange={handleSystemChange}>
                    <option value="12-hour">12-Hour Mode (AM/PM)</option>
                    <option value="24-hour">24-Hour Mode (Military)</option>
                  </select>
                </div>
                <div className="col-md-4 modal-form-group">
                  <label>Session Timeout Scope</label>
                  <select name="sessionTimeout" value={systemPreferences.sessionTimeout} onChange={handleSystemChange}>
                    <option value="15 Minutes">15 Minutes</option>
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                    <option value="No Timeout">Never Expire</option>
                  </select>
                </div>
                
                <div className="col-12 mt-2">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="autoSave" id="adminAutoSaveCheck" checked={systemPreferences.autoSave} onChange={handleSystemChange} />
                    <label className="form-check-label" htmlFor="adminAutoSaveCheck" style={{ fontSize: "12px", fontWeight: "600" }}>
                      Enable auto-save buffering for modification state variables
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Privileged Security Configuration Bounds */}
          <div className="col-md-6">
            <div className="p-3 border rounded-3 bg-light h-100">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>
                <i className="bi bi-shield-lock me-2"></i>Security & Authentication Protocol
              </h4>
              <div className="d-flex flex-column gap-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="twoFactorAuth" id="admin2FACheck" checked={securityPreferences.twoFactorAuth} onChange={handleSecurityChange} />
                  <label className="form-check-label" htmlFor="admin2FACheck" style={{ fontSize: "12px", fontWeight: "600" }}>
                    Enforce structural Multi-Factor Authentication (MFA) across all staff layers
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="sessionLock" id="adminLockCheck" checked={securityPreferences.sessionLock} onChange={handleSecurityChange} />
                  <label className="form-check-label" htmlFor="adminLockCheck" style={{ fontSize: "12px", fontWeight: "600" }}>
                    Enforce concurrent session validation checks to prevent hardware duplicate handshakes
                  </label>
                </div>
                <div className="mt-2">
                  <button type="button" className="btn-profile-secondary py-1 px-3 text-start w-100 d-flex align-items-center justify-content-between" style={{ fontSize: "12px" }} onClick={() => handleTriggerAction("Flush Session Tokens")}>
                    <span><i className="bi bi-arrow-clockwise text-danger me-2"></i>Flush Active Login Tokens</span>
                    <i className="bi bi-chevron-right text-muted"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Data Matrix Ledger Backups & Configurations */}
          <div className="col-md-6">
            <div className="p-3 border rounded-3 bg-light h-100">
              <h4 className="mb-3" style={{ fontSize: "14px", fontWeight: "800", color: "var(--crm-primary)" }}>
                <i className="bi bi-database-down me-2"></i>Backup & Maintenance Routines
              </h4>
              <div className="d-flex flex-column gap-2">
                <button type="button" className="btn-profile-secondary py-1.5 px-3 text-start d-flex align-items-center justify-content-between" style={{ fontSize: "12px" }} onClick={() => handleTriggerAction("Export Matrix State Ledger")}>
                  <span><i className="bi bi-download text-primary me-2"></i>Export Platform System Configurations (.JSON)</span>
                  <i className="bi bi-chevron-right text-muted"></i>
                </button>
                <button type="button" className="btn-profile-secondary py-1.5 px-3 text-start d-flex align-items-center justify-content-between" style={{ fontSize: "12px" }} onClick={() => handleTriggerAction("Trigger Database Snapshots Backup")}>
                  <span><i className="bi bi-cloud-arrow-up text-success me-2"></i>Initialize Cold Database Recovery Snapshot</span>
                  <i className="bi bi-chevron-right text-muted"></i>
                </button>
                <button type="button" className="btn-profile-secondary py-1.5 px-3 text-start d-flex align-items-center justify-content-between text-danger" style={{ fontSize: "12px" }} onClick={() => handleTriggerAction("Hard Reset State Ledger Arrays")}>
                  <span><i className="bi bi-trash3 me-2"></i>Irreversible Platform Factory Restructuring</span>
                  <i className="bi bi-chevron-right text-muted"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Master Form Command Actions Stack Wrap */}
          <div className="col-12 d-flex justify-content-end gap-3 mt-4">
            <button type="button" className="btn-profile-secondary" style={{ padding: "10px 24px" }} onClick={() => handleTriggerAction("Clear Unsaved Workspace buffers")}>
              Reset Framework Changes
            </button>
            <button type="submit" className="btn-profile-primary" style={{ padding: "10px 30px" }}>
              Commit Master Parameters
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default AdminSettings;











