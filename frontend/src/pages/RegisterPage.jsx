import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', age: '', gender: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return toast.error('Name, email and password are required');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            const res = await registerUser(form);
            login(res.data.token, res.data.user);
            toast.success(`Account created! Welcome to HealthLens AI, ${res.data.user.name}! 🎉`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg" />
            <div className="hero-orb-1" style={{ top: '10%', left: '5%', width: '300px', height: '300px' }} />
            <div className="hero-orb-2" style={{ bottom: '10%', right: '5%', width: '400px', height: '400px' }} />

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ maxWidth: '520px' }}
            >
                <div className="auth-logo">
                    <div className="auth-logo-icon">🩺</div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Start your preventive health journey today</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" placeholder="John Smith" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} id="reg-name" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" placeholder="you@example.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} id="reg-email" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" placeholder="Minimum 6 characters" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })} id="reg-password" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Age</label>
                            <input type="number" className="form-input" placeholder="25" value={form.age} min="1" max="120"
                                onChange={(e) => setForm({ ...form, age: e.target.value })} id="reg-age" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select className="form-select" value={form.gender}
                                onChange={(e) => setForm({ ...form, gender: e.target.value })} id="reg-gender">
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                        disabled={loading} id="reg-submit">
                        {loading ? <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : '🚀'}
                        {' '}Create Free Account
                    </button>
                </form>

                <div className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
                <div className="auth-link" style={{ marginTop: '12px' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>← Back to Home</Link>
                </div>
            </motion.div>
        </div>
    );
}
