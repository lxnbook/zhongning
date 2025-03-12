import React, { createContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ...现有代码
  
  // 添加权限检查函数
  const checkPermission = (requiredPermission) => {
    if (!user) return false;
    
    // 假设用户对象中有 permissions 数组
    return user.permissions && user.permissions.includes(requiredPermission);
  };
  
  // 添加角色检查函数
  const checkRole = (requiredRole) => {
    if (!user) return false;
    
    // 假设用户对象中有 roles 数组
    return user.roles && user.roles.includes(requiredRole);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      checkPermission, 
      checkRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 