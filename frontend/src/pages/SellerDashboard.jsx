import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import './SellerDashboard.css';

function SellerDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [productImages, setProductImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [imagesToAdd, setImagesToAdd] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const formatRp = (num) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);


  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }


    if (user && user.role === 'admin') {
      navigate('/admin');
      return;
    }

    if (user && user.role !== 'seller' && user.role !== 'admin') {
      toast.error('Akses Ditolak! Anda bukan Seller.');
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [token, user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/products'),
        api.get('/dashboard/orders')
      ]);

      setStats(statsRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      toast.error('Gagal memuat dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleEditProduct = async (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      description: product.description || '',
      stock: product.stock,
      sizes: product.sizes || ''
    });
    setShowEditModal(true);


    await fetchProductImages(product.id);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();


    const remainingExisting = productImages.filter(img => !imagesToDelete.includes(img.id)).length;
    const finalImageCount = remainingExisting + imagesToAdd.length;

    if (finalImageCount < 1) {
      toast.error('❌ Minimal 1 gambar diperlukan! Tambahkan gambar sebelum menyimpan.');
      return;
    }

    try {

      await api.put(`/dashboard/products/${editingProduct.id}`, editingProduct);


      for (const imageId of imagesToDelete) {
        await api.delete(`/dashboard/products/${editingProduct.id}/images/${imageId}`);
      }


      for (const imageFile of imagesToAdd) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await api.post(`/dashboard/products/${editingProduct.id}/images`, formData);
      }

      toast.success('Produk berhasil diupdate!');
      setShowEditModal(false);


      setProductImages([]);
      setImagesToDelete([]);
      setImagesToAdd([]);

      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal update produk');
    }
  };


  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      await api.delete(`/dashboard/products/${id}`);
      toast.success('Produk berhasil dihapus!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting product:', error);

      const errorMessage = error.response?.data?.message || 'Gagal menghapus produk';
      toast.error(errorMessage);
    }
  };

  const fetchProductImages = async (productId) => {
    setLoadingImages(true);
    try {
      const res = await api.get(`/dashboard/products/${productId}/images`);
      setProductImages(res.data);
      setImagesToDelete([]);
      setImagesToAdd([]);
    } catch (error) {
      toast.error('Gagal load gambar');
      console.error(error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleStageDeleteImage = (imageId) => {
    setImagesToDelete([...imagesToDelete, imageId]);
    toast.success('Gambar ditandai untuk dihapus (klik Save untuk apply)');
  };

  const handleStageAddImage = (e) => {
    const files = Array.from(e.target.files);

    if (getActiveImages().length + files.length > 6) {
      toast.error('Maksimal 6 gambar per produk');
      return;
    }

    setImagesToAdd([...imagesToAdd, ...files]);
    toast.success(`${files.length} gambar ditambahkan (klik Save untuk upload)`);
    e.target.value = '';
  };

  const handleCancelImageDelete = (imageId) => {
    setImagesToDelete(imagesToDelete.filter(id => id !== imageId));
  };

  const handleRemoveStagedImage = (index) => {
    setImagesToAdd(imagesToAdd.filter((_, i) => i !== index));
  };


  const getActiveImages = () => {
    const activeImages = productImages.filter(img => !imagesToDelete.includes(img.id));
    return [...activeImages, ...imagesToAdd.map((_, i) => ({ id: `new-${i}`, staged: true }))];
  };


  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/dashboard/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status order diupdate!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: 'Baru', className: 'status-new' },
      processing: { label: 'Diproses', className: 'status-processing' },
      shipped: { label: 'Dikirim', className: 'status-shipped' },
      delivered: { label: 'Selesai', className: 'status-delivered' },
      cancelled: { label: 'Dibatalkan', className: 'status-cancelled' }
    };

    const config = statusConfig[status] || { label: status, className: '' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Seller</h1>
          <p>Halo, <strong>{user?.username}</strong>! Kelola produk dan pesanan Anda</p>
        </div>
        <button className="btn-add-product" onClick={() => navigate('/sell')}>
          ➕ Tambah Produk Baru
        </button>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Produk Saya ({products.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Pesanan ({orders.length})
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="stats-grid">
            <div className="stat-card stat-blue">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <p className="stat-label">Total Produk</p>
                <p className="stat-value">{stats.totalProducts}</p>
              </div>
            </div>

            <div className="stat-card stat-green">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <p className="stat-label">Total Pesanan</p>
                <p className="stat-value">{stats.totalOrders}</p>
              </div>
            </div>

            <div className="stat-card stat-yellow">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <p className="stat-label">Total Revenue</p>
                <p className="stat-value">{formatRp(stats.totalRevenue)}</p>
              </div>
            </div>

            <div className="stat-card stat-red">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <p className="stat-label">Pending Orders</p>
                <p className="stat-value">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-grid">
              <button className="action-btn" onClick={() => navigate('/sell')}>
                ➕ Tambah Produk Baru
              </button>
              <button className="action-btn" onClick={() => setActiveTab('orders')}>
                📦 Lihat Pesanan Baru
              </button>
              <button className="action-btn" onClick={() => setActiveTab('products')}>
                🔧 Kelola Produk
              </button>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="top-products">
            <h3>🔥 Produk Terlaris</h3>
            <div className="product-list">
              {products
                .sort((a, b) => b.total_sold - a.total_sold)
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="product-item">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'}
                    />
                    <div className="product-info">
                      <p className="product-name">{product.name}</p>
                      <p className="product-sold">{product.total_sold || 0} terjual</p>
                    </div>
                    <p className="product-price">{formatRp(product.price)}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="tab-content">
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Brand</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th>Terjual</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'}
                        />
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.brand}</td>
                    <td className="price-cell">{formatRp(product.price)}</td>
                    <td>
                      <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
                        {product.stock === 0 ? 'Habis' : `${product.stock} unit`}
                      </span>
                    </td>
                    <td>{product.total_sold || 0} terjual</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="tab-content">
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <h4>Order #{order.id}</h4>
                    <p className="order-customer">👤 {order.customer_name} ({order.customer_email})</p>
                  </div>
                  {getStatusBadge(order.order_status)}
                </div>

                <div className="order-body">
                  <div className="order-detail">
                    <span className="label">Produk:</span>
                    <span>{order.items}</span>
                  </div>
                  <div className="order-detail">
                    <span className="label">Total:</span>
                    <span className="price">{formatRp(order.total_amount)}</span>
                  </div>
                  <div className="order-detail">
                    <span className="label">Tanggal:</span>
                    <span>{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="order-detail">
                    <span className="label">Alamat:</span>
                    <span>{order.shipping_address}</span>
                  </div>
                </div>

                {order.order_status === 'new' && (
                  <div className="order-actions">
                    <button
                      className="btn-process"
                      onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                    >
                      ✅ Proses Pesanan
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                    >
                      ❌ Tolak
                    </button>
                  </div>
                )}

                {order.order_status === 'processing' && (
                  <div className="order-actions">
                    <button
                      className="btn-ship"
                      onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                    >
                      🚚 Tandai Dikirim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Produk</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            <form onSubmit={handleUpdateProduct}>
              <div className="form-group">
                <label>Nama Produk</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Harga (Rp)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stok</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ukuran (pisah koma)</label>
                  <input
                    type="text"
                    value={editingProduct.sizes}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value })}
                    placeholder="39, 40, 41, 42"
                  />
                </div>
              </div>

              {/* IMAGE MANAGEMENT SECTION */}
              <div className="form-group">
                <label>Kelola Gambar Produk ({getActiveImages().length}/6)</label>

                {loadingImages ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading gambar...
                  </div>
                ) : (
                  <div className="image-gallery">
                    {/* Existing Images */}
                    {productImages.map(img => (
                      <div
                        key={img.id}
                        className={`image-item ${imagesToDelete.includes(img.id) ? 'marked-delete' : ''}`}
                      >
                        <img src={img.image_url} alt="Product" />
                        {imagesToDelete.includes(img.id) ? (
                          <button
                            type="button"
                            className="btn-image-undo"
                            onClick={() => handleCancelImageDelete(img.id)}
                          >
                            ↩️ Batal
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-image-delete"
                            onClick={() => handleStageDeleteImage(img.id)}
                          >
                            🗑️ Hapus
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Staged New Images Preview */}
                    {imagesToAdd.map((file, index) => (
                      <div key={`new-${index}`} className="image-item image-new">
                        <img src={URL.createObjectURL(file)} alt="New" />
                        <div className="image-badge">Baru</div>
                        <button
                          type="button"
                          className="btn-image-delete"
                          onClick={() => handleRemoveStagedImage(index)}
                        >
                          ❌ Batal
                        </button>
                      </div>
                    ))}

                    {/* Add Image Button */}
                    {getActiveImages().length < 6 && (
                      <div className="image-item image-upload">
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          multiple
                          onChange={handleStageAddImage}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="image-upload" className="upload-label">
                          <div>➕</div>
                          <div style={{ fontSize: '0.8rem' }}>Tambah</div>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                  💡 Perubahan gambar akan disimpan saat klik tombol "Simpan Perubahan"
                </small>
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  rows="4"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowEditModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-save">
                  💾 Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;