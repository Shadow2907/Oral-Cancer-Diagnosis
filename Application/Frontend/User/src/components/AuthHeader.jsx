import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthHeader = () => {
    const { isLoggedIn, username, logout } = useAuth();

    return (
        <>
            {isLoggedIn ? (
                <div className="account-info-header">
                    <span className="username">{username}</span>
                    <button className="logout-header" onClick={logout}>
                        <i className="bi bi-box-arrow-right"></i>
                        Đăng Xuất
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