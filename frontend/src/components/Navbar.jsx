import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import logoUrban from '../assets/logo.png';

function Navbar({ theme, toggleTheme }) {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/login');
  };

  const isSeller = user && (user.role === 'admin' || user.role === 'reseller');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        
        {/* === SECTION KIRI: LOGO === */}
        <Link to="/" className="nav-brand">
          <img src={logoUrban} alt="Urban Motion" className="brand-logo" />
        </Link>

        {/* === SECTION TENGAH: MENU UTAMA === */}
        <div className="nav-center">
          <Link to="/" className={`nav-item ${isActive('/')}`}>Home</Link>
          <Link to="/legit-check" className={`nav-item ${isActive('/legit-check')}`}>Legit Check</Link>
          <Link to="/history" className={`nav-item ${isActive('/history')}`}>Riwayat</Link>
          <Link to="/forum" className={`nav-item ${isActive('/forum')}`}>Forum</Link>

          {/* --- PERBAIKAN: Dashboard Kembali ke Sini --- */}
          {isSeller && (
            <Link 
              to="/dashboard" 
              className={`nav-item ${isActive('/dashboard')}`}
              style={{ color: 'var(--primary-color)', fontWeight: 'bold' }} // Sedikit dibedakan warnanya
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* === SECTION KANAN: ACTIONS === */}
        <div className="nav-right">
          
          {/* Tombol Jual Khusus Seller/Admin */}
          {isSeller && (
            <Link to="/sell" className="btn-sell" style={{ marginRight: '10px' }}>
              + Jual
            </Link>
          )}

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="icon-btn theme-toggle" title="Ganti Tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {token ? (
            <>
              <div className="divider-vertical"></div>

              <Link to="/cart" className="icon-btn" title="Keranjang">
                🛒
              </Link>
              <Link to="/orders" className="icon-btn" title="Pesanan Saya">
                📦
              </Link>

              {/* Profile Dropdown */}
              <div className="profile-wrapper" ref={dropdownRef}>
                <div 
                  className={`profile-trigger ${isProfileOpen ? 'active' : ''}`}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="avatar-circle">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="username-text">{user?.username}</span>
                  <span className="arrow-icon">▼</span>
                </div>

                <div className={`dropdown-menu ${isProfileOpen ? 'show' : ''}`}>
                  <div className="dropdown-header">
                    <p className="user-label">Logged in as</p>
                    <p className="user-name-bold">{user?.username}</p>
                    <span className="user-role-badge">{user?.role || 'User'}</span>
                  </div>
                  
                  {/* Menu Dashboard juga bisa ditaruh di dropdown sebagai cadangan */}
                  {isSeller && (
                    <Link to="/dashboard" className="dropdown-link" onClick={() => setIsProfileOpen(false)}>
                      📊 Dashboard
                    </Link>
                  )}

                  <Link to="/profile" className="dropdown-link" onClick={() => setIsProfileOpen(false)}>
                    👤 Edit Profil
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button onClick={handleLogout} className="dropdown-link logout">
                    🚪 Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;