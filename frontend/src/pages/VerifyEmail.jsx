import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    const effectRan = React.useRef(false);

    useEffect(() => {
        if (effectRan.current === false) {
            const verify = async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/auth/verify/${token}`);
                    const data = await response.json();

                    if (response.ok) {
                        setStatus('success');
                        setMessage(data.message);
                    } else {
                        // If it fails, only set error if we aren't already successful? 
                        // Actually, with the ref check, this runs ONLY once.
                        setStatus('error');
                        setMessage(data.error || 'Verification failed.');
                    }
                } catch (error) {
                    setStatus('error');
                    setMessage('Connection error. Please try again later.');
                }
            };

            verify();
            
            return () => {
                effectRan.current = true;
            };
        }
    }, [token]);

    return (
        <div style={{
            padding: '40px',
            maxWidth: '500px',
            margin: '100px auto',
            textAlign: 'center',
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ color: status === 'error' ? '#f44336' : '#4caf50' }}>
                {status === 'verifying' ? 'Verifying...' : status === 'success' ? 'Email Verified!' : 'Verification Error'}
            </h1>
            <p style={{ fontSize: '18px', margin: '20px 0', color: '#555' }}>
                {message}
            </p>
            {status !== 'verifying' && (
                <Link to="/login" style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold'
                }}>
                    Go to Login
                </Link>
            )}
        </div>
    );
};

export default VerifyEmail;
