import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Dashboard = ({ data }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [selectedBooth, setSelectedBooth] = useState('all');
  
  // Extract unique booths
  const booths = ['all', ...new Set(data.map(item => item.booth_id || 'unknown'))];
  
  const filteredData = data.filter(item => {
    const isBoothMatch = selectedBooth === 'all' || String(item.booth_id) === String(selectedBooth);
    
    if (!isBoothMatch) return false;
    
    if (timeRange === 'all') return true;
    
    const timestamp = new Date(item.timestamp);
    // Create a new Date object each time to avoid side effects
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
  
  const totalVisitors = filteredData.length;
  const avgDwellTime = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + calculateDwellTime(item.in_time, item.out_time), 0) / filteredData.length
    : 0;
  
  const rssiRanges = [
    { range: '-90 to -80', count: 0 },
    { range: '-80 to -70', count: 0 },
    { range: '-70 to -60', count: 0 },
    { range: '-60 to -50', count: 0 },
    { range: '-50 to -40', count: 0 },
    { range: '-40 to -30', count: 0 },
    { range: '> -30', count: 0 }
  ];
  
  filteredData.forEach(item => {
    const avgRssi = item.rssi_values.reduce((sum, val) => sum + val, 0) / item.rssi_values.length;
    if (avgRssi <= -80) rssiRanges[0].count++;
    else if (avgRssi <= -70) rssiRanges[1].count++;
    else if (avgRssi <= -60) rssiRanges[2].count++;
    else if (avgRssi <= -50) rssiRanges[3].count++;
    else if (avgRssi <= -40) rssiRanges[4].count++;
    else if (avgRssi <= -30) rssiRanges[5].count++;
    else rssiRanges[6].count++;
  });
  
  // Dwell Time Distribution
  const dwellTimeRanges = [
    { range: '< 1 min', count: 0 },
    { range: '1-2 min', count: 0 },
    { range: '2-5 min', count: 0 },
    { range: '5-10 min', count: 0 },
    { range: '> 10 min', count: 0 }
  ];
  
  filteredData.forEach(item => {
    const dwellTime = calculateDwellTime(item.in_time, item.out_time);
    if (dwellTime < 1) dwellTimeRanges[0].count++;
    else if (dwellTime < 2) dwellTimeRanges[1].count++;
    else if (dwellTime < 5) dwellTimeRanges[2].count++;
    else if (dwellTime < 10) dwellTimeRanges[3].count++;
    else dwellTimeRanges[4].count++;
  });
  
  const hourlyData = Array(24).fill().map((_, i) => ({ hour: i, count: 0 }));
  
  filteredData.forEach(item => {
    const hour = new Date(item.in_time).getHours();
    hourlyData[hour].count++;
  });
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Container styles
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
  
  // Controls styles
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
  
  // Metrics styles
  const metricsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '25px'
  };
  
  const metricCardStyle = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };
  
  const metricTitleStyle = {
    margin: '0 0 10px 0',
    fontSize: '16px',
    color: '#4a5568',
    fontWeight: '600'
  };
  
  const metricValueStyle = {
    margin: '0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#2c3e50'
  };
  
  // Charts styles
  const chartsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
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
  
  return (
    <div style={dashboardStyle}>
      <div style={headerStyle}>
        <h2 style={headerTitleStyle}>Exhibition Analytics Dashboard</h2>
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
          <label style={labelStyle}>Booth:</label>
          <select 
            value={selectedBooth} 
            onChange={(e) => setSelectedBooth(e.target.value)}
            style={selectStyle}
          >
            {booths.map(booth => (
              <option key={booth} value={booth}>
                {booth === 'all' ? 'All Booths' : `Booth ${booth}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={metricsContainerStyle}>
        <div style={{...metricCardStyle, borderTop: '4px solid #0088FE'}}>
          <h3 style={metricTitleStyle}>Total Visitors</h3>
          <p style={metricValueStyle}>{totalVisitors.toLocaleString()}</p>
        </div>
        <div style={{...metricCardStyle, borderTop: '4px solid #00C49F'}}>
          <h3 style={metricTitleStyle}>Avg. Dwell Time</h3>
          <p style={metricValueStyle}>{avgDwellTime.toFixed(1)} min</p>
        </div>
        <div style={{...metricCardStyle, borderTop: '4px solid #8884d8'}}>
          <h3 style={metricTitleStyle}>Active Booths</h3>
          <p style={metricValueStyle}>{booths.length - 1}</p>
        </div>
      </div>
      
      <div style={chartsContainerStyle}>
        <div style={chartStyle}>
          <h3 style={chartTitleStyle}>RSSI Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rssiRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebedf0" />
              <XAxis dataKey="range" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              />
              <Legend wrapperStyle={{paddingTop: '10px'}} />
              <Bar dataKey="count" name="Visitors" fill="#0088FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={chartStyle}>
          <h3 style={chartTitleStyle}>Dwell Time Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dwellTimeRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebedf0" />
              <XAxis dataKey="range" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              />
              <Legend wrapperStyle={{paddingTop: '10px'}} />
              <Bar dataKey="count" name="Visitors" fill="#00C49F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{...chartStyle, gridColumn: '1 / -1'}}>
          <h3 style={chartTitleStyle}>Hourly Visit Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData} margin={{top: 10, right: 30, left: 0, bottom: 10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebedf0" />
              <XAxis 
                dataKey="hour" 
                tick={{fontSize: 12}}
                label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5, fontSize: 12 }} 
              />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              />
              <Legend wrapperStyle={{paddingTop: '10px'}} />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Visitors" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{r: 3}}
                activeDot={{r: 5}}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;