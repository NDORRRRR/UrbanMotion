import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LegitCheckPage from './pages/LegitCheckPage';
import HistoryPage from './pages/HistoryPage';
import AddProductPage from './pages/AddProductPage';
import ForumPage from './pages/ForumPage';
import CreateThreadPage from './pages/CreateThreadPage';
import ThreadDetailPage from './pages/ThreadDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import HelpPage from './pages/HelpPage';
import SellerDashboard from './pages/SellerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminLegitChecks from './pages/AdminLegitChecks';
import AdminProducts from './pages/AdminProducts';
import AdminAnalytics from './pages/AdminAnalytics';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const location = useLocation();

  // Check if current route is admin panel
  const isAdminRoute = location.pathname.startsWith('/admin');

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

          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="legit-checks" element={<AdminLegitChecks />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route
            path="/dashboard/seller"
            element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/sell" element={<AddProductPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/create" element={<CreateThreadPage />} />
          <Route path="/forum/:id" element={<ThreadDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />

          {/* Help Routes */}
          <Route path="/faq" element={<HelpPage />} />
          <Route path="/shipping" element={<HelpPage />} />
          <Route path="/returns" element={<HelpPage />} />
          <Route path="/contact" element={<HelpPage />} />

        </Routes>
      </div>

      {/* Only show Footer if NOT on admin routes */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;