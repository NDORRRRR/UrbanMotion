import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import '../App.css'; 

const ProfilePage = () => {
  // ========== STATE & HOOKS ==========
  const { user, login, logout } = useAuth(); 
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false); // Toggle mode edit
  const [loading, setLoading] = useState(false); // Loading state saat save
  
  // Form data untuk edit profil
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: ''
  });

  // ========== EFFECTS ==========
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
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  // Handle save profile
  const handleSave = async () => {
    setLoading(true);
    try {
      // Kirim data ke backend API
      const res = await api.put('/users/profile', formData);
      
      // Update state user global di AuthContext
      const currentToken = localStorage.getItem('token');
      login(res.data.user, currentToken);
      
      alert('Profil berhasil diperbarui!');
      setIsEditing(false); // Keluar dari mode edit
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui profil: ' + (err.response?.data?.message || 'Error server'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{textAlign:'center', marginTop:'50px', color:'var(--text-color)'}}>
        Silakan login terlebih dahulu.
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div className="profile-card">
        
        {/* ===== AVATAR SECTION ===== */}
        <div className="profile-avatar-large">
          {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        
        {/* ===== USERNAME SECTION (Editable/Read-only) ===== */}
        {isEditing ? (
          // Mode Edit: Tampilkan Input
          <div style={{marginBottom: '1rem'}}>
            <label className="profile-label">Username</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange}
              className="edit-input"
              placeholder="Username Anda"
            />
          </div>
        ) : (
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>
            {user.username}
          </h2>
        )}

        {/* ===== ROLE BADGE ===== */}
        <div className="profile-role-badge">
          {user.role === 'admin' ? 'Administrator' : 
           user.role === 'reseller' ? 'Seller' : 'Member'}
        </div>

        {/* ===== DETAIL INFORMATION SECTION ===== */}
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          
          {/* --- EMAIL FIELD --- */}
          <div className="profile-info-group">
            <span className="profile-label">Email</span>
            {isEditing ? (
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                className="edit-input"
                placeholder="email@example.com"
              />
            ) : (
              <span className="profile-value">{user.email || '-'}</span>
            )}
          </div>

          {/* --- PHONE FIELD --- */}
          <div className="profile-info-group">
            <span className="profile-label">Nomor Telepon</span>
            {isEditing ? (
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                className="edit-input"
                placeholder="08xxxxxxxxxx"
              />
            ) : (
              <span className="profile-value">{user.phone || 'Belum diisi'}</span>
            )}
          </div>

          {/* --- JOIN DATE (Read-only, tidak bisa diedit) --- */}
          <div className="profile-info-group">
            <span className="profile-label">Bergabung Sejak</span>
            <span className="profile-value">
              {user.created_at 
                ? new Date(user.created_at).toLocaleDateString('id-ID', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : '-'}
            </span>
          </div>
        </div>

        {/* ===== ACTION BUTTONS SECTION ===== */}
        <div className="action-buttons">
          {isEditing ? (
            // --- EDIT MODE BUTTONS ---
            <>
              {/* Button Batal */}
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setIsEditing(false);
                  // Reset form ke data asli
                  setFormData({
                    username: user.username || '',
                    email: user.email || '',
                    phone: user.phone || ''
                  });
                }}
                disabled={loading}
                style={{borderColor: '#ef4444', color: '#ef4444'}}
              >
                Batal
              </button>

              {/* Button Simpan */}
              <button 
                className="btn-secondary" 
                onClick={handleSave}
                disabled={loading}
                style={{
                  backgroundColor: 'var(--main-red)', 
                  color: 'white', 
                  borderColor: 'var(--main-red)'
                }}
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </>
          ) : (
            // --- VIEW MODE BUTTONS ---
            <>
              {/* Button Edit Profil */}
              <button 
                className="btn-secondary" 
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profil
              </button>

              {/* Button Logout */}
              <button 
                onClick={() => { 
                  logout(); // Hapus token & user dari context
                  navigate('/login'); // ✅ FIX: Sekarang navigate bisa jalan!
                }}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  border: 'none',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#fecaca';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fee2e2';
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