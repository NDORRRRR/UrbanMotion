import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../App.css'; 

const ProfilePage = () => {
  const { user, login, logout } = useAuth(); 
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: ''
  });

  // Isi form saat user data tersedia
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Panggil API update yang baru kita buat
      const res = await api.put('/users/profile', formData);
      
      // Update state user global di AuthContext tanpa logout
      // Asumsinya fungsi 'login' di context menerima (user, token). 
      // Kita pakai token lama dari localStorage.
      const currentToken = localStorage.getItem('token');
      login(res.data.user, currentToken);
      
      alert('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui profil: ' + (err.response?.data?.message || 'Error server'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{textAlign:'center', marginTop:'50px'}}>Silakan login.</div>;

  return (
    <div style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div className="profile-card">
        
        {/* Avatar */}
        <div className="profile-avatar-large">
          {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        
        {/* Jika sedang edit, tampilkan input Judul, jika tidak tampilkan Teks */}
        {isEditing ? (
             <div style={{marginBottom: '1rem'}}>
                <label className="profile-label">Username</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange}
                  className="edit-input"
                />
             </div>
        ) : (
             <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>
               {user.username}
             </h2>
        )}

        <div className="profile-role-badge">
          {user.role || 'Member'}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          
          {/* EMAIL FIELD */}
          <div className="profile-info-group">
            <span className="profile-label">Email</span>
            {isEditing ? (
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                className="edit-input"
              />
            ) : (
              <span className="profile-value">{user.email || '-'}</span>
            )}
          </div>

          {/* PHONE FIELD */}
          <div className="profile-info-group">
            <span className="profile-label">Nomor Telepon</span>
            {isEditing ? (
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                className="edit-input"
                placeholder="08xxxxxxxx"
              />
            ) : (
              <span className="profile-value">{user.phone || '-'}</span>
            )}
          </div>

          {/* JOIN DATE (Tidak bisa diedit) */}
          <div className="profile-info-group">
            <span className="profile-label">Bergabung Sejak</span>
            <span className="profile-value">
              {user.created_at 
                ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                : '-'}
            </span>
          </div>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="action-buttons">
          {isEditing ? (
            <>
              <button 
                className="btn-secondary" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
                style={{borderColor: '#ef4444', color: '#ef4444'}}
              >
                Batal
              </button>
              <button 
                className="btn-secondary" 
                onClick={handleSave}
                disabled={loading}
                style={{backgroundColor: 'var(--main-red)', color: 'white', borderColor: 'var(--main-red)'}}
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profil
              </button>
              <button 
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  border: 'none',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🚪 Logout
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;