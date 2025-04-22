import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthHeader = () => {
    const { isLoggedIn, username, logout, isLoggingOut } = useAuth();

    return (
        <>
            {isLoggedIn ? (
                <div className="account-info-header">
                    <span className="username">{username}</span>
                    <button className="logout-header" onClick={logout} disabled={isLoggingOut}>
                        <i className="bi bi-box-arrow-right"></i>
                        {isLoggingOut ? " Đang đăng xuất..." : " Đăng Xuất"}
                    </button>
                </div>
            ) : (
                <Link to="/login" className="login-button">
                    <i className="bi bi-box-arrow-in-right"></i>
                    Đăng Nhập
                </Link>
            )}
        </>
    );
};

export default AuthHeader;