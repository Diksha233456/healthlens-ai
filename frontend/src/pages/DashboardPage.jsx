import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getReportStats, getAlerts, getWeeklyDigest, seedDemoData } from '../api';
import toast from 'react-hot-toast';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

function HealthScoreMini({ score }) {
    if (score == null) return null;
    const r = 36;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
            <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <circle
                    cx="45" cy="45" r={r} fill="none"
                    stroke={color} strokeWidth="7"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Space Grotesk', color, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>/ 100</div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [digest, setDigest] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        Promise.all([getReportStats(), getAlerts(), getWeeklyDigest()])
            .then(([statsRes, alertsRes, digestRes]) => {
                setStats(statsRes.data);
                setAlerts(alertsRes.data.alerts?.slice(0, 4) || []);
                setDigest(digestRes.data.digest);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSeed = async () => {
        try {
            toast.loading('Seeding sample lab reports...', { id: 'seed' });
            await seedDemoData();
            toast.success('Sample data added successfully!', { id: 'seed' });
            loadData(); // Reload dashboard
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to seed data', { id: 'seed' });
        }
    };

    const getHour = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const trendStyle = (t) => {
        if (t === 'rising') return 'trend-up';
        if (t === 'falling') return 'trend-down';
        return 'trend-stable';
    };

    const trendLabel = (t) => {
        if (t === 'rising') return '↑ Rising';
        if (t === 'falling') return '↓ Falling';
        return '→ Stable';
    };

    const latestStats = [
        { label: 'Glucose', field: 'glucose', unit: 'mg/dL', icon: '🩸', color: '#00d4ff' },
        { label: 'LDL', field: 'ldl', unit: 'mg/dL', icon: '💉', color: '#ef4444' },
        { label: 'HDL', field: 'hdl', unit: 'mg/dL', icon: '💚', color: '#10b981' },
        { label: 'Hemoglobin', field: 'hemoglobin', unit: 'g/dL', icon: '🔴', color: '#f59e0b' },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1>{getHour()}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}! 👋</span></h1>
                        <p>Here's your health intelligence overview for today.</p>
                    </div>
                    <Link to="/reports" className="btn btn-primary">+ Add Lab Report</Link>
                </div>
            </motion.div>

            {loading ? (
                <div className="loading-overlay"><div className="spinner" /></div>
            ) : (
                <>
                    {/* Health Score + AI Insight Banner */}
                    {digest && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="glass-panel-heavy animate-fade-in-up"
                            style={{
                                display: 'flex', gap: '24px', alignItems: 'center',
                                border: '1px solid rgba(0,212,255,0.2)', borderRadius: '24px',
                                padding: '28px 32px', marginBottom: '32px', flexWrap: 'wrap',
                                position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--gradient-brand)' }} />
                            {digest.healthScore != null && <HealthScoreMini score={digest.healthScore} />}
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div className="text-glow" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
                                    🧠 AI Health Insight
                                </div>
                                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0, fontWeight: 400 }}>
                                    {digest.insight || digest.tip}
                                </p>
                            </div>
                            <Link to="/profile" className="btn btn-primary" style={{ alignSelf: 'center', fontSize: '0.85rem', padding: '10px 20px', borderRadius: '50px' }}>
                                Full Bio-Analysis →
                            </Link>
                        </motion.div>
                    )}

                    {/* No report CTA */}
                    {!stats?.latest && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '20px', padding: '48px', textAlign: 'center', marginBottom: '32px' }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🧪</div>
                            <h3 style={{ marginBottom: '8px' }}>Add Your First Lab Report</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Upload your blood test results to unlock AI risk prediction, trend analysis, and smart alerts.</p>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <Link to="/reports" className="btn btn-primary">Add Lab Report Now →</Link>
                                <button onClick={handleSeed} className="btn btn-secondary">Load Demo Data 🧪</button>
                            </div>
                        </motion.div>
                    )}

                    {/* Key Metrics */}
                    {stats?.latest && (
                        <div className="grid grid-4" style={{ marginBottom: '32px' }}>
                            {latestStats.map((s, i) => (
                                <div key={s.field} className={`glass-panel animate-fade-in-up delay-${(i + 1) * 100} hover-scale`} style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: s.color, opacity: 0.3 }} />
                                    <div className="stat-card-icon" style={{ background: `${s.color}20`, color: s.color, fontSize: '1.3rem' }}>{s.icon}</div>
                                    <div className="stat-card-value" style={{ color: s.color }}>
                                        {stats.latest[s.field] ?? '—'}
                                    </div>
                                    <div className="stat-card-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.label} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{s.unit}</span></div>
                                    {stats.trends?.[s.field] && (
                                        <span className={`badge ${stats.trends[s.field] === 'falling' ? 'badge-green' : stats.trends[s.field] === 'rising' ? 'badge-red' : 'badge-orange'}`} style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '0.65rem' }}>
                                            {trendLabel(stats.trends[s.field])}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reports count + Alerts summary */}
                    <div className="grid grid-2" style={{ marginBottom: '28px' }}>
                        {/* Reports Overview */}
                        <motion.div variants={cardVariants} custom={4} initial="hidden" animate="visible" className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '1rem' }}>📊 Reports Summary</h3>
                                <Link to="/trends" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>View Trends →</Link>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Space Grotesk', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stats?.count || 0}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Reports</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: 'var(--red)' }}>{alerts.filter(a => a.severity === 'critical').length}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Critical Alerts</div>
                                </div>
                            </div>
                            {stats?.latest && (
                                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-card)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    📅 Latest report: {new Date(stats.latest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            )}
                        </motion.div>

                        {/* Quick Alerts */}
                        <motion.div variants={cardVariants} custom={5} initial="hidden" animate="visible" className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '1rem' }}>🔔 Active Alerts</h3>
                                <Link to="/alerts" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>See All →</Link>
                            </div>
                            {alerts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    ✅ No active alerts. Your biomarkers look fine!
                                </div>
                            ) : (
                                alerts.map((alert, i) => (
                                    <div key={i} className={`alert-item alert-${alert.isTrend ? 'trend' : alert.severity}`}>
                                        <span className="alert-icon">{alert.severity === 'critical' ? '🔴' : alert.isTrend ? '📈' : '⚠️'}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{alert.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{alert.message}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <div className="animate-fade-in-up delay-400">
                        <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '20px' }}>⚡ Proactive Tools</h3>
                        <div className="grid grid-4">
                            {[
                                { to: '/scan', icon: '📸', label: 'Facial AI Scan', desc: 'Scan vitals via camera', color: 'var(--cyan)', border: true },
                                { to: '/predict', icon: '🧠', label: 'Predict Risk', desc: 'Deep biomarker analysis', color: 'var(--purple)' },
                                { to: '/chat', icon: '💬', label: 'AI Health Doc', desc: 'Speak to your assistant', color: '#10b981' },
                                { to: '/simulate', icon: '⚡', label: 'Impact Sim', desc: 'Lifestyle variables', color: '#f59e0b' },
                            ].map((action) => (
                                <Link key={action.to} to={action.to} style={{ textDecoration: 'none' }}>
                                    <div className={`glass-panel hover-scale ${action.border ? 'neon-border' : ''}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                                        <span style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{action.icon}</span>
                                        <div className="text-glow" style={{ fontWeight: 800, fontSize: '1.05rem', color: action.color }}>{action.label}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{action.desc}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
