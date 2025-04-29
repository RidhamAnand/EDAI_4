import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ExecutiveChatbot = ({ data }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'system', 
      content: 'Hello! I can help you analyze visitor data. Ask me about metrics, trends, or specific insights.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '') return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call your LangGraph backend
      const response = await axios.post('/api/chat', { 
        message: input,
        history: messages.filter(m => m.role !== 'system'),
        // Pass any context needed for the chatbot
        context: {
          totalVisitors: data.length,
          uniqueVisitors: new Set(data.map(item => item.device_id)).size,
          dateRange: {
            start: data.length > 0 ? data[0].timestamp : null,
            end: data.length > 0 ? data[data.length - 1].timestamp : null
          }
        }
      });
      
      const assistantMessage = { role: 'assistant', content: response.data.response };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again.' 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Styles consistent with your app
  const chatContainerStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    padding: '20px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '500px'
  };

  const messagesContainerStyles = {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '15px',
    padding: '10px'
  };

  const inputContainerStyles = {
    display: 'flex',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '15px'
  };

  const inputStyles = {
    flex: 1,
    padding: '10px 15px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none'
  };

  const buttonStyles = {
    padding: '10px 15px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    marginLeft: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const messageStyles = {
    padding: '10px 15px',
    borderRadius: '6px',
    maxWidth: '80%',
    marginBottom: '10px',
    wordBreak: 'break-word'
  };

  const userMessageStyles = {
    ...messageStyles,
    backgroundColor: '#4299e1',
    color: 'white',
    marginLeft: 'auto'
  };

  const assistantMessageStyles = {
    ...messageStyles,
    backgroundColor: '#edf2f7',
    color: '#2d3748'
  };

  const loadingDotsStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: '10px'
  };

  return (
    <div style={chatContainerStyles}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
        Executive Analytics Assistant
      </h3>
      <div style={messagesContainerStyles}>
        {messages.filter(m => m.role !== 'system').map((msg, index) => (
          <div 
            key={index} 
            style={msg.role === 'user' ? userMessageStyles : assistantMessageStyles}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div style={assistantMessageStyles}>
            <div style={loadingDotsStyles}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#718096',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: '0s'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#718096',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: '0.2s'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#718096',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: '0.4s'
              }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={inputContainerStyles}>
        <input
          style={inputStyles}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about visitor metrics, trends, or insights..."
          disabled={isLoading}
        />
        <button 
          style={buttonStyles} 
          onClick={sendMessage}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ExecutiveChatbot;