import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getMe, updateProfile, getReportStats, getWeeklyDigest } from '../api';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function HealthScoreRing({ score }) {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
    const label = score >= 75 ? 'Good' : score >= 50 ? 'Fair' : 'Poor';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle
                    cx="65" cy="65" r={r} fill="none"
                    stroke={color} strokeWidth="10"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.3s ease', filter: `drop-shadow(0 0 8px ${color}60)` }}
                />
            </svg>
            <div style={{ marginTop: '-90px', textAlign: 'center', zIndex: 1 }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk', color, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>/100</div>
            </div>
            <div style={{ marginTop: '44px', fontWeight: 700, fontSize: '0.9rem', color }}>{label} Health</div>
        </div>
    );
}

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [form, setForm] = useState({
        name: '', age: '', gender: '', height: '', weight: '',
        bloodGroup: '', smokingStatus: 'never', exerciseLevel: 'sedentary', dietType: 'average',
        medicalHistory: '', allergies: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState(null);
    const [digest, setDigest] = useState(null);

    useEffect(() => {
        Promise.all([getMe(), getReportStats(), getWeeklyDigest()])
            .then(([meRes, statsRes, digestRes]) => {
                const u = meRes.data;
                setForm({
                    name: u.name || '',
                    age: u.age || '',
                    gender: u.gender || '',
                    height: u.height || '',
                    weight: u.weight || '',
                    bloodGroup: u.bloodGroup || '',
                    smokingStatus: u.smokingStatus || 'never',
                    exerciseLevel: u.exerciseLevel || 'sedentary',
                    dietType: u.dietType || 'average',
                    medicalHistory: (u.medicalHistory || []).join(', '),
                    allergies: (u.allergies || []).join(', '),
                });
                setStats(statsRes.data);
                setDigest(digestRes.data.digest);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                age: form.age ? parseInt(form.age) : undefined,
                height: form.height ? parseFloat(form.height) : undefined,
                weight: form.weight ? parseFloat(form.weight) : undefined,
                medicalHistory: form.medicalHistory.split(',').map(s => s.trim()).filter(Boolean),
                allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
            };
            const res = await updateProfile(payload);
            if (setUser) setUser(res.data.user);
            toast.success('Profile updated successfully! ✅');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-container"><div className="loading-overlay"><div className="spinner" /></div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>👤 My Profile</h1>
                <p>Manage your health profile and personal information</p>
            </div>

            <div className="grid grid-2" style={{ alignItems: 'start', marginBottom: '28px' }}>
                {/* Left: Form */}
                <form onSubmit={handleSave}>
                    <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Personal Information</h3>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Age</label>
                                <input className="form-input" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="e.g. 28" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Gender</label>
                                <select className="form-select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Blood Group</label>
                                <select className="form-select" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                                    <option value="">Select</option>
                                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Height (cm)</label>
                                <input className="form-input" type="number" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} placeholder="e.g. 170" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Weight (kg)</label>
                                <input className="form-input" type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 65" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Lifestyle Factors</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Smoking Status</label>
                                <select className="form-select" value={form.smokingStatus} onChange={e => setForm({ ...form, smokingStatus: e.target.value })}>
                                    <option value="never">Never Smoked</option>
                                    <option value="former">Former Smoker</option>
                                    <option value="current">Current Smoker</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Exercise Level</label>
                                <select className="form-select" value={form.exerciseLevel} onChange={e => setForm({ ...form, exerciseLevel: e.target.value })}>
                                    <option value="sedentary">Sedentary (no exercise)</option>
                                    <option value="light">Light (1-2x/week)</option>
                                    <option value="moderate">Moderate (3-4x/week)</option>
                                    <option value="active">Active (5+ x/week)</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Diet Quality</label>
                                <select className="form-select" value={form.dietType} onChange={e => setForm({ ...form, dietType: e.target.value })}>
                                    <option value="poor">Poor (fast food, processed)</option>
                                    <option value="average">Average (mixed diet)</option>
                                    <option value="good">Good (balanced diet)</option>
                                    <option value="excellent">Excellent (whole foods)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Medical History</h3>
                        <div className="form-group">
                            <label className="form-label">Medical Conditions (comma-separated)</label>
                            <input className="form-input" value={form.medicalHistory} onChange={e => setForm({ ...form, medicalHistory: e.target.value })} placeholder="e.g. Type 2 Diabetes, Hypertension" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Allergies (comma-separated)</label>
                            <input className="form-input" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. Penicillin, Peanuts" />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                        {saving ? '⏳ Saving...' : '💾 Save Profile'}
                    </button>
                </form>

                {/* Right: Health Score + Stats */}
                <div>
                    {/* Health Score */}
                    {digest?.healthScore != null && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '28px', marginBottom: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>🏆 Your Health Score</h3>
                            <HealthScoreRing score={digest.healthScore} />
                            {digest.tip && (
                                <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.5', textAlign: 'left' }}>
                                    💡 {digest.tip}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Stats */}
                    <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>📊 Your Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[
                                { label: 'Total Lab Reports', value: stats?.count || 0, color: 'var(--cyan)', icon: '🧪' },
                                { label: 'Latest Report', value: stats?.latest ? new Date(stats.latest.date).toLocaleDateString('en-IN') : 'No reports', color: 'var(--purple)', icon: '📅' },
                                { label: 'Latest Glucose', value: stats?.latest?.glucose ? `${stats.latest.glucose} mg/dL` : '—', color: 'var(--green)', icon: '🩸' },
                                { label: 'Latest LDL', value: stats?.latest?.ldl ? `${stats.latest.ldl} mg/dL` : '—', color: 'var(--red)', icon: '💉' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-card)', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Space Grotesk', color: item.color }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Insight */}
                    {digest?.insight && (
                        <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(124,58,237,0.05))', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '16px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>🧠 AI Health Insight</div>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{digest.insight}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
