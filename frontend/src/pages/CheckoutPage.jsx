import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MIDTRANS_CLIENT_KEY = 'Mid-client-WAQ7lACoB1-k3NZU'; 

const loadMidtransScript = () => {
    return new Promise((resolve) => {
        if (window.snap) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
        script.onload = resolve;
        document.body.appendChild(script);
    });
};

function CheckoutPage() {
    const navigate = useNavigate();
    
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk Detail Alamat
    const [recipientName, setRecipientName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    // Hitung total
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalAmount = subtotal; 

    useEffect(() => {
        const fetchCartAndScripts = async () => {
            try {
                const response = await api.get('/cart');
                if (response.data.length === 0) {
                    alert("Keranjang kosong, kembali ke toko!");
                    navigate('/');
                    return;
                }
                setCartItems(response.data);
                await loadMidtransScript();
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Gagal memuat data checkout.");
            } finally {
                setLoading(false);
            }
        };
        fetchCartAndScripts();
    }, [navigate]);

    const formatRp = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        // 1. Validasi Input
        if (!recipientName || !phone || !address) {
            alert('Semua detail alamat wajib diisi!');
            return;
        }
        
        // 2. Gabung Alamat jadi satu string
        const fullAddressPayload = `Penerima: ${recipientName} | HP: ${phone} | Alamat: ${address}`;

        const itemsPayload = cartItems.map(item => ({
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            seller_id: item.seller_id,
            size: item.size,
        }));
        
        try {
            const response = await api.post('/checkout/', { 
                shipping_address: fullAddressPayload,
                total_amount: finalAmount,
                payment_method: 'midtrans_snap',
                items: itemsPayload,
            }); 
            
            const { snap_token, orderId } = response.data;

            if (window.snap) {
                window.snap.pay(snap_token, {
                    onSuccess: function(result) {
                        alert(`Pembayaran Sukses! Order ID: ${orderId}`);
                        navigate('/history');
                    },
                    onPending: function(result) {
                        alert(`Pembayaran Pending! Silakan selesaikan pembayaran.`);
                        navigate('/history');
                    },
                    onError: function(result) {
                        alert("Pembayaran Gagal.");
                    },
                    onClose: function() {
                        alert('Anda menutup pop-up pembayaran.');
                    }
                });
            } else {
                alert("Midtrans Script belum terload. Coba refresh halaman.");
            }

        } catch (error) {
            console.error('Error saat checkout:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Gagal memproses pembayaran.');
        }
    };

    if (loading) return <p style={{textAlign:'center', marginTop:'3rem'}}>Memuat Checkout...</p>;

    return (
        <div className="form-container" style={{maxWidth:'1000px', padding:'2rem', marginTop:'2rem'}}>
            <h1 style={{color:'var(--main-dark)', borderBottom:'1px solid #ddd', paddingBottom:'10px', marginBottom:'2rem'}}>Ringkasan Checkout</h1>
            
            <form onSubmit={handleCheckout} style={{display:'flex', gap:'30px', flexWrap:'wrap'}}>
                
                <div style={{flex: 2, minWidth: '300px'}}>
                    <h3>1. Alamat Pengiriman</h3>
                    
                    <div className="form-group">
                        <label>Nama Penerima</label>
                        <input 
                            type="text" 
                            className="lc-input"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            required
                            style={{width: '100%', padding: '8px', marginBottom: '10px'}}
                        />
                    </div>
                    <div className="form-group">
                        <label>Nomor HP</label>
                        <input 
                            type="tel" 
                            className="lc-input"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08xxxxxxxxxx"
                            required
                            style={{width: '100%', padding: '8px', marginBottom: '10px'}}
                        />
                    </div>
                    <div className="form-group">
                        <label>Alamat Lengkap</label>
                        <textarea 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Jalan, Nomor Rumah, RT/RW, Kecamatan, Kota"
                            rows="3" 
                            required
                            style={{width: '100%', padding: '8px', marginBottom: '10px'}}
                        ></textarea>
                    </div>

                    <h3 style={{marginTop: '20px'}}>2. Detail Pesanan</h3>
                    {cartItems.map(item => (
                        <div key={item.product_id} style={{display:'flex', alignItems:'center', borderBottom:'1px solid #eee', padding:'10px 0'}}>
                            <img src={item.image_url} alt={item.name} style={{width:'50px', height:'50px', objectFit:'cover', marginRight:'15px', borderRadius: '4px'}}/>
                            <div style={{flex: 1}}>
                                <h4 style={{margin:0, fontSize:'1rem'}}>{item.name}</h4>
                                <span style={{fontSize:'0.9rem', color: '#666'}}>Qty: {item.quantity}</span>
                            </div>
                            <span style={{fontWeight:'bold'}}>{formatRp(item.price * item.quantity)}</span>
                        </div>
                    ))}
                </div>
                
                <div style={{flex: 1, minWidth: '280px', backgroundColor:'#f9fafb', padding:'1.5rem', borderRadius:'8px', height: 'fit-content'}}>
                    <h3>3. Pembayaran</h3>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                        <span>Subtotal</span>
                        <span>{formatRp(subtotal)}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', paddingBottom:'15px', borderBottom:'1px solid #ddd'}}>
                        <span>Ongkir</span>
                        <span>Gratis</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.4rem', marginBottom: '20px'}}>
                        <span>TOTAL</span>
                        <span style={{color:'var(--main-red)'}}>{formatRp(finalAmount)}</span>
                    </div>

                    <button type="submit" className="btn-primary" style={{width:'100%', padding:'15px', fontSize: '1.1rem'}}>
                        BAYAR SEKARANG
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CheckoutPage;