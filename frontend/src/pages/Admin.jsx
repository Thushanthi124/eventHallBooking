import React from 'react';
import { Link } from 'react-router-dom';

const Admin = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Admin Dashboard</h1>
            <p>Manage all bookings and halls.</p>
            <Link to="/" style={{ color: 'blue' }}>Back to Home</Link>
        </div>
    );
};

export default Admin;
