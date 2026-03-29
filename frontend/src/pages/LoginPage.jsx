import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return toast.error('Please fill in all fields');
        setLoading(true);
        try {
            const res = await loginUser(form);
            login(res.data.token, res.data.user);
            toast.success(`Welcome back, ${res.data.user.name}! 👋`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.');
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
            >
                <div className="auth-logo">
                    <div className="auth-logo-icon">🩺</div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your HealthLens AI account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            id="login-email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            id="login-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                        disabled={loading}
                        id="login-submit"
                    >
                        {loading ? <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : '→'} Sign In
                    </button>
                </form>

                <div className="auth-link">
                    Don't have an account? <Link to="/register">Create one free</Link>
                </div>

                <div className="auth-link" style={{ marginTop: '12px' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>← Back to Home</Link>
                </div>
            </motion.div>
        </div>
    );
}
