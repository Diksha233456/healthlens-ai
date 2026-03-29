import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { getReports } from '../api';
import { Link } from 'react-router-dom';

const METRIC_GROUPS = [
    { label: 'Blood Sugar', color: '#00d4ff', key: 'glucose', unit: 'mg/dL', normalMin: 70, normalMax: 99, refLine: 99 },
    { label: 'Cholesterol', color: '#ef4444', key: 'cholesterol', unit: 'mg/dL', refLine: 200 },
    { label: 'LDL', color: '#f97316', key: 'ldl', unit: 'mg/dL', refLine: 100 },
    { label: 'HDL', color: '#10b981', key: 'hdl', unit: 'mg/dL', refLine: 40 },
    { label: 'Triglycerides', color: '#a855f7', key: 'triglycerides', unit: 'mg/dL', refLine: 150 },
    { label: 'Hemoglobin', color: '#f59e0b', key: 'hemoglobin', unit: 'g/dL', refLine: 12 },
    { label: 'Systolic BP', color: '#ec4899', key: 'systolicBP', unit: 'mmHg', refLine: 120 },
    { label: 'BMI', color: '#22d3ee', key: 'bmi', unit: '', refLine: 25 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(13,13,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</div>
            {payload.map((entry) => (
                <div key={entry.name} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
                    <span style={{ fontWeight: 700, color: entry.color }}>{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function TrendsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMetrics, setSelectedMetrics] = useState(['glucose', 'cholesterol', 'ldl']);

    useEffect(() => {
        getReports()
            .then(res => setReports(res.data.slice().reverse())) // oldest first for charting
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const chartData = reports.map((r) => ({
        date: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        ...METRIC_GROUPS.reduce((acc, m) => ({ ...acc, [m.key]: r[m.key] || null }), {}),
    }));

    const toggleMetric = (key) => {
        setSelectedMetrics(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const getLatestTrend = (key) => {
        if (reports.length < 2) return null;
        const latest = reports[reports.length - 1][key];
        const prev = reports[reports.length - 2][key];
        if (!latest || !prev) return null;
        const diff = latest - prev;
        const pct = Math.abs(((diff / prev) * 100)).toFixed(1);
        return { diff, pct, direction: diff > 0 ? 'up' : 'down' };
    };

    if (loading) return <div className="page-container"><div className="loading-overlay"><div className="spinner" /></div></div>;

    if (reports.length < 2) return (
        <div className="page-container">
            <div className="page-header"><h1>📈 Health Trends</h1><p>Track how your biomarkers change over time</p></div>
            <div className="empty-state">
                <div className="empty-state-icon">📈</div>
                <div className="empty-state-title">Not Enough Data Yet</div>
                <div className="empty-state-desc">You need at least 2 lab reports to see trends. Add more reports over time.</div>
                <Link to="/reports" className="btn btn-primary">Add Reports →</Link>
            </div>
        </div>
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>📈 Health Trends</h1>
                <p>Track how your biomarkers change over time ({reports.length} reports)</p>
            </div>

            {/* Metric Selector */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
                <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Select metrics to display:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {METRIC_GROUPS.map(m => (
                        <button
                            key={m.key}
                            onClick={() => toggleMetric(m.key)}
                            style={{
                                padding: '8px 16px', borderRadius: '50px', border: `1.5px solid ${selectedMetrics.includes(m.key) ? m.color : 'rgba(255,255,255,0.08)'}`,
                                background: selectedMetrics.includes(m.key) ? `${m.color}18` : 'transparent',
                                color: selectedMetrics.includes(m.key) ? m.color : 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Main Multi-Line Chart */}
            <motion.div className="chart-container" style={{ marginBottom: '28px', padding: '28px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="chart-title" style={{ marginBottom: '24px' }}>Biomarker Trends Over Time</div>
                <ResponsiveContainer width="100%" height={380}>
                    <LineChart data={chartData}>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }} />
                        {METRIC_GROUPS.filter(m => selectedMetrics.includes(m.key)).map(m => (
                            <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2.5}
                                name={`${m.label} (${m.unit})`} dot={{ r: 5, fill: m.color }} activeDot={{ r: 8 }}
                                connectNulls={false} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Per-Metric Cards */}
            <div className="grid grid-4" style={{ marginBottom: '24px' }}>
                {METRIC_GROUPS.filter(m => selectedMetrics.includes(m.key)).map((m, i) => {
                    const latest = reports[reports.length - 1][m.key];
                    const trend = getLatestTrend(m.key);
                    return (
                        <motion.div key={m.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            style={{ background: 'var(--bg-card)', border: `1px solid ${m.color}30`, borderRadius: '14px', padding: '18px' }}>
                            <div style={{ fontSize: '0.75rem', color: m.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{m.label}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: latest ? m.color : 'var(--text-muted)' }}>{latest ?? '—'} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>{m.unit}</span></div>
                            {trend && (
                                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: trend.direction === 'up' ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                                    {trend.direction === 'up' ? '↑' : '↓'} {trend.pct}% from last report
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Individual Area Charts for top metrics */}
            <div className="grid grid-2">
                {METRIC_GROUPS.filter(m => selectedMetrics.includes(m.key)).slice(0, 4).map((m, i) => (
                    <motion.div key={m.key} className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="chart-title">{m.label} {m.unit && `(${m.unit})`}</div>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={m.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={m.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} fill={`url(#grad-${m.key})`} dot={{ r: 4, fill: m.color }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
