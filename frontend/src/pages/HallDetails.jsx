// src/pages/HallDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import './HallDetails.css';

const HallDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hall, setHall] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHall = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/halls/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setHall(data);
                } else {
                    console.error("Hall not found");
                }
            } catch (error) {
                console.error("Error fetching hall:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHall();
    }, [id]);

    const handleBookNow = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            navigate('/booking', { state: { hallId: id } });
        } else {
            alert("Please login to book your venue.");
            navigate('/login');
        }
    };

    if (loading) {
        return (
            <div className="details-loading">
                <p>Loading exquisite venue details...</p>
            </div>
        );
    }

    if (!hall) {
        return (
            <div className="details-error">
                <h2>Venue Not Found</h2>
                <Link to="/" className="back-btn-simple">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="hall-details-page">
            <header className="details-header">
                <BackButton label="Back to Home" style={{ color: 'white' }} />
                <h1 className="logo-small">Nadsathira<span>mahal</span></h1>
            </header>

            <main className="details-container">
                <div className="details-layout">
                    <section className="details-visual">
                        {hall.image_url ? (
                            <img src={hall.image_url} alt={hall.name} className="details-real-image" />
                        ) : (
                            <div className="details-image-placeholder">
                                {hall.name ? hall.name.split(' ').map(w => w[0]).join('') : 'VH'}
                                <div className="image-overlay">
                                    <span>Premium Selection</span>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="details-info">
                        <div className="details-category">Luxury Event Venue</div>
                        <h2 className="details-title">{hall.name}</h2>

                        <div className="details-stats-grid">
                            <div className="detail-stat">
                                <span className="stat-label">Max Guest Capacity</span>
                                <span className="stat-value">{hall.capacity.toLocaleString()} Guests</span>
                            </div>
                            <div className="detail-stat">
                                <span className="stat-label">Daily Investment</span>
                                <span className="stat-value">LKR {hall.price_per_day.toLocaleString()}</span>
                            </div>
                            <div className="detail-stat">
                                <span className="stat-label">Ideal For</span>
                                <span className="stat-value">Weddings, Galas, & Corporate</span>
                            </div>
                        </div>

                        <div className="details-description">
                            <h3>About the Venue</h3>
                            <p>{hall.description || "Experience the pinnacle of hospitality in our meticulously designed space, where modern luxury meets timeless elegance. Perfect for creating memories that last a lifetime."}</p>
                        </div>

                        <div className="details-amenities">
                            <h3>Key Amenities</h3>
                            <div className="amenities-grid">
                                <span>✦ Centralized A/C</span>
                                <span>✦ Premium Audio-Visual System</span>
                                <span>✦ Private Bridal Suite</span>
                                <span>✦ Secure Ample Parking</span>
                                <span>✦ Backup Power Generation</span>
                                <span>✦ In-house Culinary Team</span>
                            </div>
                        </div>

                        <button onClick={handleBookNow} className="book-now-btn">
                            Book This Venue
                        </button>
                    </section>
                </div>
            </main>

            <footer className="details-footer">
                <div className="footer-mini">
                    <p>© 2026 Nadsathiramahal. Elevating Celebrations.</p>
                    <div className="login-options">
                        <span>Are you staff? </span>
                        <Link to="/login">Login here</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HallDetails;
