import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '260px', padding: '0' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
