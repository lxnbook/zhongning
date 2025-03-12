import React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const RoleDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">暂无角色分布数据</Typography>
      </Box>
    );
  }

  // 处理数据
  const chartData = data.map(item => ({
    name: item._id,
    value: item.count
  }));

  // 自定义工具提示
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            border: '1px solid #ccc',
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <Typography variant="subtitle2">{payload[0].name}</Typography>
          <Typography variant="body2">
            数量: {payload[0].value}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            占比: {`${(payload[0].payload.percent * 100).toFixed(2)}%`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // 计算百分比
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercent = chartData.map(item => ({
    ...item,
    percent: item.value / total
  }));

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercent}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {dataWithPercent.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RoleDistributionChart; 