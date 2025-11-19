import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Lempar ke login setelah logout
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo/Nama Web */}
        <Link to="/" className="nav-logo">
          Urban Motion
        </Link>

        {/* Link Halaman Kiri */}
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/legit-check" className="nav-link">Legit Check</Link>
          <Link to="/history" className="nav-link">Riwayat</Link>

          {user && (user.role === 'admin' || user.role === 'reseller') && (
            <Link to="/sell" className='nav-link' style={{ color: 'var(--main-red)', fontWeight: 'bold' }}>
                + Jual Sepatu
            </Link>
          )}
          <Link to="/forum" className="nav-link">Forum</Link>
        </div>

        <div className="nav-auth">
          {token ? (
            // JIKA SUDAH LOGIN
            <>
            <Link to="/cart" className="nav-link" style={{marginRight: '10px'}}>
                🛒 Keranjang
            </Link>
              <span className="nav-user">
                Halo, {user ? user.username : 'User'}
              </span>
              <button onClick={handleLogout} className="nav-logout-btn">
                Logout
              </button>
            </>
          ) : (
            // JIKA BELUM LOGIN
            <Link to="/login" className="nav-link-btn">
              Login/Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;