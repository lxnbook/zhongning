import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserStatsChart = ({ data, timeRange, dataKey = 'count', color = '#8884d8', title }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data && data.length > 0) {
      // 处理数据，确保日期格式正确
      const formattedData = data.map(item => ({
        date: item._id,
        [dataKey]: item[dataKey] || 0
      }));
      
      setChartData(formattedData);
      setLoading(false);
    } else {
      setChartData([]);
      setLoading(false);
    }
  }, [data, dataKey]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (chartData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">暂无数据</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      {title && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default UserStatsChart; 