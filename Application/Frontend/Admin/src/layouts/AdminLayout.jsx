import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const adminMenuItems = [
    { path: "/admin/system", icon: "bi-server", label: "Theo Dõi Hệ Thống", screen: "system-screen" },
    { path: "/admin/diagnoses", icon: "bi-clipboard-data", label: "Quản Lý Chẩn Đoán", screen: "diagnoses-screen" },
    { path: "/admin/users", icon: "bi-people", label: "Quản Lý Người Dùng", screen: "users-screen" },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container admin-container">
      <div className="admin-sidebar">
        <div className="sidebar-logo">Bảng Quản Trị</div>
        <div className="sidebar-menu">
          {adminMenuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button className="sidebar-item logout-button" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>
      <div className="content-area">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;