import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/AdminDashboard.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ role: 'all', search: '', banned: 'all' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [banReason, setBanReason] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            const params = {};
            if (filter.role !== 'all') params.role = filter.role;
            if (filter.search) params.search = filter.search;
            if (filter.banned !== 'all') params.banned = filter.banned;

            const response = await api.get('/admin/users', { params });
            setUsers(response.data.users);
        } catch (error) {
            toast.error('Gagal memuat data users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async (newRole) => {
        try {
            await api.put(`/admin/users/${selectedUser.id}/role`, { role: newRole });
            toast.success(`Role berhasil diubah menjadi ${newRole}`);
            setShowRoleModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengubah role');
        }
    };

    const handleBanUser = async (banned) => {
        try {
            await api.put(`/admin/users/${selectedUser.id}/ban`, {
                banned,
                reason: banned ? banReason : null
            });
            toast.success(banned ? 'User berhasil di-ban' : 'User berhasil di-unban');
            setShowBanModal(false);
            setBanReason('');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memproses ban user');
        }
    };

    if (loading) return <div className="admin-loading">Loading users...</div>;

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>👥 User Management</h1>
                <p>Manage user roles and permissions</p>
            </header>

            {/* Filters */}
            <div className="admin-filters">
                <input
                    type="text"
                    placeholder="🔍 Search by username or email..."
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    className="search-input"
                />

                <select
                    value={filter.role}
                    onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                    className="filter-select"
                >
                    <option value="all">All Roles</option>
                    <option value="user">Buyers</option>
                    <option value="seller">Sellers</option>
                    <option value="admin">Admins</option>
                </select>

                <select
                    value={filter.banned}
                    onChange={(e) => setFilter({ ...filter, banned: e.target.value })}
                    className="filter-select"
                >
                    <option value="all">All Status</option>
                    <option value="false">Active</option>
                    <option value="true">Banned</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className={user.banned_at ? 'banned-row' : ''}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge ${user.role}`}>
                                        {user.role === 'user' ? '👤' : user.role === 'seller' ? '🛍️' : '🔧'} {user.role}
                                    </span>
                                </td>
                                <td>
                                    {user.banned_at ? (
                                        <span className="status-badge banned">🚫 Banned</span>
                                    ) : (
                                        <span className="status-badge active">✅ Active</span>
                                    )}
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                                <td>
                                    <div className="action-buttons-cell">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowRoleModal(true);
                                            }}
                                            className="btn-action edit"
                                            title="Change Role"
                                        >
                                            🔄
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowBanModal(true);
                                            }}
                                            className={`btn-action ${user.banned_at ? 'unban' : 'ban'}`}
                                            title={user.banned_at ? 'Unban User' : 'Ban User'}
                                        >
                                            {user.banned_at ? '✅' : '🚫'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="empty-state">
                        <p>No users found</p>
                    </div>
                )}
            </div>

            {/* Change Role Modal */}
            {showRoleModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Change Role untuk {selectedUser.username}</h3>
                        <p>Current role: <strong>{selectedUser.role}</strong></p>
                        <div className="modal-actions">
                            <button onClick={() => handleChangeRole('user')} className="modal-btn user">
                                👤 Set as Buyer
                            </button>
                            <button onClick={() => handleChangeRole('seller')} className="modal-btn seller">
                                🛍️ Set as Seller
                            </button>
                            <button onClick={() => handleChangeRole('admin')} className="modal-btn admin">
                                🔧 Set as Admin
                            </button>
                            <button onClick={() => setShowRoleModal(false)} className="modal-btn cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ban/Unban Modal */}
            {showBanModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowBanModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{selectedUser.banned_at ? 'Unban' : 'Ban'} User: {selectedUser.username}</h3>

                        {selectedUser.banned_at ? (
                            <>
                                <p><strong>Banned reason:</strong> {selectedUser.ban_reason}</p>
                                <div className="modal-actions">
                                    <button onClick={() => handleBanUser(false)} className="modal-btn unban">
                                        ✅ Unban User
                                    </button>
                                    <button onClick={() => setShowBanModal(false)} className="modal-btn cancel">
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p>Masukkan alasan ban:</p>
                                <textarea
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Contoh: Melanggar peraturan komunitas..."
                                    rows={4}
                                    className="ban-reason-input"
                                />
                                <div className="modal-actions">
                                    <button
                                        onClick={() => handleBanUser(true)}
                                        className="modal-btn ban"
                                        disabled={!banReason.trim()}
                                    >
                                        🚫 Ban User
                                    </button>
                                    <button onClick={() => setShowBanModal(false)} className="modal-btn cancel">
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
