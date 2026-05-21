import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import './Chatbot.css';

const QUICK_QUESTIONS = [
  'How to apply?',
  'Required documents',
  'Check eligibility',
  'Deadline reminders',
  'Government scholarships',
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! 👋 I'm your Scholarship Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/message', { message: msg });
      setMessages((prev) => [...prev, { from: 'bot', text: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { from: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Voice input support
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open scholarship assistant"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && <span className="chatbot-toggle-label">Ask AI</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window" role="dialog" aria-label="Scholarship Assistant">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-avatar">🎓</div>
            <div>
              <div className="chatbot-name">Scholarship Assistant</div>
              <div className="chatbot-status">● Online</div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">✕</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.from}`}>
                {msg.from === 'bot' && <div className="bot-icon">🎓</div>}
                <div className="message-bubble">
                  {msg.text.split('\n').map((line, j) => (
                    <React.Fragment key={j}>{line}{j < msg.text.split('\n').length - 1 && <br />}</React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">
                <div className="bot-icon">🎓</div>
                <div className="message-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="quick-questions">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} className="quick-q-btn" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <textarea
              className="chatbot-input"
              placeholder="Ask about scholarships..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              aria-label="Type your message"
            />
            <button className="chatbot-voice-btn" onClick={handleVoiceInput} aria-label="Voice input" title="Voice input">
              🎤
            </button>
            <button className="chatbot-send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading} aria-label="Send message">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
