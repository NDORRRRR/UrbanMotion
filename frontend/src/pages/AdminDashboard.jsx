import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../App.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_legit_checks: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard'); 
      
      console.log("Data dashboard:", response.data);
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Gagal memuat data. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, []);

  // Format Rupiah Helper
  const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', color: 'var(--text-color)' }}>
        <h3>🔄 Memuat Dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-color)', fontSize: '2rem', fontWeight: '700' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Ringkasan aktivitas UrbanMotion hari ini.</p>
      </div>

      {/* ERROR MESSAGE (Jika ada) */}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* STATS CARDS GRID */}
      <div className="dashboard-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        
        {/* Card 1: Total Users */}
        <div className="content-card stats-card">
          <div className="stats-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>👥</div>
          <div>
            <p className="stats-label">Total Pengguna</p>
            <h3 className="stats-value">{stats.total_users || 0}</h3>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="content-card stats-card">
          <div className="stats-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>📦</div>
          <div>
            <p className="stats-label">Total Pesanan</p>
            <h3 className="stats-value">{stats.total_orders || 0}</h3>
          </div>
        </div>

        {/* Card 3: Pendapatan */}
        <div className="content-card stats-card">
          <div className="stats-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>💰</div>
          <div>
            <p className="stats-label">Pendapatan</p>
            <h3 className="stats-value">{formatRp(stats.total_revenue)}</h3>
          </div>
        </div>

        {/* Card 4: Legit Check Pending */}
        <div className="content-card stats-card">
          <div className="stats-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>🔍</div>
          <div>
            <p className="stats-label">Legit Check Pending</p>
            <h3 className="stats-value">{stats.pending_legit_checks || 0}</h3>
            {stats.pending_legit_checks > 0 && (
               <Link to="/admin/legit-check" style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>
                 Lihat Request &rarr;
               </Link>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>Aksi Cepat</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/add-product" className="btn-action primary">
          + Tambah Produk Baru
        </Link>
        <Link to="/orders" className="btn-action secondary">
          Lihat Semua Pesanan
        </Link>
        <Link to="/admin/users" className="btn-action secondary">
          Kelola Pengguna
        </Link>
      </div>

    </div>
  );
};

export default AdminDashboard;