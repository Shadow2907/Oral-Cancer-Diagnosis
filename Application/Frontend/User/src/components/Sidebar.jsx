
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const menuItems = [
        { path: "/", icon: "bi-house", label: "Trang Chủ", screen: "home-screen" },
        { path: "/upload", icon: "bi-upload", label: "Tải Ảnh", screen: "upload-screen" },
        { path: "/history", icon: "bi-clock-history", label: "Lịch Sử", screen: "history-screen" },
        { path: "/account", icon: "bi-person", label: "Tài Khoản", screen: "account-screen" },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-logo">Chẩn Đoán Ung Thư</div>
            <div className="sidebar-menu">
                {menuItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        end={item.path === "/"}
                    >
                        
                        <i className={`bi ${item.icon}`}></i>
                        
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;