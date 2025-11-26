// src/pages/OrderHistoryPage.jsx
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

  const formatRp = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getStatusColor = (status) => {
    if (status === 'paid' || status === 'settlement') return '#d1fae5'; // Hijau
    if (status === 'pending') return '#fef3c7'; // Kuning
    if (status === 'failed' || status === 'expire') return '#fee2e2'; // Merah
    return '#eee';
  };

  if (loading) return <p style={{textAlign:'center', marginTop:'2rem'}}>Loading...</p>;

  return (
    <div style={{maxWidth:'900px', margin:'2rem auto', padding:'1rem'}}>
      <h1 style={{color:'var(--main-dark)', marginBottom:'1.5rem'}}>Riwayat Belanja</h1>

      {orders.length === 0 ? (
        <p>Belum ada pesanan.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{border:'1px solid var(--main-grey)', borderRadius:'8px', marginBottom:'1.5rem', overflow:'hidden', backgroundColor:'white'}}>
            {/* Header Order */}
            <div style={{padding:'1rem', background:'#f9fafb', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
              <div>
                <strong>Order #{order.id}</strong> <br/>
                <span style={{fontSize:'0.85rem', color:'#666'}}>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{textAlign:'right'}}>
                <span style={{padding:'4px 8px', borderRadius:'4px', background: getStatusColor(order.payment_status), fontWeight:'bold', fontSize:'0.85rem'}}>
                  {order.payment_status.toUpperCase()}
                </span> <br/>
                <span style={{fontWeight:'bold', color:'var(--main-red)'}}>{formatRp(order.total_amount)}</span>
              </div>
            </div>

            {/* List Item */}
            <div style={{padding:'1rem'}}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{display:'flex', alignItems:'center', marginBottom:'10px'}}>
                  <div style={{width:'50px', height:'50px', background:'#eee', marginRight:'15px', borderRadius:'4px', overflow:'hidden'}}>
                    {/* Karena kita belum simpan gambar di order_items, kita ambil dari join product. Kalau produk dihapus, gambar hilang (Kelemahan struktur simpel) */}
                     <img src={item.image_url} alt="prod" style={{width:'100%', height:'100%', objectFit:'cover'}} /> 
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:'bold'}}>{item.name || `Produk ID ${item.product_id}`}</div>
                    <div style={{fontSize:'0.9rem', color:'#666'}}>{item.quantity} x {formatRp(item.price_at_purchase)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{padding:'0.5rem 1rem', borderTop:'1px solid #eee', fontSize:'0.9rem', color:'#555'}}>
                Dikirim ke: {order.shipping_address}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderHistoryPage;