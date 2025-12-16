import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import logoUrban from '../assets/logo.png';

function Navbar({ theme, toggleTheme }) {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSeller = user && (user.role === 'admin' || user.role === 'reseller');

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img 
            src={logoUrban}
            alt="Urban Motion"
            height="40"
          />
        </Link>

        {/* Nav Links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/legit-check" className="nav-link">Legit Check</Link>
          <Link to="/history" className="nav-link">Riwayat LC</Link>

          {/* Dashboard - Khusus Seller/Admin */}
          {isSeller && (
            <Link to="/dashboard" className="nav-link nav-link-dashboard">
              📊 Dashboard
            </Link>
          )}

          {/* Jual Sepatu - Khusus Seller/Admin */}
          {isSeller && (
            <Link to="/sell" className="nav-link nav-link-sell">
              + Jual Sepatu
            </Link>
          )}

          <Link to="/forum" className="nav-link">Forum</Link>
        </div>

        {/* Right Side - Auth & Actions */}
        <div className="nav-auth">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme} 
            className="nav-theme-btn" 
            title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {token ? (
            <>
              {/* Cart */}
              <Link to="/cart" className="nav-icon-link" title="Keranjang">
                🛒
              </Link>

              {/* Orders */}
              <Link to="/orders" className="nav-icon-link" title="Pesanan">
                📦 Order
              </Link>

              {/* Profile */}
              <Link to="/profile" className="nav-user-link">
                Halo, {user?.username || 'User'}
              </Link>

              {/* Logout */}
              <button onClick={handleLogout} className="nav-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-login-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;