
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      console.warn("Email not found in location state. Redirecting to signup.");
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2000); // Chuyển hướng sau 2s
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length < 4) {
      setError("Vui lòng nhập mã OTP hợp lệ.");
      return;
    }
    if (!email) {
      setError("Lỗi: Không tìm thấy địa chỉ email để xác thực.");
      return;
    }

    setIsLoading(true);

    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      setError("Lỗi cấu hình phía client. Không tìm thấy địa chỉ API.");
      setIsLoading(false);
      return;
    }

    const params = {
      email: email,
      otp_code: otp,
    };

    const fullUrl = `${apiUrl}/api/api/account/verify-registration`;

    try {
      const response = await axios.post(fullUrl, null, { params: params });
      setSuccess(true); // Đánh dấu thành công
    } catch (err) {
      let errorMessage = "Xác thực OTP thất bại. ";
      if (err.response) {
        if (typeof err.response.data === "string" && err.response.data) {
          errorMessage += err.response.data;
        } else if (
          err.response.data &&
          (err.response.data.message || err.response.data.error)
        ) {
          errorMessage += err.response.data.message || err.response.data.error;
        } else if (err.response.status === 400) {
          errorMessage += "Mã OTP không hợp lệ hoặc đã hết hạn.";
        } else if (err.response.status === 404) {
          errorMessage += "Tài khoản không tồn tại hoặc chưa đăng ký.";
        } else {
          errorMessage += `Lỗi máy chủ (${err.response.status}).`;
        }
      } else if (err.request) {
        errorMessage += "Không nhận được phản hồi từ máy chủ.";
      } else {
        errorMessage += "Lỗi khi gửi yêu cầu xác thực.";
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
          <h2 className="auth-title">Xác Thực OTP</h2>
        </div>

        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Một mã OTP đã được gửi đến email: <br />
          <strong>{email || "..."}</strong>
          <br />
          Vui lòng nhập mã vào ô bên dưới.
        </p>

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
            Đăng ký thành công! Đang chuyển hướng...
          </p>
        )}

        {!success && (
          <form id="otp-verification-form" onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="otp_code">Mã OTP</label>
              <input
                type="text"
                id="otp_code"
                name="otp_code"
                placeholder="Nhập mã OTP"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading || !email}
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading || !email}
            >
              {isLoading ? "Đang xác thực..." : "Xác Nhận"}
            </button>
          </form>
        )}

        <div className="auth-links" style={{ justifyContent: "center" }}>
          <Link to="/login">Quay lại Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
