import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const OrganizationChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">暂无组织分布数据</Typography>
      </Box>
    );
  }

  // 处理数据
  const chartData = data.map(item => ({
    name: item._id.length > 15 ? `${item._id.substring(0, 15)}...` : item._id,
    value: item.count,
    fullName: item._id
  }));

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
          <Bar dataKey="value" name="用户数" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default OrganizationChart; 