import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { predictRisk, getExplainableAI, getReports } from '../api';
import { useAuth } from '../context/AuthContext';

const getRiskColor = (score) => {
    if (score < 25) return '#10b981';
    if (score < 50) return '#f59e0b';
    if (score < 75) return '#ef4444';
    return '#ff0040';
};

const getRiskLabel = (score) => {
    if (score < 25) return { label: 'Low Risk', class: 'risk-low' };
    if (score < 50) return { label: 'Moderate Risk', class: 'risk-moderate' };
    if (score < 75) return { label: 'High Risk', class: 'risk-high' };
    return { label: 'Critical Risk', class: 'risk-critical' };
};

export default function PredictPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [explainLoading, setExplainLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [explainability, setExplainability] = useState(null);
    const [riskType, setRiskType] = useState('heart');
    const [latestReport, setLatestReport] = useState(null);
    const [lifestyle, setLifestyle] = useState({
        smokingStatus: user?.smokingStatus || 'never',
        exerciseLevel: user?.exerciseLevel || 'sedentary',
        dietType: user?.dietType || 'average',
    });

    useEffect(() => {
        getReports().then(res => {
            if (res.data.length > 0) setLatestReport(res.data[0]);
        }).catch(console.error);
    }, []);

    const handlePredict = async () => {
        if (!latestReport) return toast.error('Add a lab report first to get risk prediction!');
        setLoading(true);
        try {
            const res = await predictRisk({
                biomarkers: latestReport,
                lifestyle: { ...lifestyle, age: user?.age, gender: user?.gender },
            });
            setPrediction(res.data.prediction);
            toast.success('Risk analysis complete! 🧠');
        } catch (err) {
            const msg = err.response?.data?.error || 'Prediction failed';
            toast.error(msg.includes('GROQ_API_KEY') ? '⚠️ Add your Groq API key to backend .env file first!' : msg);
        } finally {
            setLoading(false);
        }
    };

    const handleExplain = async () => {
        if (!latestReport) return toast.error('Add a lab report first!');
        setExplainLoading(true);
        try {
            const res = await getExplainableAI({ biomarkers: latestReport, riskType });
            setExplainability(res.data.explainability);
            toast.success('Explainability analysis done! 💡');
        } catch (err) {
            toast.error('Explainability failed. Check your Groq API key.');
        } finally {
            setExplainLoading(false);
        }
    };

    const radarData = prediction ? [
        { subject: 'Heart Risk', A: prediction.heartRisk },
        { subject: 'Diabetes', A: prediction.diabetesRisk },
        { subject: 'Kidney', A: prediction.kidneyRisk },
        { subject: 'Stroke', A: prediction.strokeRisk },
    ] : [];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🧠 AI Risk Prediction</h1>
                <p>Get AI-powered disease risk assessment from your biomarkers</p>
            </div>

            <div className="grid grid-2" style={{ marginBottom: '28px', alignItems: 'start' }}>
                {/* Left: Controls */}
                <div>
                    {/* Latest Report Preview */}
                    <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>📊 Data Source</h3>
                        {latestReport ? (
                            <>
                                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '10px', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 600, marginBottom: '8px' }}>
                                        Latest Report: {new Date(latestReport.date).toLocaleDateString('en-IN')}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                        {[['Glucose', latestReport.glucose, 'mg/dL'], ['LDL', latestReport.ldl, 'mg/dL'], ['HDL', latestReport.hdl, 'mg/dL'], ['HbA1c', latestReport.hba1c, '%']].filter(([, v]) => v).map(([k, v, u]) => (
                                            <div key={k} style={{ fontSize: '0.82rem' }}><span style={{ color: 'var(--text-muted)' }}>{k}: </span><strong>{v} {u}</strong></div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>✓ Using latest report data for analysis</div>
                            </>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>⚠️ No reports found. <a href="/reports" style={{ color: 'var(--cyan)' }}>Add a report first.</a></div>
                        )}
                    </div>

                    {/* Lifestyle Inputs */}
                    <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>🏃 Lifestyle Factors</h3>
                        <div className="form-group">
                            <label className="form-label">Smoking Status</label>
                            <select className="form-select" value={lifestyle.smokingStatus} onChange={(e) => setLifestyle({ ...lifestyle, smokingStatus: e.target.value })}>
                                <option value="never">Never Smoked</option>
                                <option value="former">Former Smoker</option>
                                <option value="current">Current Smoker</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Exercise Level</label>
                            <select className="form-select" value={lifestyle.exerciseLevel} onChange={(e) => setLifestyle({ ...lifestyle, exerciseLevel: e.target.value })}>
                                <option value="sedentary">Sedentary (no exercise)</option>
                                <option value="light">Light (1-2x/week)</option>
                                <option value="moderate">Moderate (3-4x/week)</option>
                                <option value="active">Active (5+ x/week)</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Diet Quality</label>
                            <select className="form-select" value={lifestyle.dietType} onChange={(e) => setLifestyle({ ...lifestyle, dietType: e.target.value })}>
                                <option value="poor">Poor (fast food, processed)</option>
                                <option value="average">Average (mixed diet)</option>
                                <option value="good">Good (balanced diet)</option>
                                <option value="excellent">Excellent (whole foods)</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn btn-primary" onClick={handlePredict} disabled={loading || !latestReport} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }} id="predict-btn">
                        {loading ? <><span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> Analyzing...</> : '🧠 Run AI Risk Analysis'}
                    </button>
                </div>

                {/* Right: Results */}
                <div>
                    {prediction ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            {/* Risk Gauges */}
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
                                <h3 style={{ marginBottom: '24px', fontSize: '1rem' }}>🎯 Risk Scores</h3>
                                <div className="grid grid-2" style={{ gap: '16px', marginBottom: '24px' }}>
                                    {[
                                        { label: 'Heart Disease', score: prediction.heartRisk, icon: '❤️' },
                                        { label: 'Diabetes', score: prediction.diabetesRisk, icon: '💉' },
                                        { label: 'Kidney Disease', score: prediction.kidneyRisk, icon: '🫘' },
                                        { label: 'Stroke', score: prediction.strokeRisk, icon: '🧠' },
                                    ].map(({ label, score, icon }) => {
                                        const { class: cls } = getRiskLabel(score || 0);
                                        return (
                                            <div key={label} style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: `1px solid ${getRiskColor(score || 0)}30` }}>
                                                <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{icon}</div>
                                                <div className={`risk-percentage ${cls}`} style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{score ?? '?'}%</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Overall Risk */}
                                <div style={{ padding: '16px', background: `${getRiskColor(prediction.overallRisk || 0)}15`, borderRadius: '12px', border: `1px solid ${getRiskColor(prediction.overallRisk || 0)}30`, textAlign: 'center', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Overall Health Risk</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: getRiskColor(prediction.overallRisk || 0) }}>{prediction.overallRisk}%</div>
                                    <span className={`badge badge-${prediction.riskLevel === 'low' ? 'green' : prediction.riskLevel === 'moderate' ? 'orange' : 'red'}`} style={{ marginTop: '8px' }}>
                                        {prediction.riskLevel?.toUpperCase()} RISK
                                    </span>
                                </div>

                                {/* Summary */}
                                {prediction.summary && (
                                    <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        💡 {prediction.summary}
                                    </div>
                                )}
                            </div>

                            {/* Key Factors */}
                            {prediction.keyFactors?.length > 0 && (
                                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '0.95rem', marginBottom: '16px' }}>⚠️ Key Concern Factors</h3>
                                    {prediction.keyFactors.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px' }}>
                                            <span>{f.impact === 'high' ? '🔴' : f.impact === 'medium' ? '🟡' : '🟢'}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{f.factor} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({f.value})</span></div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{f.concern}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recommendations */}
                            {prediction.recommendations?.length > 0 && (
                                <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', color: '#10b981' }}>✅ Recommendations</h3>
                                    {prediction.recommendations.map((r, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '0.88rem' }}>
                                            <span style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }}>→</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{r}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Radar Chart */}
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
                                <h3 style={{ fontSize: '0.95rem', marginBottom: '16px' }}>🕸 Risk Radar</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                        <Radar name="Risk %" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.2} strokeWidth={2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🧠</div>
                            <h3 style={{ marginBottom: '8px' }}>Ready to Analyze</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure your lifestyle factors and click "Run AI Risk Analysis" to get your personalized risk assessment.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Explainable AI Section */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem' }}>💡 Explainable AI</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Understand which biomarkers drive your risk — with impact scores</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <select className="form-select" value={riskType} onChange={(e) => setRiskType(e.target.value)} style={{ width: 'auto' }}>
                            <option value="heart">Heart Disease</option>
                            <option value="diabetes">Diabetes</option>
                        </select>
                        <button className="btn btn-secondary" onClick={handleExplain} disabled={explainLoading || !latestReport} id="explain-btn">
                            {explainLoading ? '⏳ Analyzing...' : '🔍 Explain Risk Factors'}
                        </button>
                    </div>
                </div>

                {explainability ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(124,58,237,0.08)', borderRadius: '12px', border: '1px solid rgba(124,58,237,0.2)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: '#a78bfa' }}>Key Insight: </strong>{explainability.insight}
                        </div>
                        {explainability.factorImportance?.map((factor, i) => (
                            <div key={i} className="factor-bar-container">
                                <div className="factor-bar-header">
                                    <span className="factor-name">{factor.factor}</span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span className="factor-value">{factor.value} {factor.unit}</span>
                                        <span className={`badge badge-${factor.direction === 'increases_risk' ? 'red' : factor.direction === 'decreases_risk' ? 'green' : 'orange'}`} style={{ fontSize: '0.65rem' }}>
                                            {factor.direction === 'increases_risk' ? '↑ Risk' : factor.direction === 'decreases_risk' ? '↓ Risk' : 'Neutral'}
                                        </span>
                                    </div>
                                </div>
                                <div className="factor-bar-bg">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${factor.importanceScore}%` }} transition={{ delay: i * 0.1, duration: 1 }}
                                        className={`factor-bar-fill factor-bar-${factor.direction === 'increases_risk' ? 'danger' : factor.direction === 'decreases_risk' ? 'safe' : 'warning'}`} />
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{factor.explanation}</div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select a risk type and click "Explain Risk Factors" to see AI-powered factor importance analysis.</div>
                )}
            </div>
        </div>
    );
}
