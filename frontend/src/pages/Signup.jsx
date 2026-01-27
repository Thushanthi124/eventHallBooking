// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'customer'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Password Validation
        const password = formData.password;
        // Strict Regex: 8+ chars, 1 Upper, 1 Lower, 1 Number, 1 Special
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            setMessage({
                type: 'error',
                text: 'Password too weak. Must be 8+ chars with Uppercase, Lowercase, Number, and Special Symbol (!@#$%^&*).'
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: data.message });
            } else {
                setMessage({ type: 'error', text: data.error || 'Signup failed.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection error. Is the backend running?' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join Nadsathiramahal for an exquisite event experience</p>
                </div>

                {message.text && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '2rem',
                        borderRadius: '10px',
                        background: message.type === 'error' ? '#FEF2F2' : '#F0FDF4',
                        color: message.type === 'error' ? '#991B1B' : '#166534',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        border: `1px solid ${message.type === 'error' ? '#FCA5A5' : '#BBF7D0'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="e.g. Thushanthi"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="e.g. john@example.com"
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
                                placeholder="8+ chars (Upper, Lower, #, Special)"
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

                    <div className="form-group">
                        <label>I am registering as</label>
                        <select
                            name="role"
                            className="form-input"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="customer">A Customer</option>
                            <option value="staff">Operational Staff</option>
                            <option value="admin">An Administrator</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-btn"
                        style={{ opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Processing...' : 'Register Now'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login here</Link>
                    <div style={{ marginTop: '1.5rem' }}>
                        <Link to="/" style={{ color: '#6B7280', fontWeight: '400' }}>← Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
