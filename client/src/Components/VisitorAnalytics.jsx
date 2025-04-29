import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
const RADIAN = Math.PI / 180;

const VisitorAnalytics = ({ data }) => {
  const [timeRange, setTimeRange] = useState('daily');
  const [metricView, setMetricView] = useState('overview');

  // Mock processed data (in a real implementation, process this from the actual data prop)
  // Calculate visitor metrics from the raw data
  const processData = () => {
    if (!data || data.length === 0) {
      return {
        visitorSegments: [],
        dwellTimeDistribution: [],
        trafficByHour: [],
        visitorTrends: [],
        engagementScores: []
      };
    }

    // Group data by device_id to count unique visitors
    const uniqueVisitors = [...new Set(data.map(item => item.device_id))];
    
    // Calculate dwell times for each visit
    const dwellTimes = data.map(item => {
      const inTime = new Date(item.in_time);
      const outTime = new Date(item.out_time);
      return {
        deviceId: item.device_id,
        dwellTimeMinutes: Math.round((outTime - inTime) / (1000 * 60)),
        timestamp: new Date(item.timestamp)
      };
    });

    // Segment visitors by dwell time
    const briefVisitors = dwellTimes.filter(v => v.dwellTimeMinutes < 5).length;
    const averageVisitors = dwellTimes.filter(v => v.dwellTimeMinutes >= 5 && v.dwellTimeMinutes < 15).length;
    const engagedVisitors = dwellTimes.filter(v => v.dwellTimeMinutes >= 15).length;

    // Group visits by hour
    const hourCounts = {};
    dwellTimes.forEach(visit => {
      const hour = visit.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Prepare data for charts
    const visitorSegments = [
      { name: 'Brief (<5min)', value: briefVisitors },
      { name: 'Average (5-15min)', value: averageVisitors },
      { name: 'Engaged (>15min)', value: engagedVisitors }
    ];

    // Create dwell time distribution
    const dwellDistribution = {};
    dwellTimes.forEach(visit => {
      // Round to nearest 5 minutes for binning
      const roundedTime = Math.floor(visit.dwellTimeMinutes / 5) * 5;
      const bin = `${roundedTime}-${roundedTime + 5}`;
      dwellDistribution[bin] = (dwellDistribution[bin] || 0) + 1;
    });

    const dwellTimeDistribution = Object.entries(dwellDistribution)
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => parseInt(a.range) - parseInt(b.range));

    // Traffic by hour
    const trafficByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      visitors: hourCounts[i] || 0
    }));

    // Generate visitor trend data (in a real implementation, this would use actual timestamps)
    const visitorTrends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visitors: Math.floor(Math.random() * 50) + 50,
        returning: Math.floor(Math.random() * 30) + 10
      };
    });

    // Generate engagement scores (in a real implementation, would be calculated from actual data)
    const engagementScores = Array.from({ length: 5 }, (_, i) => ({
      metric: ['Dwell Time', 'Return Rate', 'Proximity', 'Interaction','Overall Performance'][i],
      score: Math.floor(Math.random() * 40) + 60
    }));

    return {
      visitorSegments,
      dwellTimeDistribution,
      trafficByHour,
      visitorTrends,
      engagementScores,
      totalUniqueVisitors: uniqueVisitors.length,
      avgDwellTime: Math.round(dwellTimes.reduce((sum, item) => sum + item.dwellTimeMinutes, 0) / dwellTimes.length),
      peakHour: trafficByHour.reduce((max, hour) => hour.visitors > max.visitors ? hour : max, { visitors: 0 }).hour
    };
  };

  const {
    visitorSegments,
    dwellTimeDistribution,
    trafficByHour,
    visitorTrends,
    engagementScores,
    totalUniqueVisitors,
    avgDwellTime,
    peakHour
  } = processData();

  // Custom label for pie charts
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Styles consistent with the App.js
  const sectionStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    padding: '20px',
    marginBottom: '20px'
  };

  const filterRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const buttonGroupStyles = {
    display: 'flex',
    gap: '10px'
  };

  const buttonBaseStyles = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#edf2f7',
    color: '#4a5568'
  };

  const buttonActiveStyles = {
    backgroundColor: '#4299e1',
    color: 'white'
  };

  const gridContainerStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  };

  const metricCardStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '15px',
    textAlign: 'center'
  };

  const metricValueStyles = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '10px 0'
  };

  const metricLabelStyles = {
    fontSize: '14px',
    color: '#718096',
    marginBottom: '5px'
  };

  const chartTitleStyles = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '15px'
  };

  const emptyStateStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    fontSize: '16px',
    color: '#718096',
    textAlign: 'center',
    padding: '20px'
  };

  // Render empty state if no data
  if (!data || data.length === 0) {
    return (
      <div style={emptyStateStyles}>
        <div>
          <svg style={{ margin: '0 auto', display: 'block', width: '40px', height: '40px' }} viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ marginTop: '15px' }}>No visitor data available. Start tracking customers to see analytics here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={filterRowStyles}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Visitor Analytics</h2>
        <div style={buttonGroupStyles}>
          <div style={buttonGroupStyles}>
            <button
              style={timeRange === 'daily' ? {...buttonBaseStyles, ...buttonActiveStyles} : buttonBaseStyles}
              onClick={() => setTimeRange('daily')}
            >
              Daily
            </button>
            <button
              style={timeRange === 'weekly' ? {...buttonBaseStyles, ...buttonActiveStyles} : buttonBaseStyles}
              onClick={() => setTimeRange('weekly')}
            >
              Weekly
            </button>
            <button
              style={timeRange === 'monthly' ? {...buttonBaseStyles, ...buttonActiveStyles} : buttonBaseStyles}
              onClick={() => setTimeRange('monthly')}
            >
              Monthly
            </button>
          </div>
          <div style={{ width: '20px' }}></div>
          <div style={buttonGroupStyles}>
            <button
              style={metricView === 'overview' ? {...buttonBaseStyles, ...buttonActiveStyles} : buttonBaseStyles}
              onClick={() => setMetricView('overview')}
            >
              Overview
            </button>
            <button
              style={metricView === 'engagement' ? {...buttonBaseStyles, ...buttonActiveStyles} : buttonBaseStyles}
              onClick={() => setMetricView('engagement')}
            >
              Engagement
            </button>
            <button
              style={metricView === 'trends' ? {...buttonBaseStyles, ...buttonActiveStyles} : buttonBaseStyles}
              onClick={() => setMetricView('trends')}
            >
              Trends
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={gridContainerStyles}>
        <div style={metricCardStyles}>
          <div style={metricLabelStyles}>Unique Visitors</div>
          <div style={metricValueStyles}>{totalUniqueVisitors}</div>
        </div>
        <div style={metricCardStyles}>
          <div style={metricLabelStyles}>Average Dwell Time</div>
          <div style={metricValueStyles}>{avgDwellTime} min</div>
        </div>
        <div style={metricCardStyles}>
          <div style={metricLabelStyles}>Peak Hour</div>
          <div style={metricValueStyles}>{peakHour}:00</div>
        </div>
        <div style={metricCardStyles}>
          <div style={metricLabelStyles}>Return Rate</div>
          <div style={metricValueStyles}>24%</div>
        </div>
      </div>

      {metricView === 'overview' && (
        <>
          {/* Visitor Segments */}
          <div style={sectionStyles}>
            <h3 style={chartTitleStyles}>Visitor Segments by Dwell Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={visitorSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {visitorSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Dwell Time Distribution */}
          <div style={sectionStyles}>
            <h3 style={chartTitleStyles}>Dwell Time Distribution (minutes)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dwellTimeDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Visitors" fill="#4299e1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Traffic */}
          <div style={sectionStyles}>
            <h3 style={chartTitleStyles}>Hourly Traffic Pattern</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={trafficByHour}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                <YAxis />
                <Tooltip labelFormatter={(hour) => `Time: ${hour}:00`} />
                <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {metricView === 'engagement' && (
        <>
          {/* Engagement Scores */}
          <div style={sectionStyles}>
            <h3 style={chartTitleStyles}>Engagement Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={engagementScores}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="metric" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" name="Score" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Proximity Analysis */}
          <div style={sectionStyles}>
            <h3 style={chartTitleStyles}>Proximity Analysis (RSSI Values)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data.slice(0, 10)} // Just use a sample of the data
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device_id" tick={false} />
                <YAxis domain={[-100, 0]} />
                <Tooltip formatter={(value) => [`${value} dBm`, "RSSI"]} />
                <Legend />
                <Line type="monotone" dataKey="user_retention" name="RSSI Value" stroke="#FF8042" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {metricView === 'trends' && (
        <>
          {/* Visitor Trends */}
          <div style={sectionStyles}>
            <h3 style={chartTitleStyles}>Visitor Trends (7-Day)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={visitorTrends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="visitors" name="Total Visitors" stroke="#0088FE" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="returning" name="Returning Visitors" stroke="#00C49F" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distance Distribution */}
          <div style={sectionStyles}>
            <h3 style={chartTitleStyles}>Distance Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { range: "0-1m", count: 45 },
                  { range: "1-2m", count: 78 },
                  { range: "2-3m", count: 103 },
                  { range: "3-4m", count: 65 },
                  { range: "4-5m", count: 24 },
                  { range: ">5m", count: 12 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Visitor Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default VisitorAnalytics;