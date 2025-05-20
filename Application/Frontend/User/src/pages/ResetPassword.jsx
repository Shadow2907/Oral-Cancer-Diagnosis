import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Gửi OTP về email
  const handleSendOtp = async () => {
    setError(null);
    setSuccess(null);
    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }
    setIsSendingOtp(true);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    try {
      await axios.post(
        `${apiUrl}/api/api/account/forgot-password`,
        {},
        { params: { email } }
      );
      setOtpSent(true);
      setSuccess("Đã gửi mã OTP về email của bạn.");
    } catch (err) {
      setError("Gửi mã OTP thất bại.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Đổi mật khẩu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !otpCode || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    try {
      await axios.post(
        `${apiUrl}/api/api/account/reset-password`,
        {},
        {
          params: {
            email,
            otp_code: otpCode,
            new_password: newPassword,
            confirm_password: confirmPassword,
          },
        }
      );
      setSuccess("Đổi mật khẩu thành công! Bạn có thể đăng nhập lại.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Đổi mật khẩu thất bại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <h2 className="auth-title">Quên Mật Khẩu</h2>
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
        {success && (
          <p
            style={{
              color: "green",
              textAlign: "center",
              marginBottom: "15px",
            }}
          >
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Nhập email đã đăng ký"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isSendingOtp || otpSent}
              required
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp || !email || otpSent}
              style={{ marginTop: 8 }}
            >
              {isSendingOtp
                ? "Đang gửi..."
                : otpSent
                ? "Đã gửi OTP"
                : "Gửi mã OTP"}
            </button>
          </div>
          {otpSent && (
            <>
              <div className="form-group">
                <label htmlFor="otp">Mã OTP</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Nhập mã OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang đặt lại mật khẩu..." : "Đặt lại mật khẩu"}
              </button>
            </>
          )}
        </form>
        <div className="auth-links">
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
