import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // 验证token并获取用户信息
          const userData = await apiService.get('/auth/me');
          setUser(userData);
        }
      } catch (error) {
        console.error('身份验证失败:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (credentials) => {
    try {
      const response = await apiService.post('/auth/login', credentials);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };
  
  const value = {
    user,
    loading,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 