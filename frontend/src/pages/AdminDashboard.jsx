import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/analytics/dashboard');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>📊 Dashboard Overview</h1>
        <p>Welcome back, Admin!</p>
      </header>

      <div className="stats-grid">
        {/* User Stats */}
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{stats?.users?.total_users || 0}</p>
            <div className="stat-details">
              <span>👤 Buyers: {stats?.users?.buyers || 0}</span>
              <span>🛍️ Sellers: {stats?.users?.sellers || 0}</span>
              <span>🔧 Admins: {stats?.users?.admins || 0}</span>
            </div>
          </div>
        </div>

        {/* Product Stats */}
        <div className="stat-card products">
          <div className="stat-icon">👟</div>
          <div className="stat-content">
            <h3>Products</h3>
            <p className="stat-number">{stats?.products?.total_products || 0}</p>
            <div className="stat-details">
              <span>⏳ Pending: {stats?.products?.pending || 0}</span>
              <span>✅ Approved: {stats?.products?.approved || 0}</span>
              <span>❌ Rejected: {stats?.products?.rejected || 0}</span>
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <div className="stat-card orders">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Orders</h3>
            <p className="stat-number">{stats?.orders?.total_orders || 0}</p>
            <div className="stat-details">
              <span>🆕 New: {stats?.orders?.new_orders || 0}</span>
              <span>🚚 Shipped: {stats?.orders?.shipped || 0}</span>
              <span>✅ Delivered: {stats?.orders?.delivered || 0}</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">
              Rp {(stats?.orders?.total_revenue || 0).toLocaleString('id-ID')}
            </p>
            <div className="stat-details">
              <span>From {stats?.orders?.total_orders || 0} paid orders</span>
            </div>
          </div>
        </div>

        {/* Legit Check Stats */}
        <div className="stat-card legit-checks">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Legit Checks</h3>
            <p className="stat-number">{stats?.legit_checks?.total_checks || 0}</p>
            <div className="stat-details">
              <span>⏳ Pending: {stats?.legit_checks?.pending || 0}</span>
              <span>✅ Completed: {stats?.legit_checks?.completed || 0}</span>
            </div>
          </div>
        </div>

        {/* Banned Users */}
        <div className="stat-card banned">
          <div className="stat-icon">🚫</div>
          <div className="stat-content">
            <h3>Banned Users</h3>
            <p className="stat-number">{stats?.users?.banned || 0}</p>
            <div className="stat-details">
              <span>Active restrictions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div className="action-buttons">
          <a href="/admin/users" className="action-btn">
            👥 Manage Users
          </a>
          <a href="/admin/legit-checks" className="action-btn">
            ✅ Review Legit Checks ({stats?.legit_checks?.pending || 0} pending)
          </a>
          <a href="/admin/products" className="action-btn">
            👟 Moderate Products ({stats?.products?.pending || 0} pending)
          </a>
          <a href="/admin/analytics" className="action-btn">
            📈 View Analytics
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;