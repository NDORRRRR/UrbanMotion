import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../App.css';

const ProfilePage = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    profile_picture: null
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      if (user.profile_picture) {
        setImagePreview(user.profile_picture);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      if (selectedFile) {
        data.append('profile_picture', selectedFile);
      }

      const res = await api.put('/users/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-color)' }}>
        Silakan login terlebih dahulu.
      </div>
    );
  }
  return (
    <div style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div className="profile-card">

        {/* ===== AVATAR SECTION ===== */}
        <div className="profile-avatar-large">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            user.username ? user.username.charAt(0).toUpperCase() : 'U'
          )}
        </div>

        {/* Upload Input saat Mode Edit */}
        {isEditing && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginBottom: '1rem' }}
            />
          </div>
        )}

        {isEditing ? (
          <div style={{ marginBottom: '1rem' }}>
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

        <div className="profile-role-badge">
          {user.role === 'admin' ? 'Administrator' :
            user.role === 'reseller' ? 'Seller' : 'Member'}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'left' }}>

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

        <div className="action-buttons">
          {isEditing ? (
            <>
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    username: user.username || '',
                    email: user.email || '',
                    phone: user.phone || ''
                  });
                }}
                disabled={loading}
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
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
                  logout();
                  navigate('/login');
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