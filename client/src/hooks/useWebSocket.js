import { useEffect } from 'react';

const useWebSocket = (url, onDataReceived) => {

  console.log("Attempting for WS");
  

  useEffect(() => {
    // Create a WebSocket connection
    const ws = new WebSocket(url);
    
    // Event listener for when the connection is established
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    // Event listener for when a message is received
    ws.onmessage = () => {
      // Trigger the callback to fetch fresh data
      onDataReceived();
    };
    
    // Event listener for when an error occurs
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    // Event listener for when the connection is closed
    
  
    
    // Clean up the WebSocket connection when the component unmounts
    return () => {
      ws.close();
    };
  }, [url, onDataReceived]);
};

export default useWebSocket;