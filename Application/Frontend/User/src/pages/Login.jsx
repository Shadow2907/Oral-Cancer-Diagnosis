// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'; // Import axios

const Login = () => {
    // Changed email state to username to match API parameter
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const [error, setError] = useState(null); // Add error state
    const { login } = useAuth(); // Get login function from context
    const navigate = useNavigate();

    const handleSubmit = async (e) => { // Make the function async
        e.preventDefault();
        setError(null); // Reset error on new submission

        // Basic Frontend Validation
        if (!username || !password) {
            setError('Vui lòng nhập Tên đăng nhập và Mật khẩu.');
            return;
        }

        setIsLoading(true);

        // --- Prepare data for API call ---
        // The API expects 'application/x-www-form-urlencoded'
        // Use URLSearchParams to format the data correctly
        const loginData = new URLSearchParams();
        loginData.append('grant_type', 'password'); // As per API spec pattern
        loginData.append('username', username);
        loginData.append('password', password);
        // Optional fields like scope, client_id, client_secret are omitted

        // --- Get API URL from environment variables ---
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        if (!apiUrl) {
            console.error("Lỗi: Biến môi trường VITE_API_BASE_URL chưa được định nghĩa!");
            setError("Lỗi cấu hình phía client. Không tìm thấy địa chỉ API.");
            setIsLoading(false);
            return;
        }
        const fullUrl = `${apiUrl}/api/api/account/login`; // Construct full URL

        try {
            console.log("Sending login request to:", fullUrl);
            console.log("With data:", loginData.toString()); // Log urlencoded string

            // --- API Call using Axios ---
            const response = await axios.post(
                fullUrl,
                loginData, // Send URLSearchParams object as data
                {
                    headers: {
                        // Set the correct Content-Type header
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            console.log('Login successful:', response.data);

            
            // Store token if available (Example)
            if (response.data && response.data.access_token) {
                localStorage.setItem('authToken', response.data.access_token); // Store token
                
            }

            // Update Auth Context with the username used for login
            login(username); // Pass the logged-in username to the context

            navigate('/'); // Redirect to home page

        } catch (err) {
            console.error('Login error:', err.response || err.message || err);
            let errorMessage = 'Đăng nhập thất bại. ';

            if (err.response) {
                console.error("Error data:", err.response.data);
                console.error("Error status:", err.response.status);
                // Customize error messages based on status or response data
                if (err.response.status === 400 || err.response.status === 401) {
                     // Try to get specific error from response like { error: "invalid_grant", error_description: "..." }
                     if (err.response.data && err.response.data.error_description) {
                          errorMessage += err.response.data.error_description;
                     } else if (err.response.data && typeof err.response.data === 'string') {
                         errorMessage += err.response.data;
                     }
                     else {
                         errorMessage += 'Sai tên đăng nhập hoặc mật khẩu.';
                     }
                } else {
                    errorMessage += `Lỗi máy chủ (${err.response.status}).`;
                }
            } else if (err.request) {
                errorMessage += 'Không nhận được phản hồi từ máy chủ.';
                console.error("Error request:", err.request);
            } else {
                errorMessage += 'Lỗi khi gửi yêu cầu đăng nhập.';
                console.error('Error message:', err.message);
            }
            setError(errorMessage);

        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-form-container">
                <div className="auth-header">
                    <h2 className="auth-title">Đăng Nhập</h2>
                    <Link to="/" className="auth-close"><i className="bi bi-x"></i></Link>
                </div>

                {/* Display Error Message */}
                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

                <form id="login-form" onSubmit={handleSubmit}>
                    {/* Changed from Email to Username */}
                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label> {/* Changed label */}
                        <input
                            type="text" // Changed type to text (or keep email if backend accepts either)
                            id="username" // Changed id
                            name="username" // Changed name
                            placeholder="Nhập tên đăng nhập của bạn" // Changed placeholder
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} // Update username state
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
                         {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </button>
                </form>
                <div className="auth-links">
                    <Link to="/">Quay lại trang chính</Link>
                    <Link to="/signup">Đăng Ký</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;