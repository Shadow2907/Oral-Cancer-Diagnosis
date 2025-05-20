
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      console.error(
        "Lỗi: Biến môi trường VITE_API_BASE_URL chưa được định nghĩa!"
      );
      setError("Lỗi cấu hình phía client. Không tìm thấy địa chỉ API.");
      setIsLoading(false);
      return;
    }
    const fullUrl = `${apiUrl}/api/api/account/login`; 

    try {
      console.log("Sending login request to:", fullUrl);
      console.log("With data:", loginData.toString());


      const response = await axios.post(
        fullUrl,
        loginData, 
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("Login successful:", response.data);


      if (response.data && response.data.access_token) {
        localStorage.setItem("authToken", response.data.access_token);

        const expireAt = Date.now() + 60 * 60 * 1000;
        localStorage.setItem("authTokenExpire", expireAt.toString());
      }


      login(username); 

      navigate("/"); 
    } catch (err) {
      console.error("Login error:", err.response || err.message || err);
      let errorMessage = "Đăng nhập thất bại. ";

      if (err.response) {
        console.error("Error data:", err.response.data);
        console.error("Error status:", err.response.status);

        if (err.response.status === 400 || err.response.status === 401) {
          if (err.response.data && err.response.data.error_description) {
            errorMessage += err.response.data.error_description;
          } else if (
            err.response.data &&
            typeof err.response.data === "string"
          ) {
            errorMessage += err.response.data;
          } else {
            errorMessage += "Sai tên đăng nhập hoặc mật khẩu.";
          }
        } else {
          errorMessage += `Lỗi máy chủ (${err.response.status}).`;
        }
      } else if (err.request) {
        errorMessage += "Không nhận được phản hồi từ máy chủ.";
        console.error("Error request:", err.request);
      } else {
        errorMessage += "Lỗi khi gửi yêu cầu đăng nhập.";
        console.error("Error message:", err.message);
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
          <h2 className="auth-title">Đăng Nhập</h2>
          <Link to="/" className="auth-close">
            <i className="bi bi-x"></i>
          </Link>
        </div>

        {/* Display Error Message */}
        {error && (
          <p
            style={{ color: "red", textAlign: "center", marginBottom: "15px" }}
          >
            {error}
          </p>
        )}

        <form id="login-form" onSubmit={handleSubmit}>
          {/* Changed from Email to Username */}
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>{" "}
            {/* Changed label */}
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
        <div className="auth-links">
          <Link to="/">Quay lại trang chính</Link>
          <Link to="/signup">Đăng Ký</Link>
          <Link to="/reset-password" style={{ color: "#007bff" }}>
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
