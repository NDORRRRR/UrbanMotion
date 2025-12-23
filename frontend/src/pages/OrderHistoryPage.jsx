import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaTruck, FaMapMarkerAlt, FaBoxOpen } from 'react-icons/fa';
import './OrderHistory.css';

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatRp = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getStatusStyle = (status) => {
    if (status === 'shipped') return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
    if (status === 'delivered') return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };

    if (status === 'paid' || status === 'settlement' || status === 'capture') return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
    if (status === 'pending') return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
    if (status === 'deny' || status === 'cancel' || status === 'expire' || status === 'failure') return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    return { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' };
  };

  const handleConfirm = async (itemId) => {
    if (!window.confirm('Apakah Anda yakin pesanan sudah diterima?')) return;
    try {
      await api.post(`/orders/item/${itemId}/confirm`);
      fetchOrders();
      alert('Terima kasih! Pesanan selesai.');
    } catch (error) {
      alert('Gagal konfirmasi.');
      console.error(error);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
      Loading riwayat...
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ color: 'var(--text-color)', marginBottom: '1.5rem', fontWeight: '700' }}>
        Riwayat Belanja
      </h2>

      {orders.length === 0 ? (
        <div className="order-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p className="text-muted">Belum ada pesanan.</p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} className="order-card">

              {/* HEADER KARTU */}
              <div className="order-header">
                <div>
                  <div className="text-main" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Order #{order.id}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="status-badge" style={getStatusStyle(order.order_status === 'delivered' ? 'delivered' : order.payment_status)}>
                    {order.order_status === 'delivered' ? 'Selesai' : (order.payment_status || 'Unpaid')}
                  </span>
                  <div style={{ fontWeight: 'bold', color: 'var(--main-red)', marginTop: '8px' }}>
                    {formatRp(order.total_amount)}
                  </div>

                  {/* Tombol Cancel Order (Hanya jika masih unpaid/pending dan belum delivered) */}
                  {(order.payment_status === 'pending' || order.order_status === 'new') && order.order_status !== 'delivered' && (
                    <button
                      onClick={async () => {
                        if (!window.confirm('Yakin ingin membatalkan order ini? Stok akan dikembalikan.')) return;
                        try {
                          await api.post(`/orders/${order.id}/cancel`);
                          const res = await api.get('/orders');
                          setOrders(res.data);
                          alert('Order dibatalkan.');
                        } catch (e) {
                          alert('Gagal cancel.');
                          console.error(e);
                        }
                      }}
                      style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>

              {/* ISI ITEM */}
              <div className="order-body">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="item-image">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.8rem' }}>No Img</div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="text-main" style={{ fontWeight: '600' }}>
                        {item.name || `Produk ID ${item.product_id}`}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                        {item.quantity} x {formatRp(item.price_at_purchase)}
                      </div>

                      {/* Tampilkan Resi Jika Ada */}
                      {item.tracking_number && (
                        <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-color)', backgroundColor: 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                          🚚 Resi: <strong>{item.tracking_number}</strong>
                        </div>
                      )}

                      {/* Tombol Konfirmasi (Jika ada resi & belum selesai) */}
                      {item.tracking_number && item.shipping_status !== 'delivered' && (
                        <button
                          onClick={() => handleConfirm(item.id)}
                          style={{
                            marginTop: '8px',
                            marginLeft: '10px',
                            padding: '4px 10px',
                            fontSize: '0.8rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Pesanan Diterima
                        </button>
                      )}

                      {/* Status Delivered (Jika sudah selesai) */}
                      {item.shipping_status === 'delivered' && (
                        <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>
                          ✅ Selesai
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER (ALAMAT) */}
              <div className="order-footer">
                <span style={{ marginRight: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaMapMarkerAlt color="var(--primary-color)" /> Dikirim ke:
                </span>
                <span className="text-main">{order.shipping_address || '-'}</span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;