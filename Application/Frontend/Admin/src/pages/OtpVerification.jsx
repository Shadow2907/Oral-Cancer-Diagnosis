
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OtpVerification = () => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from the state passed during navigation
    const email = location.state?.email;

    // Redirect if email is not available (user navigated directly)
    useEffect(() => {
        if (!email) {
            console.warn("Email not found in location state. Redirecting to signup.");
            navigate('/signup'); // Or maybe '/login'?
        }
    }, [email, navigate]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(null);

        if (!otp || otp.length < 4) { 
            setError('Vui lòng nhập mã OTP hợp lệ.');
            return;
        }
        if (!email) {
            setError('Lỗi: Không tìm thấy địa chỉ email để xác thực.');
            return;
        }

        setIsLoading(true);

        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        if (!apiUrl) {
            setError("Lỗi cấu hình phía client. Không tìm thấy địa chỉ API.");
            setIsLoading(false);
            return;
        }

        // Prepare params for the verification API call
        const params = {
            email: email,
            otp_code: otp
        };

        const fullUrl = `${apiUrl}/api/api/account/verify-registration`;

        try {
            console.log("Sending OTP verification request to:", fullUrl);
            console.log("With params:", params);

            // Send POST request with data as query parameters
            const response = await axios.post(fullUrl, null, { params: params });

            console.log('OTP Verification successful:', response.data);
            alert('Xác thực tài khoản thành công! Vui lòng đăng nhập.');
            navigate('/login'); // Redirect to login page on success

        } catch (err) {
            console.error('OTP Verification error:', err.response || err.message || err);
            let errorMessage = 'Xác thực OTP thất bại. ';

            if (err.response) {
                console.error("Error data:", err.response.data);
                console.error("Error status:", err.response.status);
                if (typeof err.response.data === 'string' && err.response.data) {
                   errorMessage += err.response.data;
                } else if (err.response.data && (err.response.data.message || err.response.data.error)) {
                   errorMessage += err.response.data.message || err.response.data.error;
                } else if (err.response.status === 400) {
                   errorMessage += 'Mã OTP không hợp lệ hoặc đã hết hạn.';
                } else if (err.response.status === 404) {
                   errorMessage += 'Tài khoản không tồn tại hoặc chưa đăng ký.';
                } else {
                   errorMessage += `Lỗi máy chủ (${err.response.status}).`;
                }
            } else if (err.request) {
                errorMessage += 'Không nhận được phản hồi từ máy chủ.';
            } else {
                errorMessage += 'Lỗi khi gửi yêu cầu xác thực.';
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

                <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Một mã OTP đã được gửi đến email: <br /><strong>{email || '...'}</strong>
                    <br/>Vui lòng nhập mã vào ô bên dưới.
                </p>

                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

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
                            onChange={e => setOtp(e.target.value)}
                            disabled={isLoading || !email} // Disable if loading or email missing
                            maxLength={6} // Adjust maxLength if needed
                            inputMode="numeric" // Hint for numeric keyboard on mobile
                            autoComplete="one-time-code" // Help password managers/browsers
                        />
                    </div>

                    <button type="submit" className="auth-submit" disabled={isLoading || !email}>
                        {isLoading ? 'Đang xác thực...' : 'Xác Nhận'}
                    </button>
                </form>

                {/* Optional: Add a resend OTP button here (requires another API endpoint) */}
                {/* <button type="button" className="resend-otp-button" disabled={isLoading}>Gửi lại mã</button> */}

                <div className="auth-links" style={{ justifyContent: 'center' }}>
                     <Link to="/login">Quay lại Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;