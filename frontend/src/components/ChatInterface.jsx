import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post('http://localhost:8000/api/chat', { message: userMsg, history });
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: '⚠️ Connection error — ensure backend is running on port 8000.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card ai-panel">
      {/* Header */}
      <div className="ai-panel-header">
        <div className="ai-avatar">🤖</div>
        <div>
          <div className="ai-panel-title">AI Assistant</div>
          <div className="ai-panel-sub">Log interaction via chat</div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="typing-indicator">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="chat-footer">
        <input
          className="chat-input"
          type="text"
          placeholder="Describe interaction..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn-log" onClick={handleSend} disabled={loading}>
          ⚡ Log
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
