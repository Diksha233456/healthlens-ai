import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getDoctorSummary } from '../api';
import { useAuth } from '../context/AuthContext';

export default function SummaryPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [reportCount, setReportCount] = useState(0);
    const [latestDate, setLatestDate] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await getDoctorSummary();
            setSummary(res.data.summary);
            setReportCount(res.data.reportCount);
            setLatestDate(res.data.latestDate);
            toast.success('Doctor summary generated! 📋');
        } catch (err) {
            const msg = err.response?.data?.error || 'Summary generation failed';
            toast.error(msg.includes('GROQ_API_KEY') ? '⚠️ Add your Groq API key to backend .env first!' : msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (summary) {
            navigator.clipboard.writeText(summary);
            toast.success('Summary copied to clipboard!');
        }
    };

    const handleExportPDF = async () => {
        if (!summary) return;

        try {
            toast.loading('Generating PDF...', { id: 'pdf-toast' });
            // Dynamically import to avoid breaking SSR/initial bundle
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const element = document.getElementById('summary-document-content');
            if (!element) throw new Error("Document content not found");

            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                backgroundColor: '#0A0A14', // Match theme background
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`HealthLens_Summary_${new Date().toISOString().split('T')[0]}.pdf`);

            toast.success('PDF Exported Successfully!', { id: 'pdf-toast' });
        } catch (error) {
            console.error('PDF Export Error:', error);
            toast.error('Failed to export PDF', { id: 'pdf-toast' });
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>📋 Doctor Summary</h1>
                <p>AI-generated professional medical summary of your health history</p>
            </div>

            {/* Info Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(124,58,237,0.06))', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '20px', padding: '28px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '3rem' }}>🤖</div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '8px' }}>AI-Powered Medical Summary</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '16px' }}>
                            Our AI analyzes your last 6 lab reports and generates a professional medical summary —
                            including trend analysis, clinical observations, and doctor recommendations —
                            that you can share with your physician.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {['Powered by Groq LLaMA AI', 'Analyzes up to 6 reports', 'Doctor-ready format', 'One-click copy'].map((f) => (
                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--cyan)' }}>
                                    <span>✓</span> <span>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}
                        style={{ flexShrink: 0 }} id="generate-summary-btn">
                        {loading ? <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Generating...</> : '📋 Generate Summary'}
                    </button>
                </div>
            </motion.div>

            {/* Summary Result */}
            {summary && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Meta */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Reports Analyzed', value: reportCount },
                            { label: 'Patient', value: user?.name || 'Unknown' },
                            { label: 'Latest Data', value: latestDate ? new Date(latestDate).toLocaleDateString('en-IN') : '—' },
                            { label: 'Generated', value: new Date().toLocaleDateString('en-IN') },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ padding: '12px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Space Grotesk' }}>{value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Document */}
                    <div id="summary-document-content" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px' }}>
                        {/* Document Header */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.1))', padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>🩺</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>HealthLens AI</span>
                                        <span className="badge badge-cyan">MEDICAL REPORT</span>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>AI-Generated Health Summary • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <div><strong>Patient:</strong> {user?.name}</div>
                                    <div><strong>Age:</strong> {user?.age || '—'} | <strong>Gender:</strong> {user?.gender || '—'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Body */}
                        <div style={{ padding: '32px' }}>
                            <div style={{ lineHeight: '1.85', color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap', fontFamily: 'Inter', letterSpacing: '0.01em' }}>
                                {summary}
                            </div>
                        </div>

                        {/* Document Footer */}
                        <div style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                ⚠️ For informational purposes only. Not a substitute for professional medical advice.
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Generated by HealthLens AI powered by Groq LLaMA
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={handleExportPDF} disabled={!summary}>📥 Export PDF</button>
                        <button className="btn btn-secondary" onClick={handleCopy}>📋 Copy to Clipboard</button>
                        <button className="btn btn-ghost" onClick={handleGenerate} disabled={loading}>🔄 Regenerate</button>
                    </div>
                </motion.div>
            )}

            {!summary && !loading && (
                <div className="empty-state">
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📋</div>
                    <div className="empty-state-title">No Summary Yet</div>
                    <div className="empty-state-desc">Click "Generate Summary" above to create your AI-powered medical summary. Make sure you have at least 1 lab report first.</div>
                </div>
            )}
        </div>
    );
}
