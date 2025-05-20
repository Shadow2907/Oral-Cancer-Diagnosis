import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const AuthHeader = () => {
  const { isLoggedIn, logout, isLoggingOut } = useAuth();
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoggedIn) {
        try {
          const token = localStorage.getItem("authToken");
          const res = await fetch(`${apiUrl}/api/api/user/profile`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          if (data && data.username) setName(data.username);
          else setName("");
        } catch {
          setName("");
        }
      } else {
        setName("");
      }
    };
    fetchProfile();
  }, [isLoggedIn]);

  return (
    <>
      {isLoggedIn ? (
        <div className="account-info-header">
          <span className="username">{name}</span>
          <button
            className="logout-header"
            onClick={logout}
            disabled={isLoggingOut}
          >
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
