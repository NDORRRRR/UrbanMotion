import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CartPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRp = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  const fetchCart = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      alert(error.response?.data?.message || 'Gagal mengambil data keranjang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const handleRemoveItem = async (productId, size) => {
    if (!window.confirm('Yakin ingin menghapus item ini dari keranjang?')) return;
    try {
      await api.delete(`/cart/${productId}`, {
        data: { size } // Axios delete dengan body
      });
      setCartItems(cartItems.filter(item => !(item.product_id === productId && item.size === size)));
    } catch (error) {
      alert('Gagal menghapus item.');
    }
  };

  const handleQuantityChange = async (productId, size, newQuantity) => {
    if (newQuantity < 1) return handleRemoveItem(productId, size);
    
    // Optimistic Update
    setCartItems(
      cartItems.map(item => 
        (item.product_id === productId && item.size === size) 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );

    try {
      await api.post('/cart', { productId, quantity: newQuantity, size });
    } catch (error) {
      alert('Gagal update kuantitas.');
      fetchCart(); 
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  if (loading) return <p style={{textAlign:'center', marginTop:'3rem'}}>Memuat Keranjang...</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>Keranjang Belanja Anda</h1>

      {cartItems.length === 0 ? (
        <p style={{color: 'var(--text-muted)'}}>Keranjang masih kosong. Yuk, cari sepatu!</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 3, minWidth: '300px' }}>
            {cartItems.map(item => (
              <div key={`${item.product_id}-${item.size}`} style={{ 
                  display: 'flex', 
                  border: '1px solid var(--border-color)',
                  padding: '1rem', marginBottom: '10px', 
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '6px', alignItems: 'center',
                  color: 'var(--text-color)'
                }}>
                
                <img src={item.image_url} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginRight: '1rem' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-color)' }}>{item.name}</h3>
                  <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ukuran: <strong>{item.size}</strong></p>
                  <p style={{ margin: '5px 0', fontWeight: 'bold', color: 'var(--main-red)' }}>{formatRp(item.price)}</p>
                </div>

                {/* 🔥 FIX: Kirim size ke function */}
                <div style={{ width: '120px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button 
                    onClick={() => handleQuantityChange(item.product_id, item.size, item.quantity - 1)} 
                    className="btn-dark" 
                    style={{ padding: '5px' }}
                  >-</button>
                  <span style={{ margin: '0 10px', color: 'var(--text-color)' }}>{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.product_id, item.size, item.quantity + 1)} 
                    className="btn-dark" 
                    style={{ padding: '5px' }} 
                    disabled={item.quantity >= item.stock}
                  >+</button>
                </div>

                <div style={{ width: '120px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-color)' }}>
                  {formatRp(item.price * item.quantity)}
                </div>

                {/* 🔥 FIX: Kirim size ke function */}
                <button 
                  onClick={() => handleRemoveItem(item.product_id, item.size)} 
                  style={{ marginLeft: '1rem', background: 'none', color: 'var(--main-red)', fontSize:'1.2rem', border: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, border: '1px solid var(--border-color)', padding: '1.5rem', backgroundColor: 'var(--card-bg)', borderRadius: '6px', height: 'fit-content' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-color)' }}>Ringkasan Pesanan</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-color)' }}>
              <span>Total Barang ({cartItems.length})</span>
              <span>{formatRp(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold', fontSize: '1.2rem', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-color)' }}>Total Pembayaran</span>
              <span style={{ color: 'var(--main-red)' }}>{formatRp(subtotal)}</span>
            </div>

            <button 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '1rem' }} 
                onClick={() => navigate('/checkout')}
                disabled={cartItems.length === 0}
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;