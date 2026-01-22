// src/pages/Home.jsx
import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="logo">Nadsathiramahal</h1>
        </div>
        <div className="nav-center">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/booking" className="nav-link">Book Now</Link>
        </div>
        <div className="nav-right">
          <Link to="/login" className="login-btn">Login</Link>
          <button className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Welcome to Nadsathiramahal</h2>
          <p className="hero-description">
            Experience luxury and tranquility at Nadsathiramahal. Our booking platform offers you a seamless way to reserve your stay at our prestigious property. Whether you're planning a weekend getaway, a family vacation, or a special celebration, we provide personalized service to ensure your experience exceeds expectations. Book now and immerse yourself in the unique charm and comfort of Nadsathiramahal.
          </p>
          <Link to="/booking" className="get-started-btn">
            Get Started →
          </Link>
        </div>
      </div>

      {/* Hall Types */}
      <div className="halls-section">
        <h2>Our Event Halls</h2>
        <div className="halls-grid">
          <div className="hall-card">
            <div className="hall-image">Standard Hall</div>
            <h3>Standard Hall</h3>
            <p>Capacity: 150 guests</p>
            <p>Price: ₹15,000/day</p>
          </div>
          <div className="hall-card">
            <div className="hall-image">Premium Hall</div>
            <h3>Premium Hall</h3>
            <p>Capacity: 300 guests</p>
            <p>Price: ₹25,000/day</p>
          </div>
          <div className="hall-card">
            <div className="hall-image">Luxury Hall</div>
            <h3>Luxury Hall</h3>
            <p>Capacity: 500 guests</p>
            <p>Price: ₹40,000/day</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Nadsathiramahal. All rights reserved.</p>
        <p>Contact: info@nadsathiramahal.com | Phone: +91 9876543210</p>
      </footer>
    </div>
  );
};

export default Home;