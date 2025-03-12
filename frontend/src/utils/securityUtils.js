import CryptoJS from 'crypto-js';
import { useState, useEffect } from 'react';

// 敏感数据加密
export const encryptData = (data, key) => {
  if (!data) return null;
  const jsonStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
  return CryptoJS.AES.encrypt(jsonStr, key).toString();
};

// 敏感数据解密
export const decryptData = (encryptedData, key) => {
  if (!encryptedData) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error('解密数据失败', error);
    return null;
  }
};

// 数据脱敏
export const maskSensitiveData = (data, type) => {
  if (!data) return '';
  
  switch (type) {
    case 'phone':
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    case 'email':
      const [username, domain] = data.split('@');
      return `${username.charAt(0)}***@${domain}`;
    case 'name':
      if (data.length <= 2) {
        return `${data.charAt(0)}*`;
      }
      const stars = '*'.repeat(data.length - 2);
      return `${data.charAt(0)}${stars}${data.charAt(data.length - 1)}`;
    case 'idcard':
      return data.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
    default:
      return data;
  }
};

// 隐私政策同意检查
export const usePrivacyConsent = () => {
  const [hasConsent, setHasConsent] = useState(false);
  
  useEffect(() => {
    const consent = localStorage.getItem('privacyConsent');
    setHasConsent(consent === 'true');
  }, []);
  
  const giveConsent = () => {
    localStorage.setItem('privacyConsent', 'true');
    localStorage.setItem('privacyConsentDate', new Date().toISOString());
    setHasConsent(true);
  };
  
  return { hasConsent, giveConsent };
};

// 数据访问审计
export const logDataAccess = async (dataType, dataId, action, userId) => {
  try {
    await fetch('/api/audit/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dataType,
        dataId,
        action,
        userId,
        timestamp: new Date().toISOString(),
        ipAddress: window.clientIP || 'unknown',
        userAgent: navigator.userAgent
      })
    });
  } catch (error) {
    console.error('记录数据访问失败', error);
  }
}; 