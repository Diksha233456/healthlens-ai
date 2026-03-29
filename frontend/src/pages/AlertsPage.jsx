import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAlerts } from '../api';
import { Link } from 'react-router-dom';

const SEVERITY_CONFIG = {
    critical: { label: 'Critical', icon: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
    warning: { label: 'Warning', icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
    trend: { label: 'Trend', icon: '📈', color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)' },
};

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [dismissed, setDismissed] = useState(new Set());

    useEffect(() => {
        getAlerts()
            .then(res => {
                setAlerts(res.data.alerts || []);
                setMeta({
                    reportDate: res.data.reportDate,
                    totalAlerts: res.data.totalAlerts,
                    criticalCount: res.data.criticalCount,
                    trendCount: res.data.trendCount,
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const visibleAlerts = alerts.filter(a => {
        if (dismissed.has(a.field + a.severity)) return false;
        if (filter === 'all') return true;
        if (filter === 'critical') return a.severity === 'critical';
        if (filter === 'trend') return a.isTrend;
        if (filter === 'warning') return a.severity === 'warning' && !a.isTrend;
        return true;
    });

    const dismiss = (alert) => setDismissed(prev => new Set([...prev, alert.field + alert.severity]));

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🔔 Smart Alerts</h1>
                <p>Rule-based & trend-based health alerts from your lab reports</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-3" style={{ marginBottom: '28px' }}>
                {[
                    { label: 'Total Alerts', value: meta.totalAlerts || 0, color: 'var(--cyan)', icon: '🔔' },
                    { label: 'Critical', value: meta.criticalCount || 0, color: 'var(--red)', icon: '🔴' },
                    { label: 'Trend Alerts', value: meta.trendCount || 0, color: '#a855f7', icon: '📈' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        style={{ padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: '📋 All Alerts' },
                    { key: 'critical', label: '🔴 Critical' },
                    { key: 'trend', label: '📈 Trends' },
                    { key: 'warning', label: '⚠️ Warnings' },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        style={{
                            padding: '8px 18px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600,
                            border: `1.5px solid ${filter === key ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`,
                            background: filter === key ? 'rgba(0,212,255,0.1)' : 'transparent',
                            color: filter === key ? 'var(--cyan)' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                        }}
                    >{label}</button>
                ))}
            </div>

            {loading ? (
                <div className="loading-overlay"><div className="spinner" /></div>
            ) : alerts.length === 0 ? (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
                    <h3>All Clear!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>No alerts detected from your latest lab report. Keep it up!</p>
                    <Link to="/reports" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>Add New Report</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <AnimatePresence>
                        {visibleAlerts.map((alert, i) => {
                            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.warning;
                            return (
                                <motion.div
                                    key={`${alert.field}-${alert.severity}-${i}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    style={{
                                        padding: '20px 24px', borderRadius: '16px',
                                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                                        display: 'flex', gap: '16px', alignItems: 'flex-start',
                                    }}
                                >
                                    <span style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: '2px' }}>{cfg.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{alert.label}</span>
                                                <span style={{
                                                    fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '50px',
                                                    background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}30`,
                                                    textTransform: 'uppercase', letterSpacing: '0.05em'
                                                }}>{alert.isTrend ? 'TREND' : cfg.label}</span>
                                            </div>
                                            <button
                                                onClick={() => dismiss(alert)}
                                                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px 8px' }}
                                            >✕ Dismiss</button>
                                        </div>
                                        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.5' }}>{alert.message}</div>

                                        {/* Trend visualization */}
                                        {alert.isTrend && alert.trendValues && (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 3 reports:</span>
                                                {[...alert.trendValues].reverse().map((v, ti) => (
                                                    <span key={ti} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cfg.color }}>{v}</span>
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{['2 ago', '1 ago', 'latest'][ti]}</span>
                                                    </span>
                                                ))}
                                                <span style={{ fontSize: '1.1rem', color: cfg.color, marginLeft: '4px' }}>
                                                    {alert.type === 'trend' ? '→' : ''}
                                                </span>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {alert.value != null && !alert.isTrend && (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    Current value: <strong style={{ color: cfg.color }}>{alert.value} {alert.unit}</strong>
                                                </span>
                                            )}
                                            {alert.reportDate && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    • From: {new Date(alert.reportDate).toLocaleDateString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {visibleAlerts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            No alerts match the current filter.
                        </div>
                    )}
                </div>
            )}

            {meta.reportDate && (
                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Alerts based on report from {new Date(meta.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            )}
        </div>
    );
}
