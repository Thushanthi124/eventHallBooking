import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Login</h1>
            <p>Login to your account.</p>
            <Link to="/" style={{ color: 'blue' }}>Back to Home</Link>
        </div>
    );
};

export default Login;
