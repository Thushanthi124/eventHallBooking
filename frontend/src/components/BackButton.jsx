import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ style = {}, className = '', label = 'Back' }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className={`back-btn ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '8px',
                borderRadius: '8px',
                transition: 'background 0.2s',
                zIndex: 10,
                ...style
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {label}
        </button>
    );
};

export default BackButton;
