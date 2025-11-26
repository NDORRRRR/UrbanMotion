// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ProfilePage() {
  const [formData, setFormData] = useState({
    username: '', email: '', full_name: '', phone: '', address: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile')
      .then(res => {
        // Isi form dengan data yang ada, atau string kosong jika null
        setFormData({
          ...res.data,
          full_name: res.data.full_name || '',
          phone: res.data.phone || '',
          address: res.data.address || ''
        });
        setLoading(false);
      })
      .catch(err => alert('Gagal ambil profil'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', formData);
      alert('Profil berhasil disimpan!');
    } catch (error) {
      alert('Gagal update profil.');
    }
  };

  if (loading) return <p style={{textAlign:'center', marginTop:'2rem'}}>Loading...</p>;

  return (
    <div className="form-container" style={{maxWidth:'600px', marginTop:'2rem'}}>
      <h2 style={{textAlign:'center', color:'var(--main-dark)'}}>Pengaturan Profil</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label>Username</label>
            <input type="text" value={formData.username} disabled style={{backgroundColor:'#eee'}} />
        </div>
        <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} disabled style={{backgroundColor:'#eee'}} />
        </div>
        
        <hr style={{margin:'20px 0', borderTop:'1px solid #ddd'}}/>
        
        <div className="form-group">
            <label>Nama Lengkap (Penerima)</label>
            <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Nama sesuai KTP/Penerima Paket"/>
        </div>
        <div className="form-group">
            <label>Nomor HP</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08xxxxxxxx"/>
        </div>
        <div className="form-group">
            <label>Alamat Lengkap</label>
            <textarea rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."></textarea>
        </div>

        <button className="btn-primary" style={{width:'100%'}}>Simpan Perubahan</button>
      </form>
    </div>
  );
}

export default ProfilePage;