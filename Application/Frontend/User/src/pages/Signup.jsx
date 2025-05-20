import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password) {
      setError("Vui lòng điền đầy đủ Tên đăng nhập, Email và Mật khẩu.");
      return;
    }
    if (username.length < 3) {
      setError("Tên đăng nhập phải có ít nhất 3 ký tự.");
    }
    if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp. Vui lòng thử lại.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    if (!API_BASE_URL) {
      setError("Lỗi cấu hình: Không tìm thấy địa chỉ API.");
      return;
    }

    const params = {
      username: username,
      email: email,
      password: password,
      role: "User",
    };

    setIsLoading(true);

    try {
      const fullUrl = `${API_BASE_URL}/api/api/account/register`;
      console.log("Sending registration request to:", fullUrl);
      console.log("With params:", params);

      const response = await axios.post(fullUrl, {}, { params });

      console.log(
        "Initial Registration successful (OTP likely sent):",
        response.data
      );

      // alert('Đăng ký thành công bước đầu. Vui lòng kiểm tra email để nhận mã OTP và xác thực tài khoản.');
      navigate("/verify-otp", { state: { email: email } });
    } catch (err) {
      console.error("Registration error:", err.response || err.message || err);
      let errorMessage = "Đăng ký thất bại. ";

      if (err.response) {
        console.error("Error data:", err.response.data);
        console.error("Error status:", err.response.status);
        if (typeof err.response.data === "string" && err.response.data) {
          errorMessage += err.response.data;
        } else if (
          err.response.data &&
          (err.response.data.message || err.response.data.error)
        ) {
          errorMessage += err.response.data.message || err.response.data.error;
        } else if (err.response.status === 400) {
          errorMessage +=
            "Dữ liệu không hợp lệ hoặc email/username đã tồn tại.";
        } else {
          errorMessage += `Lỗi máy chủ (${err.response.status}).`;
        }
      } else if (err.request) {
        errorMessage += "Không nhận được phản hồi từ máy chủ.";
      } else {
        errorMessage += "Lỗi khi gửi yêu cầu đăng ký.";
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
          <h2 className="auth-title">Đăng Ký Tài Khoản</h2>
          <Link to="/" className="auth-close">
            <i className="bi bi-x"></i>
          </Link>
        </div>

        {error && (
          <p
            style={{ color: "red", textAlign: "center", marginBottom: "15px" }}
          >
            {error}
          </p>
        )}

        <form id="registration-form" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Nhập tên đăng nhập"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Nhập email của bạn"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {/* Password Inputs */}
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Tạo mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Xác Nhận Mật Khẩu</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              placeholder="Nhập lại mật khẩu"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {/* Submit Button */}
          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
          </button>
        </form>
        <Link to="/login" className="form-switch-link">
          Đã có tài khoản? Đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default Signup;
