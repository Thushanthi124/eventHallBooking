// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                const user = data.user;
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userToken', data.token); // Store JWT
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('userId', user.id.toString());
                if (user.role === 'staff') {
                    localStorage.setItem('staffType', user.staff_type);
                }

                alert(`Welcome back, ${user.username}!`);

                if (user.role === 'admin') {
                    navigate('/admin');
                } else if (user.role === 'staff') {
                    navigate('/staff-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                alert(data.error || 'Login failed.');
            }
        } catch (error) {
            alert('Connection error. Is the backend running?');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access your account</p>
                </div>

                <div className="demo-box">
                    <div className="demo-title">💡 Demo Access</div>
                    <div style={{ color: '#B45309', fontSize: '0.85rem' }}>
                        Admin: <b>admin@example.com</b> / admin123<br />
                        Staff: <b>kitchen@example.com</b> / staff123<br />
                        Customer: <b>customer@example.com</b> / customer123
                    </div>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="e.g. name@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Your secure password"
                                required
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#6B7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="form-group" style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                        <Link to="/forgot-password" style={{ color: 'red', textDecoration: 'underline', fontSize: '0.9rem' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="auth-btn">
                        Login
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Create account</Link>
                    <div style={{ marginTop: '1.5rem' }}>
                        <Link to="/" style={{ color: '#6B7280', fontWeight: '400' }}>← Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
