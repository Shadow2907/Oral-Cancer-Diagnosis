import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthHeader from '../components/AuthHeader';
import Card from '../components/Card';

const Account = () => {
    const { isLoggedIn, username, logout } = useAuth();

    // Derive email (example)
    const email = isLoggedIn ? `${username.split(' ').join('.').toLowerCase()}@example.com` : '';

    return (
        <div id="account-screen" className="screen">
            <div className="header" id="account-header">
                <h2 className="screen-title">Tài Khoản</h2>
                 <AuthHeader />
            </div>

            {/* Use Card for content area */}
             <Card className={isLoggedIn ? "account-info account-card" : "login-prompt"}>
                {isLoggedIn ? (
                    <>
                        <p><strong>Tên:</strong> {username}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <button className="logout-button" onClick={logout}>
                            <i className="bi bi-box-arrow-right"></i>
                            Đăng Xuất
                        </button>
                    </>
                ) : (
                    <>
                        <p>Bạn chưa đăng nhập</p>
                        <div className="auth-options">
                            <Link to="/login" className="auth-button login-option">Đăng Nhập</Link>
                            <Link to="/signup" className="auth-button register-option">Đăng Ký</Link>
                        </div>
                    </>
                )}
             </Card>
        </div>
    );
};

export default Account;