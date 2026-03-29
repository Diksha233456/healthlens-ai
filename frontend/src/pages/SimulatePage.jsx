import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { simulateLifestyle, getReports } from '../api';
import { useAuth } from '../context/AuthContext';

const getRiskColor = (score) => {
    if (score < 25) return '#10b981';
    if (score < 50) return '#f59e0b';
    if (score < 75) return '#ef4444';
    return '#ff0040';
};

export default function SimulatePage() {
    const { user } = useAuth();
    const [latestReport, setLatestReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [simulation, setSimulation] = useState(null);
    const [current, setCurrent] = useState({
        smokingStatus: 'current',
        exerciseLevel: 'sedentary',
        dietType: 'poor',
        weight: user?.weight || 75,
    });
    const [proposed, setProposed] = useState({
        smokingStatus: 'never',
        exerciseLevel: 'moderate',
        dietType: 'good',
        weight: user?.weight ? user.weight - 5 : 70,
    });

    useEffect(() => {
        getReports().then(res => { if (res.data.length > 0) setLatestReport(res.data[0]); });
    }, []);

    const handleSimulate = async () => {
        if (!latestReport) return toast.error('Add a lab report first to simulate lifestyle changes!');
        setLoading(true);
        try {
            const res = await simulateLifestyle({ biomarkers: latestReport, currentLifestyle: current, proposedLifestyle: proposed });
            setSimulation(res.data.simulation);
            toast.success('Lifestyle simulation complete! ⚡');
        } catch (err) {
            const msg = err.response?.data?.error || 'Simulation failed';
            toast.error(msg.includes('GROQ_API_KEY') ? '⚠️ Add your Groq API key to backend .env first!' : msg);
        } finally {
            setLoading(false);
        }
    };

    const SliderOption = ({ label, value, onChange, options }) => (
        <div style={{ marginBottom: '20px' }}>
            <label className="form-label">{label}</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {options.map(opt => (
                    <button key={opt.value} onClick={() => onChange(opt.value)}
                        style={{
                            padding: '8px 14px', borderRadius: '8px', border: `1.5px solid ${value === opt.value ? 'var(--cyan)' : 'var(--border-color)'}`,
                            background: value === opt.value ? 'var(--cyan-dim)' : 'transparent', color: value === opt.value ? 'var(--cyan)' : 'var(--text-secondary)',
                            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s'
                        }}>
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );

    const smokingOptions = [{ value: 'current', label: '🚬 Current' }, { value: 'former', label: '⏸ Former' }, { value: 'never', label: '✅ Never' }];
    const exerciseOptions = [{ value: 'sedentary', label: '🛋 Sedentary' }, { value: 'light', label: '🚶 Light' }, { value: 'moderate', label: '🏃 Moderate' }, { value: 'active', label: '💪 Active' }];
    const dietOptions = [{ value: 'poor', label: '🍔 Poor' }, { value: 'average', label: '🥙 Average' }, { value: 'good', label: '🥗 Good' }, { value: 'excellent', label: '🥦 Excellent' }];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>⚡ Lifestyle Simulator</h1>
                <p>Simulate lifestyle changes and predict their impact on your disease risk</p>
            </div>

            <div className="grid grid-2" style={{ marginBottom: '28px', alignItems: 'start' }}>
                {/* Current Lifestyle */}
                <div className="glass-card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                        <h3 style={{ fontSize: '1rem' }}>Current Lifestyle</h3>
                    </div>
                    <SliderOption label="Smoking Status" value={current.smokingStatus} onChange={(v) => setCurrent({ ...current, smokingStatus: v })} options={smokingOptions} />
                    <SliderOption label="Exercise Level" value={current.exerciseLevel} onChange={(v) => setCurrent({ ...current, exerciseLevel: v })} options={exerciseOptions} />
                    <SliderOption label="Diet Quality" value={current.dietType} onChange={(v) => setCurrent({ ...current, dietType: v })} options={dietOptions} />
                    <div className="slider-container">
                        <div className="slider-header">
                            <span className="slider-label">Current Weight</span>
                            <span className="slider-value">{current.weight} kg</span>
                        </div>
                        <input type="range" min="40" max="150" value={current.weight}
                            onChange={(e) => setCurrent({ ...current, weight: parseInt(e.target.value) })} />
                    </div>
                </div>

                {/* Proposed Lifestyle */}
                <div className="glass-card" style={{ padding: '28px', border: '1px solid rgba(0,212,255,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                        <h3 style={{ fontSize: '1rem' }}>Proposed Changes</h3>
                    </div>
                    <SliderOption label="Smoking Status" value={proposed.smokingStatus} onChange={(v) => setProposed({ ...proposed, smokingStatus: v })} options={smokingOptions} />
                    <SliderOption label="Exercise Level" value={proposed.exerciseLevel} onChange={(v) => setProposed({ ...proposed, exerciseLevel: v })} options={exerciseOptions} />
                    <SliderOption label="Diet Quality" value={proposed.dietType} onChange={(v) => setProposed({ ...proposed, dietType: v })} options={dietOptions} />
                    <div className="slider-container">
                        <div className="slider-header">
                            <span className="slider-label">Target Weight</span>
                            <span className="slider-value">{proposed.weight} kg</span>
                        </div>
                        <input type="range" min="40" max="150" value={proposed.weight}
                            onChange={(e) => setProposed({ ...proposed, weight: parseInt(e.target.value) })} />
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <button className="btn btn-primary" onClick={handleSimulate} disabled={loading || !latestReport}
                    style={{ fontSize: '1rem', padding: '14px 40px' }} id="simulate-btn">
                    {loading ? <><span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> Simulating...</> : '⚡ Run Lifestyle Simulation'}
                </button>
                {!latestReport && <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--orange)' }}>⚠️ Please add a lab report first</div>}
            </div>

            {/* Results */}
            {simulation && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>📊 Simulation Results</h3>

                    {/* Before/After Risk Comparison */}
                    <div className="grid grid-3" style={{ marginBottom: '28px', gap: '16px' }}>
                        {[
                            { label: 'Heart Disease Risk', before: simulation.currentRisks?.heartRisk, after: simulation.projectedRisks?.heartRisk },
                            { label: 'Diabetes Risk', before: simulation.currentRisks?.diabetesRisk, after: simulation.projectedRisks?.diabetesRisk },
                            { label: 'Overall Risk', before: simulation.currentRisks?.overallRisk, after: simulation.projectedRisks?.overallRisk },
                        ].map(({ label, before, after }) => {
                            const reduction = before && after ? (before - after) : 0;
                            return (
                                <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 600 }}>{label}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>BEFORE</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: getRiskColor(before || 0) }}>{before ?? '?'}%</div>
                                        </div>
                                        <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>→</div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>AFTER</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: getRiskColor(after || 0) }}>{after ?? '?'}%</div>
                                        </div>
                                    </div>
                                    {reduction > 0 && (
                                        <div style={{ background: 'var(--green-dim)', color: 'var(--green)', borderRadius: '50px', padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)' }}>
                                            ↓ {reduction.toFixed(0)}% Risk Reduction
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Improvements breakdown */}
                    {simulation.improvements?.length > 0 && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--green)' }}>✅ Predicted Improvements</h3>
                            {simulation.improvements.map((imp, i) => (
                                <div key={i} style={{ display: 'flex', gap: '14px', padding: '12px', background: 'rgba(16,185,129,0.05)', borderRadius: '10px', marginBottom: '8px', alignItems: 'center' }}>
                                    <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--green)', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontFamily: 'Space Grotesk', fontSize: '1rem', flexShrink: 0 }}>{imp.reduction}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{imp.area}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{imp.explanation}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Motivational Message */}
                    {simulation.message && (
                        <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>💬</div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.7', fontStyle: 'italic' }}>"{simulation.message}"</div>
                            {simulation.timeToEffect && <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 600 }}>⏱ Estimated time to see results: {simulation.timeToEffect}</div>}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
