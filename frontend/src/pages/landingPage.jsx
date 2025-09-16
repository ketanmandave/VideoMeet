import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LandingPage.css"; // New CSS file for custom styles

const LandingPage = () => {
  const router = useNavigate();

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">VideoMeet</h2>
        <div className="nav-links">  
          <p onClick={() => router("/auth")}>Register</p>
          <button className="login-btn" onClick={() => router("/auth")}>
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>
            Connect with <span className="highlight">Your Loved Ones</span> Anytime!
          </h1>
          <p>
            Experience high-quality video calls, screen sharing, and chat – all in one platform.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => router("/auth")}>
              Start a Call
            </button>
            <button className="btn-secondary" onClick={() => router("/febbf3eb")}>
              Join as Guest
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/video.png" alt="Video Call Illustration" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose VideoMeet?</h2>
        <div className="feature-cards">
          <div className="card">
            <img src="/fast-connection.svg" alt="Fast" />
            <h3>Fast & Secure</h3>
            <p>Enjoy seamless and secure communication with end-to-end encryption.</p>
          </div>
          <div className="card">
            <img src="/screen-share.svg" alt="Screen Sharing" />
            <h3>Screen Sharing</h3>
            <p>Share your screen with just one click and collaborate in real time.</p>
          </div>
          <div className="card">
            <img src="/chat.svg" alt="Chat" />
            <h3>Built-in Chat</h3>
            <p>Send text messages and links instantly while on the call.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} VideoMeet. All rights reserved.</p>
        <div className="footer-links">
          <Link>Privacy Policy</Link>
          <Link>Terms</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
