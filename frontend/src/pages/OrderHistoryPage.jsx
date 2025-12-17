import React, { useState, useEffect } from 'react';
import api from '../services/api';

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
    if (status === 'paid' || status === 'settlement') return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }; // Hijau
    if (status === 'pending') return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }; // Kuning/Orange
    if (status === 'failed' || status === 'expire') return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }; // Merah
    return { backgroundColor: 'var(--border-color)', color: 'var(--text-muted)' }; // Default
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
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit'
                    })}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <span className="status-badge" style={getStatusStyle(order.status)}>
                    {order.status}
                  </span>
                  <div style={{ fontWeight: 'bold', color: 'var(--main-red)', marginTop: '8px' }}>
                    {formatRp(order.total_amount)}
                  </div>
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
                    </div>
                  </div>
                ))}
              </div>
              
              {/* FOOTER (ALAMAT) */}
              <div className="order-footer">
                <span style={{ marginRight: '5px' }}>📍 Dikirim ke:</span> 
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