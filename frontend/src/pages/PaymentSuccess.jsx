import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import './Auth.css'; // Reusing Auth styles for card layout

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const handleDashboardRedirect = () => {
        const role = localStorage.getItem('userRole');
        if (role === 'admin') {
            navigate('/admin');
        } else if (role === 'staff') {
            navigate('/staff-dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="auth-container">
            <BackButton style={{ position: 'absolute', top: '20px', left: '20px' }} />
            <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#dcfce7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                {step === 1 ? (
                    <>
                        <h1 style={{ color: '#15803d', fontSize: '2rem', marginBottom: '0.5rem' }}>Payment Successful!</h1>
                        <p style={{ color: '#374151', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            Your payment has been processed.
                        </p>
                        <button
                            onClick={() => setStep(2)}
                            className="auth-btn"
                            style={{ background: '#15803d', margin: 0 }}
                        >
                            OK
                        </button>
                    </>
                ) : (
                    <>
                        <h1 style={{ color: '#15803d', fontSize: '2rem', marginBottom: '0.5rem' }}>Booking Completed!</h1>
                        <p style={{ color: '#374151', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            Your booking has been secured successfully.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={handleDashboardRedirect}
                                className="auth-btn"
                                style={{ background: '#15803d', margin: 0 }}
                            >
                                View My Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="auth-btn"
                                style={{ background: '#ef4444', margin: 0 }}
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
