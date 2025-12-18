import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebook, FaTiktok } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">

        {/* Kolom 1: Brand & Info */}
        <div className="footer-brand">
          <h3>Urban Motion</h3>
          <p className="footer-description">
            Destinasi utama untuk sneakers original dan apparel streetwear impianmu.
            Dijamin authentic dengan garansi uang kembali.
          </p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="TikTok">
              <FaTiktok />
            </a>
          </div>
        </div>

        {/* Kolom 2: Navigasi */}
        <div className="footer-nav">
          <h4 className="footer-heading">Jelajahi</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/legit-check">Legit Check</Link></li>
            <li><Link to="/forum">Forum Komunitas</Link></li>
            <li><Link to="/history">Riwayat Belanja</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Layanan Pelanggan */}
        <div className="footer-nav">
          <h4 className="footer-heading">Bantuan</h4>
          <ul className="footer-links">
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/shipping">Pengiriman</Link></li>
            <li><Link to="/returns">Kebijakan Retur</Link></li>
            <li><Link to="/contact">Hubungi Kami</Link></li>
          </ul>
        </div>

        {/* Kolom 4: Newsletter */}
        <div className="footer-newsletter">
          <h4 className="footer-heading">Berita & Promo</h4>
          <p className="footer-description">
            Dapatkan info rilis sneakers terbaru dan voucher diskon spesial.
          </p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="newsletter-input"
            />
            <button type="submit" className="btn-subscribe">
              Langganan
            </button>
          </form>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Urban Motion. All rights reserved.</p>
        <p>Made with 🔥 by Adhim & Team</p>
      </div>
    </footer>
  );
};

export default Footer;