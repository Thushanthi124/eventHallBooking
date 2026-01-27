import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = localStorage.getItem('userRole');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Define menu items based on role
    const getMenuItems = () => {
        switch (userRole) {
            case 'admin':
                return [
                    { path: '/admin', label: 'Overview', icon: '📊' },
                    { path: '/admin/history', label: 'Booking History', icon: '📜' },
                    { path: '/admin/assignments', label: 'Staff Assignments', icon: '👷' },
                    { path: '/admin/feedback', label: 'Customer Feedback', icon: '⭐' },
                    { path: '/', label: 'View Website', icon: '🏠' }
                ];
            case 'staff':
                return [
                    { path: '/staff-dashboard', label: 'My Assignments', icon: '📋' }
                ];
            case 'customer':
                return [
                    { path: '/dashboard', label: 'My Dashboard', icon: '📊' },
                    { path: '/dashboard?tab=feedback', label: 'Feedback', icon: '💬' },
                    { path: '/booking', label: 'Book a Venue', icon: '➕' },
                    { path: '/', label: 'Home Page', icon: '🏠' }
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    return (
        <aside className="global-sidebar">
            <div className="sidebar-brand">
                <h2>EventSystem</h2>
                <span className="role-badge">{userRole?.toUpperCase()}</span>
            </div>

            <nav className="sidebar-menu">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
                        end={item.path !== '/admin'} // Exact match for non-root paths
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <span className="icon">🚪</span>
                    <span className="label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
