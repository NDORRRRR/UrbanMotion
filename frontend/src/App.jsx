import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LegitCheckPage from './pages/LegitCheckPage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import AddProductPage from './pages/AddProductPage';
import ForumPage from './pages/ForumPage';
import CreateThreadPage from './pages/CreateThreadPage';
import ThreadDetailPage from './pages/ThreadDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
// import Dashboard from './pages/SellerDashboard';
import SellerDashboard from './pages/SellerDashboard';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/legit-check" element={<LegitCheckPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="/dashboard" element={<SellerDashboard />} />

          <Route path="/sell" element={<AddProductPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/create" element={<CreateThreadPage />} />
          <Route path="/forum/:id" element={<ThreadDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;