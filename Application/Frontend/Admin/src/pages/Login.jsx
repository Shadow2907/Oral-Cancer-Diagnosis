import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Vui lòng nhập Tên đăng nhập và Mật khẩu.");
      return;
    }

    setIsLoading(true);

    const loginData = new URLSearchParams();
    loginData.append("grant_type", "password");
    loginData.append("username", username);
    loginData.append("password", password);

    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      setError("Lỗi cấu hình phía client. Không tìm thấy địa chỉ API.");
      setIsLoading(false);
      return;
    }
    const fullUrl = `${apiUrl}/api/api/account/login`;

    try {
      const response = await axios.post(fullUrl, loginData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.data && response.data.access_token) {
        login(username, undefined, response.data.access_token);
        // localStorage.setItem("refreshToken", response.data.refresh_token);
        navigate("/admin", { replace: true });
      } else {
        setError("Đăng nhập thất bại. Không nhận được token.");
      }
    } catch (err) {
      let errorMessage = "Đăng nhập thất bại. ";
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 401) {
          errorMessage += "Sai tên đăng nhập hoặc mật khẩu.";
        } else {
          errorMessage += `Lỗi máy chủ (${err.response.status}).`;
        }
      } else {
        errorMessage += "Không nhận được phản hồi từ máy chủ.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <h2 className="auth-title">Đăng Nhập Quản Trị</h2>
        </div>

        {error && (
          <p
            style={{ color: "red", textAlign: "center", marginBottom: "15px" }}
          >
            {error}
          </p>
        )}

        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Nhập tên đăng nhập của bạn"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
