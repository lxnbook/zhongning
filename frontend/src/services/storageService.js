// 创建本地存储服务
const storageService = {
  // 保存数据
  saveData: (key, data) => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  },
  
  // 获取数据
  getData: (key, defaultValue = null) => {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('获取数据失败:', error);
      return defaultValue;
    }
  },
  
  // 删除数据
  removeData: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('删除数据失败:', error);
      return false;
    }
  },
  
  // 清除所有数据
  clearAll: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('清除数据失败:', error);
      return false;
    }
  }
};

export default storageService; 