// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import './Home.css'; // Reusing premium navbar/footer styles

const About = () => {
  return (
    <div className="home-container">
      {/* Reusing navbar for consistency */}
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="logo">Nadsathira<span>mahal</span></h1>
        </div>
        <nav className="nav-center">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/about" className="nav-link active">About</Link>
          <Link to="/support" className="nav-link">Support</Link>
        </nav>
        <div className="nav-right">
          <Link to="/login" className="login-btn">Reserve Now</Link>
        </div>
      </nav>

      <section style={{ padding: '8rem 4rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '4rem', color: '#4D0000', marginBottom: '2rem' }}>Our Story</h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '2', color: '#4b5563', marginBottom: '2rem' }}>
          Established in 2004, Nadsathiramahal was born out of a passion for crafting perfect celebrations.
          What started as a small family-owned banquet hall has grown into one of the most prestigious
          event venues in the country.
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '2', color: '#4b5563', marginBottom: '2rem' }}>
          Our philosophy is simple: Luxury shouldn't be distant. We provide an environment that feels both
          grand and welcoming, ensuring that every guest feels like royalty. From the hand-carved pillars
          of our Grand Mahal to the manicured lawns of our Garden Suite, every detail is designed to
          inspire awe and create lasting memories.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '4rem' }}>
          <div style={{ padding: '2rem', background: 'white', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#800000', marginBottom: '1rem' }}>Our Mission</h3>
            <p>To provide exquisite venues and exceptional service that transform ordinary events into extraordinary memories.</p>
          </div>
          <div style={{ padding: '2rem', background: 'white', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#800000', marginBottom: '1rem' }}>Our Vision</h3>
            <p>To be the premier destination for celebrations, recognized globally for our hospitality and architectural elegance.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2026 Nadsathiramahal Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
