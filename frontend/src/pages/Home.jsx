// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [halls, setHalls] = useState([]);

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      setUserEmail(localStorage.getItem('userEmail') || 'Guest');
    }

    // Fetch halls from backend
    const fetchHalls = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/halls');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setHalls(data);
          } else {
            // Fallback if DB is empty
            setHalls(FALLBACK_HALLS);
          }
        }
      } catch (error) {
        console.error("Error fetching halls:", error);
        setHalls(FALLBACK_HALLS); // Network error fallback
      }
    };
    fetchHalls();
  }, []);

  const HALL_IMAGES = {
    "Grand Ballroom": "/halls/grand_ballroom.png",
    "Nadsathira Hall": "/halls/sapphire_hall.png",
    "Jade Garden": "/halls/jade_garden.jpg"
  };

  const FALLBACK_HALLS = [
    {
      id: "H01",
      name: "Grand Ballroom",
      capacity: 500,
      price_per_day: 150000,
      description: "Our largest venue, perfect for weddings and grand receptions.",
      image_url: "/halls/grand_ballroom.png"
    },
    {
      id: "H02",
      name: "Nadsathira Hall",
      capacity: 1000,
      price_per_day: 80000,
      description: "An elegant space for intimate gatherings and parties.",
      image_url: "/halls/sapphire_hall.png"
    },
    {
      id: "H03",
      name: "Jade Garden",
      capacity: 400,
      price_per_day: 60000,
      description: "A beautiful open-air venue surrounded by lush greenery.",
      image_url: "/halls/jade_garden.jpg"
    }
  ];


  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserEmail('');
    alert('Logged out successfully!');
    navigate('/login');
  };

  const handleHallBooking = () => {
    // Check session directly on click for maximum reliability
    const checkIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (checkIsLoggedIn) {
      navigate('/booking');
    } else {
      alert("Authentication Required: Please login to book your venue.");
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="logo">Nadsathira<span>mahal</span></h1>
        </div>
        <nav className="nav-center">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/support" className="nav-link">Support</Link>
        </nav>
        <div className="nav-right">
          {isLoggedIn ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ color: '#D4AF37', fontSize: '0.9rem' }}>Welcome, {userEmail}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Reserve Now</Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Where Your Grandest Dreams Take Center Stage</h2>
          <p className="hero-description">
            Discover the most prestigious venues in the heart of the city. At Nadsathiramahal, we blend traditional elegance with contemporary luxury to create unforgettable experiences.
          </p>
          <a href="#halls" className="get-started-btn" onClick={(e) => {
            e.preventDefault();
            document.getElementById('halls').scrollIntoView({ behavior: 'smooth' });
          }}>
            Explore Our Venues ↓
          </a>
        </div>
      </section>

      {/* Hall Types */}
      <section className="halls-section" id="halls">
        <h2>Our Exquisite Venues</h2>
        <p className="section-subtitle">Discover the perfect backdrop for your story. From intimate gatherings to grand celebrations.</p>

        <div className="halls-grid">
          {halls && halls.length > 0 ? halls.map(hall => (
            <div key={hall.id} className="hall-card">
              <div className="hall-image" style={{
                backgroundImage: `url(${HALL_IMAGES[hall.name] || hall.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {(!HALL_IMAGES[hall.name] && !hall.image_url) && (hall.name ? hall.name.split(' ').map(w => w[0]).join('') : 'VH')}
              </div>
              <div className="hall-info">
                <h3>{hall.name || 'Premium Hall'}</h3>
                <div className="hall-stats">
                  <div className="stat-item">
                    <span className="stat-label">Capacity</span>
                    <span className="stat-value">{hall.capacity || 0} Guests</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Investment</span>
                    <span className="stat-value">LKR {hall.price_per_day ? hall.price_per_day.toLocaleString() : '0'}</span>
                  </div>
                </div>
                <p className="hall-description">{hall.description || 'Experience luxury and tranquility in our prestigious property.'}</p>
                <div className="hall-actions">
                  <Link to={`/hall/${hall.id}`} className="view-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Show Details
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="loading-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
              <p>Curating our premium selections for you...</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>Nadsathiramahal</h2>
            <p>Exquisite venues for life's most precious celebrations. Crafting memories since 2004.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/booking">Booking</Link></li>

              <li><Link to="/about">Our Story</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li><Link to="/support">Contact Us</Link></li>
              <li><Link to="/support">FAQ</Link></li>
              <li><Link to="/support">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Visit Us</h4>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              123 Grand Ballroom Avenue,<br />
              Colombo 07, Sri Lanka.<br />
              Phone: +94 77 123 4567
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Nadsathiramahal Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;