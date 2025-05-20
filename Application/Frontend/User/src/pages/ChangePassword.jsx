import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import axios from "axios";

const ChangePassword = () => {
  const [step, setStep] = useState(1);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const authToken = localStorage.getItem("authToken");

  //  Gửi yêu cầu đổi mật khẩu (gửi OTP)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${apiUrl}/api/api/account/request-change-password`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            old_password: oldPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          },
        }
      );
      setStep(2); // Chuyển sang bước nhập OTP
      setSuccess("Đã gửi mã OTP đến email của bạn.");
    } catch (err) {
      setError("Gửi OTP thất bại. " + (err.response?.data?.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  // Xác nhận OTP để đổi mật khẩu
  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otpCode) {
      setError("Vui lòng nhập mã OTP.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${apiUrl}/api/api/account/change-password`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            otp_code: otpCode,
          },
        }
      );
      setSuccess("Đổi mật khẩu thành công!");
      setTimeout(() => {
        navigate("/account");
      }, 2000);
    } catch (err) {
      setError("Đổi mật khẩu thất bại. " + (err.response?.data?.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="change-password-screen" className="screen">
      <div className="header" id="change-password-header">
        <h2 className="screen-title">Đổi Mật Khẩu</h2>
        <AuthHeader />
      </div>
      <div className="auth-form-container">
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="old-password">Mật khẩu cũ</label>
              <input
                type="password"
                id="old-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">Mật khẩu mới</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? "Đang gửi OTP..." : "Gửi mã OTP"}
            </button>
            {error && (
              <p
                style={{ color: "red", textAlign: "center", marginTop: "15px" }}
              >
                {error}
              </p>
            )}
            {success && (
              <p
                style={{
                  color: "green",
                  textAlign: "center",
                  marginTop: "15px",
                }}
              >
                {success}
              </p>
            )}
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleSubmitOtp}>
            <div className="form-group">
              <label htmlFor="otp-code">Mã OTP</label>
              <input
                type="text"
                id="otp-code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                disabled={isLoading}
                required
              />
              <p style={{ fontSize: "0.8rem", color: "#666" }}>
                Vui lòng kiểm tra email để lấy mã OTP.
              </p>
            </div>
            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đổi Mật Khẩu"}
            </button>
            {error && (
              <p
                style={{ color: "red", textAlign: "center", marginTop: "15px" }}
              >
                {error}
              </p>
            )}
            {success && (
              <p
                style={{
                  color: "green",
                  textAlign: "center",
                  marginTop: "15px",
                }}
              >
                {success}
              </p>
            )}
          </form>
        )}
        <div className="auth-footer">
          <Link to="/account">Quay lại tài khoản</Link>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
