import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/AdminDashboard.css';

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/admin/analytics/dashboard');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading analytics...</div>;

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>📈 Analytics & Reports</h1>
                <p>Detailed insights and statistics</p>
            </header>

            {/* Same stats as dashboard but more detailed */}
            <div className="stats-grid">
                <div className="stat-card users">
                    <div className="stat-content">
                        <h3>👥 User Statistics</h3>
                        <p className="stat-number">{stats?.users?.total_users || 0} Total</p>
                        <div className="stat-details">
                            <span>Buyers: {stats?.users?.buyers || 0}</span>
                            <span>Sellers: {stats?.users?.sellers || 0}</span>
                            <span>Admins: {stats?.users?.admins || 0}</span>
                            <span>Banned: {stats?.users?.banned || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card products">
                    <div className="stat-content">
                        <h3>👟 Product Statistics</h3>
                        <p className="stat-number">{stats?.products?.total_products || 0} Total</p>
                        <div className="stat-details">
                            <span>Pending: {stats?.products?.pending || 0}</span>
                            <span>Approved: {stats?.products?.approved || 0}</span>
                            <span>Rejected: {stats?.products?.rejected || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card orders">
                    <div className="stat-content">
                        <h3>📦 Order Statistics</h3>
                        <p className="stat-number">{stats?.orders?.total_orders || 0} Total</p>
                        <div className="stat-details">
                            <span>New: {stats?.orders?.new_orders || 0}</span>
                            <span>Processing: {stats?.orders?.processing || 0}</span>
                            <span>Shipped: {stats?.orders?.shipped || 0}</span>
                            <span>Delivered: {stats?.orders?.delivered || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card revenue">
                    <div className="stat-content">
                        <h3>💰 Revenue</h3>
                        <p className="stat-number">
                            Rp {(stats?.orders?.total_revenue || 0).toLocaleString('id-ID')}
                        </p>
                        <div className="stat-details">
                            <span>From all paid orders</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card legit-checks">
                    <div className="stat-content">
                        <h3>✅ Legit Check Stats</h3>
                        <p className="stat-number">{stats?.legit_checks?.total_checks || 0} Total</p>
                        <div className="stat-details">
                            <span>Pending: {stats?.legit_checks?.pending || 0}</span>
                            <span>Completed: {stats?.legit_checks?.completed || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '32px', padding: '24px', background: 'white', borderRadius: '12px' }}>
                <h2>📊 More Analytics Coming Soon</h2>
                <p style={{ color: '#64748b' }}>
                    Revenue charts, user growth graphs, and detailed reports will be added in future updates.
                </p>
            </div>
        </div>
    );
};

export default AdminAnalytics;
