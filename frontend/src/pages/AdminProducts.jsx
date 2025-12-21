import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/AdminDashboard.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products/pending');
            setProducts(response.data.products);
        } catch (error) {
            toast.error('Gagal memuat data produk');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (productId) => {
        if (!confirm('Approve produk ini?')) return;

        try {
            await api.put(`/admin/products/${productId}/approve`);
            toast.success('Produk berhasil di-approve!');
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal approve produk');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Alasan reject wajib diisi');
            return;
        }

        try {
            await api.put(`/admin/products/${selectedProduct.id}/reject`, { reason: rejectReason });
            toast.success('Produk berhasil di-reject!');
            setShowModal(false);
            setRejectReason('');
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal reject produk');
        }
    };

    if (loading) return <div className="admin-loading">Loading products...</div>;

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>👟 Product Moderation</h1>
                <p>Approve or reject seller products</p>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Brand</th>
                            <th>Seller</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Images</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td><strong>{product.name}</strong></td>
                                <td>{product.brand}</td>
                                <td>{product.seller_name}</td>
                                <td>Rp {product.price.toLocaleString('id-ID')}</td>
                                <td>{product.stock}</td>
                                <td>
                                    <div className="image-grid">
                                        {product.images.slice(0, 2).map((img, idx) => (
                                            <img key={idx} src={img} alt={`Product ${idx + 1}`} />
                                        ))}
                                        {product.images.length > 2 && (
                                            <span>+{product.images.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons-cell">
                                        <button
                                            onClick={() => handleApprove(product.id)}
                                            className="btn-action unban"
                                            title="Approve Product"
                                        >
                                            ✅
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setShowModal(true);
                                            }}
                                            className="btn-action ban"
                                            title="Reject Product"
                                        >
                                            ❌
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div className="empty-state">
                        <p>✅ Tidak ada produk pending untuk di-moderasi</p>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Reject Product: {selectedProduct.name}</h3>
                        <p><strong>Seller:</strong> {selectedProduct.seller_name}</p>

                        <div className="image-grid">
                            {selectedProduct.images.slice(0, 4).map((img, idx) => (
                                <img key={idx} src={img} alt={`Product ${idx + 1}`} />
                            ))}
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            <label><strong>Reject Reason:</strong></label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Contoh: Gambar tidak jelas, deskripsi tidak lengkap..."
                                rows={4}
                                className="ban-reason-input"
                                style={{ marginTop: '8px' }}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={handleReject}
                                className="modal-btn ban"
                                disabled={!rejectReason.trim()}
                            >
                                ❌ Reject Product
                            </button>
                            <button onClick={() => setShowModal(false)} className="modal-btn cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
