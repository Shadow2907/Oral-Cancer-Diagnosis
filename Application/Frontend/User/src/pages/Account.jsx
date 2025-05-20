import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthHeader from "../components/AuthHeader";
import Card from "../components/Card";

const Account = () => {
  const { isLoggedIn, logout, token } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn) return;
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${apiUrl}/api/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${
              token || localStorage.getItem("authToken")
            }`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [isLoggedIn, token]);

  const handleLogout = async () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const authToken = token || localStorage.getItem("authToken");
    try {
      await fetch(`${apiUrl}/api/api/account/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    } catch (e) {

    }
    logout();
  };

  return (
    <div id="account-screen" className="screen">
      <div className="header" id="account-header">
        <h2 className="screen-title">Tài Khoản</h2>
        <AuthHeader />
      </div>

      <Card
        className={isLoggedIn ? "account-info account-card" : "login-prompt"}
      >
        {isLoggedIn ? (
          profile ? (
            <>
              <p>
                <strong>Tên:</strong> {profile.username}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <Link
                to="/change-password"
                className="auth-button change-password-option"
                style={{
                  backgroundColor: "#3498db",
                  color: "white",
                  padding: "10px 15px",
                  borderRadius: "10px",
                  marginTop: "15px",
                  marginBottom: "10px",
                  display: "inline-block",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Đổi Mật Khẩu
              </Link>
              <button className="logout-button" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i>
                Đăng Xuất
              </button>
            </>
          ) : (
            <p>Đang tải thông tin tài khoản...</p>
          )
        ) : (
          <>
            <p>Bạn chưa đăng nhập</p>
            <div className="auth-options">
              <Link to="/login" className="auth-button login-option">
                Đăng Nhập
              </Link>
              <Link to="/signup" className="auth-button register-option">
                Đăng Ký
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Account;
