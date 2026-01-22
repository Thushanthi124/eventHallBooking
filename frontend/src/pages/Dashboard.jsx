import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>User Dashboard</h1>
            <p>Manage your bookings here.</p>
            <Link to="/" style={{ color: 'blue' }}>Back to Home</Link>
        </div>
    );
};

export default Dashboard;
