import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const BoothComparison = ({ data }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [metric, setMetric] = useState('visitors');
  
  // Filter data based on time range
  const filteredData = data.filter(item => {
    if (timeRange === 'all') return true;
    
    const timestamp = new Date(item.timestamp);
    const now = new Date();
    
    if (timeRange === 'day') {
      return timestamp >= new Date(new Date().setDate(now.getDate() - 1));
    } else if (timeRange === 'week') {
      return timestamp >= new Date(new Date().setDate(now.getDate() - 7));
    }
    
    return true;
  });
  
  // Function to calculate dwell time in minutes
  const calculateDwellTime = (inTime, outTime) => {
    const start = new Date(inTime);
    const end = new Date(outTime);
    return Math.round((end - start) / (1000 * 60)); // Convert to minutes
  };
  
  // Group data by booth
  const boothData = {};
  
  filteredData.forEach(item => {
    const boothId = item.booth_id || 'unknown';
    
    if (!boothData[boothId]) {
      boothData[boothId] = {
        name: boothId,
        visitors: 0,
        totalDwellTime: 0,
        totalRssi: 0,
        rssiCount: 0
      };
    }
    
    boothData[boothId].visitors++;
    boothData[boothId].totalDwellTime += calculateDwellTime(item.in_time, item.out_time);
    
    const avgRssi = item.rssi_values.reduce((sum, val) => sum + val, 0) / item.rssi_values.length;
    boothData[boothId].totalRssi += avgRssi;
    boothData[boothId].rssiCount++;
  });
  
  // Calculate averages and prepare data for chart
  const comparisonData = Object.values(boothData).map(booth => ({
    name: booth.name,
    visitors: booth.visitors,
    avgDwellTime: booth.visitors > 0 ? booth.totalDwellTime / booth.visitors : 0,
    avgRssi: booth.rssiCount > 0 ? booth.totalRssi / booth.rssiCount : 0,
    averageDistance: booth.rssiCount > 0 ? 
      Math.pow(10, ((-60 - (booth.totalRssi / booth.rssiCount)) / (10 * 2))).toFixed(2) : 0
  }));
  
  // Sort data based on selected metric
  const sortedData = [...comparisonData].sort((a, b) => {
    if (metric === 'visitors') {
      return b.visitors - a.visitors;
    } else if (metric === 'avgDwellTime') {
      return b.avgDwellTime - a.avgDwellTime;
    } else if (metric === 'avgRssi') {
      return b.avgRssi - a.avgRssi; // Less negative RSSI is better (stronger signal)
    } else if (metric === 'averageDistance') {
      return a.averageDistance - b.averageDistance; // Smaller distance is better
    }
    return 0;
  });
  
  // Limit to top 10 booths for better visualization
  const displayData = sortedData.slice(0, 10);
  
  // Mapping of metric to display name and color
  const metricMap = {
    visitors: { label: 'Total Visitors', color: '#0088FE' },
    avgDwellTime: { label: 'Average Dwell Time (min)', color: '#00C49F' },
    avgRssi: { label: 'Average RSSI', color: '#FFBB28' },
    averageDistance: { label: 'Average Distance (m)', color: '#FF8042' }
  };
  
  // Styles
  const dashboardStyle = {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f5f7fa',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
  };
  
  const headerStyle = {
    borderBottom: '1px solid #e1e4e8',
    marginBottom: '20px',
    paddingBottom: '10px'
  };
  
  const headerTitleStyle = {
    color: '#2c3e50',
    margin: '0 0 10px 0',
    fontSize: '24px'
  };
  
  const controlsContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  const controlGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    marginRight: '20px',
    marginBottom: '10px'
  };
  
  const labelStyle = {
    marginRight: '10px',
    fontWeight: '600',
    color: '#4a5568'
  };
  
  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #cbd5e0',
    backgroundColor: '#f8fafc',
    fontSize: '14px',
    color: '#2d3748',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s',
    minWidth: '150px'
  };
  
  const chartStyle = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  };
  
  const chartTitleStyle = {
    margin: '0 0 15px 0',
    fontSize: '18px',
    color: '#2c3e50',
    fontWeight: '600',
    borderBottom: '1px solid #e1e4e8',
    paddingBottom: '10px'
  };
  
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px'
  };
  
  const tableHeaderStyle = {
    backgroundColor: '#f8fafc',
    color: '#4a5568',
    padding: '12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    borderBottom: '2px solid #edf2f7'
  };
  
  const tableCellStyle = {
    padding: '12px',
    borderBottom: '1px solid #edf2f7',
    fontSize: '14px',
    color: '#2d3748'
  };
  
  const metricColors = {
    visitors: '#0088FE',
    avgDwellTime: '#00C49F',
    avgRssi: '#FFBB28',
    averageDistance: '#FF8042'
  };
  
  return (
    <div style={dashboardStyle}>
      <div style={headerStyle}>
        <h2 style={headerTitleStyle}>Booth Performance Comparison</h2>
      </div>
      
      <div style={controlsContainerStyle}>
        <div style={controlGroupStyle}>
          <label style={labelStyle}>Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Time</option>
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
          </select>
        </div>
        
        <div style={controlGroupStyle}>
          <label style={labelStyle}>Metric:</label>
          <select 
            value={metric} 
            onChange={(e) => setMetric(e.target.value)}
            style={selectStyle}
          >
            <option value="visitors">Total Visitors</option>
            <option value="avgDwellTime">Average Dwell Time</option>
            <option value="avgRssi">Signal Strength (RSSI)</option>
            <option value="averageDistance">Average Distance</option>
          </select>
        </div>
      </div>
      
      <div style={chartStyle}>
        <h3 style={chartTitleStyle}>Booth Comparison by {metricMap[metric].label}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={displayData} 
            layout="vertical" 
            margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ebedf0" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" tick={{fontSize: 12}} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            />
            <Legend wrapperStyle={{paddingTop: '10px'}} />
            <Bar 
              dataKey={metric} 
              fill={metricMap[metric].color} 
              name={metricMap[metric].label} 
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div style={chartStyle}>
        <h3 style={chartTitleStyle}>Booth Performance Overview</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Booth</th>
                <th style={tableHeaderStyle}>Visitors</th>
                <th style={tableHeaderStyle}>Avg. Dwell Time (min)</th>
                <th style={tableHeaderStyle}>Avg. RSSI</th>
                <th style={tableHeaderStyle}>Est. Distance (m)</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((booth, index) => (
                <tr key={booth.name} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={tableCellStyle}>{booth.name}</td>
                  <td style={tableCellStyle}>{booth.visitors}</td>
                  <td style={tableCellStyle}>{booth.avgDwellTime.toFixed(1)}</td>
                  <td style={tableCellStyle}>{booth.avgRssi.toFixed(1)}</td>
                  <td style={tableCellStyle}>{booth.averageDistance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BoothComparison;