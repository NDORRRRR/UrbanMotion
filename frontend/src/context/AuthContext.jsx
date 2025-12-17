import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Loading state untuk cegah flicker

  // ✅ FIX: Restore user dari token saat app pertama kali load
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          
          const response = await api.get('/users/profile');
          
          setUser(response.data);
          setToken(savedToken);
          
          console.log('✅ Session restored:', response.data.username);
        } catch (error) {
          console.error('❌ Token invalid atau expired:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false); // Selesai loading
    };

    restoreSession();
  }, []); // Hanya jalankan sekali saat mount

  // Login function
  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    setToken(userToken);
    setUser(userData);
    console.log('✅ Login success:', userData.username);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    console.log('🚪 Logged out');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)'
      }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}