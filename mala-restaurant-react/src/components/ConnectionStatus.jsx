import React, { useState, useEffect } from 'react';
import { API_BASE } from '../services/api';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState(null);

  const checkConnection = async () => {
    console.log('🔍 ConnectionStatus: Starting connection check...');
    setStatus('checking');
    
    try {
      console.log('🔗 Testing connection to:', `${API_BASE}/api/health`);
      
      const startTime = Date.now();
      const response = await fetch(`${API_BASE}/api/health`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log('📊 Connection test results:');
      console.log('  Response time:', responseTime + 'ms');
      console.log('  Status:', response.status);
      console.log('  Status text:', response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend is responding:', data);
        
        setStatus('connected');
        setDetails({
          responseTime,
          serverData: data,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        console.warn('⚠️ Backend responded with error:', response.status);
        setStatus('error');
        setDetails({
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      console.error('❌ Connection failed:', error);
      setStatus('failed');
      setDetails({
        error: error.message,
        timestamp: new Date().toLocaleTimeString(),
        possibleCauses: [
          'Backend server is not running',
          'CORS policy blocking the request',
          'Wrong URL or port configuration',
          'Network connectivity issues'
        ]
      });
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#28a745';
      case 'checking': return '#ffc107';
      case 'error': return '#fd7e14';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '✅ Connected';
      case 'checking': return '🔄 Checking...';
      case 'error': return '⚠️ Error';
      case 'failed': return '❌ Failed';
      default: return '❓ Unknown';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '10px',
      backgroundColor: 'white',
      border: '2px solid ' + getStatusColor(),
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '300px',
      fontSize: '14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          marginRight: '8px'
        }}></div>
        <strong>Backend Status: {getStatusText()}</strong>
        <button 
          onClick={checkConnection}
          style={{
            marginLeft: 'auto',
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#f8f9fa',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>
      
      <div style={{ fontSize: '12px', color: '#666' }}>
        <div>API Base: {API_BASE}</div>
        {details && (
          <>
            <div>Last Check: {details.timestamp}</div>
            {details.responseTime && <div>Response Time: {details.responseTime}ms</div>}
            {details.serverData && (
              <div>Server: {details.serverData.message || 'OK'}</div>
            )}
            {details.error && (
              <div style={{ color: '#dc3545', marginTop: '8px' }}>
                <strong>Error:</strong> {details.error}
              </div>
            )}
            {details.possibleCauses && (
              <div style={{ marginTop: '8px' }}>
                <strong>Possible causes:</strong>
                <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                  {details.possibleCauses.map((cause, idx) => (
                    <li key={idx}>{cause}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
