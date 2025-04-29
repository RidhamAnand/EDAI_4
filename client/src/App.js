import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useWebSocket from "./hooks/useWebSocket";
import Dashboard from './Components/Dashboard';
import BoothComparison from './Components/BoothComparison';
import VisitorAnalytics from './Components/VisitorAnalytics';
import ExecutiveChatbot from './ExecutiveChatbot';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');

  // Function to fetch data from the API using Axios
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://192.168.109.24:5000/api/data');
      setData(response.data || []); // Ensure data is an array even if response is empty
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Use WebSocket to listen for data updates
  useWebSocket('http://127.0.0.1:5000', fetchData);

  // Fetch initial data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Styles
  const appStyles = {
    fontFamily: 'Inter, Arial, sans-serif',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f7fa',
    color: '#2d3748'
  };

  const headerStyles = {
    backgroundColor: '#ffffff',
    padding: '15px 20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  };

  const headerContentStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    flexWrap: 'wrap',
    gap: '15px'
  };

  const titleStyles = {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#2c3e50',
    padding: '0 10px'
  };

  const navStyles = {
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

  const mainStyles = {
    flex: 1,
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  };

  const footerStyles = {
    backgroundColor: '#ffffff',
    padding: '15px 20px',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center',
    fontSize: '14px',
    color: '#718096'
  };

  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    fontSize: '18px',
    color: '#4a5568'
  };

  const errorStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    backgroundColor: '#fff5f5',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    fontSize: '18px',
    color: '#e53e3e',
    padding: '20px',
    textAlign: 'center'
  };

  // Render different views based on activeView state
  const renderView = () => {
    if (loading) {
      return <div style={loadingStyles}>
        <div>
          <svg style={{ margin: '0 auto', display: 'block', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24">
            <path fill="#4299e1" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
              <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite" />
            </path>
          </svg>
          <p style={{ marginTop: '15px' }}>Loading exhibition data...</p>
        </div>
      </div>;
    }
    
    if (error) {
      return <div style={errorStyles}>
        <div>
          <svg style={{ margin: '0 auto', display: 'block', width: '40px', height: '40px' }} viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ marginTop: '15px' }}>{error}</p>
          <button 
            style={{ 
              marginTop: '15px', 
              padding: '8px 16px', 
              backgroundColor: '#4299e1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={fetchData}
          >
            Try Again
          </button>
        </div>
      </div>;
    }
    
    switch (activeView) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'comparison':
        return <BoothComparison data={data} />;
      case 'visitors':
        return (
         <VisitorAnalytics data={data} />
        );
      case 'chatbot':
        return (
          <ExecutiveChatbot/>
        )
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <div style={appStyles}>
      <header style={headerStyles}>
        <div style={headerContentStyles}>
          <h1 style={titleStyles}>Exhibition Analytics</h1>
          <nav style={navStyles}>
            <button 
              style={activeView === 'dashboard' ? {...buttonBaseStyles, ...buttonActiveStyles} : buttonBaseStyles}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
            <button 
              style={activeView === 'comparison' ? {...buttonBaseStyles, ...buttonActiveStyles} : buttonBaseStyles}
              onClick={() => setActiveView('comparison')}
            >
              Booth Comparison
            </button>
            <button 
              style={activeView === 'visitors' ? {...buttonBaseStyles, ...buttonActiveStyles} : buttonBaseStyles}
              onClick={() => setActiveView('visitors')}
            >
              Visitor Analytics
            </button>
            <button 
              style={activeView === 'chatbot' ? {...buttonBaseStyles, ...buttonActiveStyles} : buttonBaseStyles}
              onClick={() => setActiveView('chatbot')}
            >
             ChatBot
            </button>
          </nav>
        </div>
      </header>
      
      <main style={mainStyles}>
        {renderView()}
      </main>
      
      <footer style={footerStyles}>
        <p>Exhibition Analytics System • Last updated: {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}

export default App;