import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin', icon: '📊', label: 'Dashboard', exact: true },
        { path: '/admin/users', icon: '👥', label: 'User Management' },
        { path: '/admin/legit-checks', icon: '✅', label: 'Legit Check Review' },
        { path: '/admin/products', icon: '👟', label: 'Product Moderation' },
        { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>🔧 Admin Panel</h2>
                    <p>UrbanMotion</p>
                </div>

                <nav className="admin-nav">
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-item ${item.exact
                                ? location.pathname === item.path ? 'active' : ''
                                : location.pathname.startsWith(item.path) && item.path !== '/admin' ? 'active' : ''
                                }`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
