import React from 'react';
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

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1 }}>
        <Routes>
          {/* --- Rute Umum --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* --- Rute Legit Check --- */}
          <Route path="/legit-check" element={<LegitCheckPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* --- Rute E-Commerce (Jualan) --- */}
          <Route path="/sell" element={<AddProductPage />} />
          
          {/* --- Rute Forum --- */}
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/create" element={<CreateThreadPage />} />
          <Route path="/forum/:id" element={<ThreadDetailPage />} />

          {/* --- Rute Cart --- */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;