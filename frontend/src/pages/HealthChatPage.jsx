import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { healthChat } from '../api';
import { useAuth } from '../context/AuthContext';

const QUICK_QUESTIONS = [
    "What does my glucose level mean?",
    "Is my LDL cholesterol dangerous?",
    "How can I improve my HDL?",
    "What lifestyle changes will help most?",
    "Explain my HbA1c result",
    "What foods should I avoid?",
];

export default function HealthChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI Health Assistant. I can answer questions about your biomarkers, explain what your lab results mean, and give personalized health advice based on your data. What would you like to know today?`,
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text = input) => {
        if (!text.trim() || loading) return;
        const userMessage = text.trim();
        setInput('');

        const newMessages = [...messages, { role: 'user', content: userMessage, timestamp: new Date() }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const history = newMessages.slice(1).slice(-8).map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await healthChat({ message: userMessage, history });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.data.reply,
                timestamp: new Date(),
            }]);
        } catch (err) {
            toast.error('Chat failed. Check your Groq API key.');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
                isError: true,
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="page-container" style={{ maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '20px' }}>
                <h1>💬 AI Health Chat</h1>
                <p>Ask questions about your biomarkers, get personalized health advice</p>
            </div>

            {/* Quick Questions */}
            <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {QUICK_QUESTIONS.map((q, i) => (
                    <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        disabled={loading}
                        style={{
                            padding: '7px 14px', borderRadius: '50px', border: '1px solid rgba(0,212,255,0.2)',
                            background: 'rgba(0,212,255,0.05)', color: 'var(--cyan)', cursor: 'pointer',
                            fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.2s',
                            opacity: loading ? 0.5 : 1,
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(0,212,255,0.12)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(0,212,255,0.05)'}
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Chat Window */}
            <div style={{
                flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '20px', display: 'flex', flexDirection: 'column',
                minHeight: '400px', maxHeight: 'calc(100vh - 300px)',
            }}>
                {/* Messages */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '24px',
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    scrollbarWidth: 'thin',
                }}>
                    <AnimatePresence>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    display: 'flex',
                                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                    gap: '12px',
                                    alignItems: 'flex-start',
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: msg.role === 'user'
                                        ? 'var(--gradient-brand)'
                                        : 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))',
                                    border: msg.role === 'assistant' ? '1px solid rgba(0,212,255,0.3)' : 'none',
                                    fontSize: msg.role === 'user' ? '0.9rem' : '1.1rem',
                                    color: 'white', fontWeight: 700,
                                }}>
                                    {msg.role === 'user' ? (user?.name?.[0]?.toUpperCase() || 'U') : '🩺'}
                                </div>

                                {/* Bubble */}
                                <div style={{
                                    maxWidth: '70%',
                                    padding: '14px 18px',
                                    borderRadius: msg.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))'
                                        : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                                    fontSize: '0.9rem',
                                    lineHeight: '1.65',
                                    color: msg.isError ? 'var(--red)' : 'var(--text-primary)',
                                }}>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                        {formatTime(msg.timestamp)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                            >
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))',
                                    border: '1px solid rgba(0,212,255,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                                }}>🩺</div>
                                <div style={{
                                    padding: '14px 18px', borderRadius: '4px 20px 20px 20px',
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                                }}>
                                    <div className="typing-indicator">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{
                    padding: '16px 20px', borderTop: '1px solid var(--border-color)',
                    display: 'flex', gap: '12px', alignItems: 'flex-end',
                }}>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your health, biomarkers, or lab results... (Enter to send)"
                        disabled={loading}
                        rows={1}
                        style={{
                            flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)',
                            fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', outline: 'none',
                            resize: 'none', overflowY: 'auto', maxHeight: '120px',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="btn btn-primary"
                        style={{ padding: '12px 20px', flexShrink: 0 }}
                        id="chat-send-btn"
                    >
                        {loading ? <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : '⬆'}
                    </button>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ⚠️ AI health advice is for informational purposes only. Always consult a qualified doctor for medical decisions.
            </div>
        </div>
    );
}
