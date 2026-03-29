import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' } }),
};

const features = [
    { icon: '🧪', title: 'Lab Report Manager', desc: 'Track 20+ biomarkers including glucose, cholesterol, hemoglobin, vitamins, thyroid and more in one intelligent system.' },
    { icon: '📈', title: 'Longitudinal Tracking', desc: 'Visualize how your health evolves over time. Spot rising LDL, falling hemoglobin, or improving glucose — before it becomes a problem.' },
    { icon: '🧠', title: 'AI Risk Prediction', desc: 'Powered by Groq LLM, get precise heart disease and diabetes risk scores with confidence percentages and clinical reasoning.' },
    { icon: '💡', title: 'Explainable AI', desc: 'Never just get a number. Understand exactly which biomarkers are contributing to your risk — with impact scores and explanations.' },
    { icon: '⚡', title: 'Lifestyle Simulator', desc: 'What if you quit smoking? Exercised daily? Lost 10kg? Simulate interventions and see predicted risk reduction instantly.' },
    { icon: '🔔', title: 'Smart Alerts', desc: 'Intelligent rule-based alerts for 16 biomarkers — from critical high cholesterol to vitamin deficiencies — color-coded by severity.' },
    { icon: '📋', title: 'Doctor Summary', desc: 'AI generates a professional medical summary of your health history that you can share with your doctor with one click.' },
    { icon: '🔒', title: 'Secure & Private', desc: 'Your health data is encrypted, JWT-protected, and never shared. HIPAA-inspired security architecture from the ground up.' },
];

const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Register and set up your health profile with age, gender, and lifestyle information.' },
    { num: '02', title: 'Upload Lab Reports', desc: 'Enter your blood test results manually. Track 20+ biomarkers from any lab report.' },
    { num: '03', title: 'Get AI Analysis', desc: 'Our Groq-powered AI analyzes your data and predicts disease risk with full explanation.' },
    { num: '04', title: 'Act on Insights', desc: 'Use lifestyle simulator to model interventions, get alerts, and share doctor summaries.' },
];

export default function LandingPage() {
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            {/* NAVBAR */}
            <nav className="navbar">
                <Link to="/" className="navbar-brand">
                    <div className="navbar-brand-icon" style={{ fontSize: '1.2rem' }}>🩺</div>
                    <span className="navbar-brand-name">HealthLens AI</span>
                </Link>
                <ul className="navbar-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#how-it-works">How It Works</a></li>
                    <li><a href="#about">About</a></li>
                </ul>
                <div className="navbar-actions">
                    <Link to="/login" className="btn btn-ghost" style={{ padding: '10px 20px' }}>Log In</Link>
                    <Link to="/register" className="btn btn-primary" style={{ padding: '10px 20px' }}>Get Started Free</Link>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-bg" />
                <div className="hero-orb-1" />
                <div className="hero-orb-2" />

                <div className="hero-content">
                    {/* Left */}
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        <motion.div custom={0} variants={fadeUp} className="hero-badge">
                            <span className="hero-badge-dot" />
                            AI-Powered Preventive Healthcare
                        </motion.div>

                        <motion.h1 custom={1} variants={fadeUp} className="hero-title">
                            <span>Know Your Risk</span>
                            <span className="gradient-text">Before You're Sick</span>
                        </motion.h1>

                        <motion.p custom={2} variants={fadeUp} className="hero-description">
                            HealthLens AI analyzes your lab reports, predicts disease risk using advanced AI,
                            tracks health trends over time, and simulates lifestyle interventions —
                            giving you a complete picture of your preventive health.
                        </motion.p>

                        <motion.div custom={3} variants={fadeUp} className="hero-actions">
                            <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                                Start Free Analysis →
                            </Link>
                            <a href="#features" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                                See Features
                            </a>
                        </motion.div>

                        <motion.div custom={4} variants={fadeUp} className="hero-stats">
                            <div>
                                <div className="hero-stat-value">20+</div>
                                <div className="hero-stat-label">Biomarkers Tracked</div>
                            </div>
                            <div>
                                <div className="hero-stat-value">4</div>
                                <div className="hero-stat-label">Disease Risk Scores</div>
                            </div>
                            <div>
                                <div className="hero-stat-value">AI</div>
                                <div className="hero-stat-label">Powered by Groq LLM</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right — Preview Cards */}
                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <div className="health-preview-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🩺 Latest Health Report</div>
                                <span className="badge badge-green">Updated Today</span>
                            </div>
                            <div className="metric-row">
                                <span className="metric-name">Glucose (Fasting)</span>
                                <span className="metric-value metric-warning">118 mg/dL ↑</span>
                            </div>
                            <div className="metric-row">
                                <span className="metric-name">LDL Cholesterol</span>
                                <span className="metric-value metric-high">168 mg/dL ↑</span>
                            </div>
                            <div className="metric-row">
                                <span className="metric-name">HDL Cholesterol</span>
                                <span className="metric-value metric-warning">36 mg/dL ↓</span>
                            </div>
                            <div className="metric-row">
                                <span className="metric-name">Hemoglobin</span>
                                <span className="metric-value metric-normal">14.2 g/dL ✓</span>
                            </div>
                        </div>

                        <div className="health-preview-card" style={{ background: 'rgba(124, 58, 237, 0.06)', borderColor: 'rgba(124, 58, 237, 0.2)' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px' }}>🧠 AI Risk Assessment</div>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'Space Grotesk' }}>62%</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Heart Risk</div>
                                </div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444', fontFamily: 'Space Grotesk' }}>74%</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Diabetes Risk</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                                💡 <strong>Key factors:</strong> High LDL, Low HDL, Elevated Glucose
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="section" id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 48px' }}>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                    <div className="section-badge">✨ Features</div>
                    <h2 className="section-title">Everything You Need to <span className="gradient-text">Stay Ahead of Disease</span></h2>
                    <p className="section-subtitle">
                        A complete predictive health platform powered by AI — from lab tracking to risk prediction to lifestyle simulation.
                    </p>
                </motion.div>

                <div className="feature-grid">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            className="feature-card"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <span className="feature-icon">{f.icon}</span>
                            <div className="feature-title">{f.title}</div>
                            <p className="feature-desc">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section style={{ background: 'var(--bg-secondary)', padding: '100px 48px' }} id="how-it-works">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="section-badge">🗺️ Process</div>
                        <h2 className="section-title">How <span className="gradient-text">HealthLens AI</span> Works</h2>
                        <p className="section-subtitle">Four simple steps from raw lab data to actionable health intelligence.</p>
                    </motion.div>

                    <div className="steps-grid">
                        {steps.map((s, i) => (
                            <motion.div
                                key={s.num}
                                className="step-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                            >
                                <div className="step-number">{s.num}</div>
                                <div className="step-title">{s.title}</div>
                                <p className="step-desc">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI HIGHLIGHT */}
            <section style={{ padding: '100px 48px' }} id="about">
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                    <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <div className="section-badge">🧠 AI Engine</div>
                        <h2>Powered by <span className="gradient-text">Groq LLaMA AI</span></h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '16px', lineHeight: '1.8', marginBottom: '32px' }}>
                            Unlike traditional ML models, HealthLens uses Groq's blazing-fast LLaMA AI which understands the full clinical context of your biomarkers —
                            delivering nuanced risk analysis, explainable reasoning, and personalized recommendations in under a second.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {['< 1 second AI inference with Groq', 'Explainable AI with factor importance', 'Lifestyle intervention simulation', 'Professional doctor-ready reports'].map((item) => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', background: 'var(--cyan)', borderRadius: '50%', flexShrink: 0 }} />
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <div style={{ background: 'rgba(124, 58, 237, 0.06)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '24px', padding: '32px' }}>
                            <div style={{ marginBottom: '20px', fontWeight: 700 }}>🔬 Explainable AI Output</div>
                            {[
                                { factor: 'LDL Cholesterol', impact: 87, dir: 'danger', val: '168 mg/dL' },
                                { factor: 'HDL Cholesterol', impact: 72, dir: 'warning', val: '36 mg/dL (Low)' },
                                { factor: 'Fasting Glucose', impact: 58, dir: 'warning', val: '118 mg/dL' },
                                { factor: 'BMI', impact: 45, dir: 'warning', val: '27.2' },
                                { factor: 'Hemoglobin', impact: 12, dir: 'safe', val: '14.2 g/dL ✓' },
                            ].map((f) => (
                                <div key={f.factor} className="factor-bar-container">
                                    <div className="factor-bar-header">
                                        <span className="factor-name">{f.factor}</span>
                                        <span className="factor-value">{f.val}</span>
                                    </div>
                                    <div className="factor-bar-bg">
                                        <div className={`factor-bar-fill factor-bar-${f.dir}`} style={{ width: `${f.impact}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-bg-glow" />
                <motion.div className="cta-content" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="section-badge" style={{ margin: '0 auto 16px' }}>🚀 Start Today</div>
                    <h2 style={{ marginBottom: '16px' }}>Take Control of Your <span className="gradient-text">Health Future</span></h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '40px', lineHeight: '1.7' }}>
                        Join HealthLens AI and get AI-powered insights that could save your life.
                        It's completely free — no credit card required.
                    </p>
                    <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
                        Start Your Free Health Analysis →
                    </Link>
                </motion.div>
            </section>

            {/* FOOTER */}
            <footer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div className="navbar-brand-icon" style={{ width: '32px', height: '32px', fontSize: '1rem', borderRadius: '8px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🩺</div>
                    <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>HealthLens AI</span>
                </div>
                <p>© 2024 HealthLens AI. Built with ❤️ using React, Node.js, MongoDB & Groq LLM.</p>
                <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>⚠️ For educational purposes. Not a substitute for professional medical advice.</p>
            </footer>
        </div>
    );
}
