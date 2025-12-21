import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/AdminDashboard.css';

const AdminLegitChecks = () => {
    const [legitChecks, setLegitChecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCheck, setSelectedCheck] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ result: '', notes: '' });

    useEffect(() => {
        fetchLegitChecks();
    }, []);

    const fetchLegitChecks = async () => {
        try {
            const response = await api.get('/admin/legit-checks/pending');
            setLegitChecks(response.data.legit_checks);
        } catch (error) {
            toast.error('Gagal memuat data legit check');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async () => {
        if (!reviewData.result || !reviewData.notes) {
            toast.error('Semua field wajib diisi');
            return;
        }

        try {
            await api.put(`/admin/legit-checks/${selectedCheck.id}/review`, reviewData);
            toast.success('Legit check berhasil di-review!');
            setShowReviewModal(false);
            setReviewData({ result: '', notes: '' });
            fetchLegitChecks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mereview legit check');
        }
    };

    if (loading) return <div className="admin-loading">Loading legit checks...</div>;

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>✅ Legit Check Review</h1>
                <p>Review sneaker authenticity submissions</p>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Sneaker Name</th>
                            <th>Images</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {legitChecks.map(check => (
                            <tr key={check.id}>
                                <td>{check.id}</td>
                                <td>{check.username}</td>
                                <td><strong>{check.sneaker_name}</strong></td>
                                <td>
                                    <div className="image-grid">
                                        {check.images.slice(0, 3).map((img, idx) => (
                                            <img key={idx} src={img} alt={`Image ${idx + 1}`} />
                                        ))}
                                        {check.images.length > 3 && (
                                            <span>+{check.images.length - 3} more</span>
                                        )}
                                    </div>
                                </td>
                                <td>{new Date(check.created_at).toLocaleDateString('id-ID')}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setSelectedCheck(check);
                                            setShowReviewModal(true);
                                        }}
                                        className="btn-action edit"
                                    >
                                        📝 Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {legitChecks.length === 0 && (
                    <div className="empty-state">
                        <p>✅ Tidak ada legit check pending untuk di-review</p>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedCheck && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Review: {selectedCheck.sneaker_name}</h3>
                        <p><strong>Submitted by:</strong> {selectedCheck.username}</p>

                        <div className="image-grid">
                            {selectedCheck.images.map((img, idx) => (
                                <img key={idx} src={img} alt={`Image ${idx + 1}`} />
                            ))}
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <label><strong>Result:</strong></label>
                            <select
                                value={reviewData.result}
                                onChange={(e) => setReviewData({ ...reviewData, result: e.target.value })}
                                style={{ width: '100%', padding: '10px', marginTop: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="">-- Pilih Result --</option>
                                <option value="verified">✅ Verified (Authentic)</option>
                                <option value="fake">❌ Fake (Not Authentic)</option>
                                <option value="inconclusive">❓ Inconclusive (Need More Info)</option>
                            </select>
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            <label><strong>Review Notes:</strong></label>
                            <textarea
                                value={reviewData.notes}
                                onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                                placeholder="Jelaskan alasan hasil review..."
                                rows={5}
                                className="ban-reason-input"
                                style={{ marginTop: '8px' }}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={handleReview}
                                className="modal-btn admin"
                                disabled={!reviewData.result || !reviewData.notes}
                            >
                                ✅ Submit Review
                            </button>
                            <button onClick={() => setShowReviewModal(false)} className="modal-btn cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLegitChecks;
