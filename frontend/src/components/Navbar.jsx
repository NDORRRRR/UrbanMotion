import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar({ theme, toggleTheme }) {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">LOGO COK</Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/legit-check" className="nav-link">Legit Check</Link>
          <Link to="/history" className="nav-link">Riwayat LC</Link>

          {user && (user.role === 'admin' || user.role === 'reseller') && (
            <Link to="/sell" className='nav-link' style={{ color: 'var(--main-red)', fontWeight: 'bold' }}>
                + Jual Sepatu
            </Link>
          )}
          <Link to="/forum" className="nav-link">Forum</Link>
        </div>

        <div className="nav-auth">
          {/* ⬇️ TOMBOL DARK MODE ⬇️ */}
          <button onClick={toggleTheme} className="nav-theme-btn" title="Ganti Tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {token ? (
            <>
              <Link to="/cart" className="nav-link" style={{marginRight: '15px', fontSize: '1.2rem'}} title="Keranjang">
                  🛒
              </Link>
              <Link to="/orders" className="nav-link" style={{marginRight: '15px'}} title="Pesanan">
                 📦 Order
              </Link>
              <Link to="/profile" className="nav-user" style={{textDecoration: 'none', marginRight: '15px', fontWeight: 'bold'}}>
                Halo, {user ? user.username : 'User'}
              </Link>
              <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;