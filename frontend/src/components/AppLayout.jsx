import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navGroups = [
    {
        label: 'Core',
        items: [
            { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
            { path: '/reports', icon: '🧪', label: 'Lab Reports' },
            { path: '/trends', icon: '📈', label: 'Health Trends' },
        ]
    },
    {
        label: 'AI Features',
        items: [
            { path: '/predict', icon: '🧠', label: 'Risk Prediction' },
            { path: '/scan', icon: '📸', label: 'AI Health Scan', badge: 'NEW' },
            { path: '/simulate', icon: '⚡', label: 'Lifestyle Sim' },
            { path: '/chat', icon: '💬', label: 'Health Chat', badge: 'AI' },
            { path: '/nutrition', icon: '🥗', label: 'Nutrition Plan', badge: 'AI' },
        ]
    },
    {
        label: 'Reports & Alerts',
        items: [
            { path: '/alerts', icon: '🔔', label: 'Smart Alerts' },
            { path: '/summary', icon: '📋', label: 'Doctor Summary' },
        ]
    },
    {
        label: 'Account',
        items: [
            { path: '/profile', icon: '👤', label: 'My Profile' },
            { path: '/settings', icon: '⚙️', label: 'Settings' },
        ]
    }
];

export default function AppLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <div className="app-layout animate-fade-in">
            {/* SIDEBAR */}
            <aside className="sidebar glass-panel-heavy">
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">🩺</div>
                    <div>
                        <div className="sidebar-logo-text">HealthLens AI</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>Predictive Health Platform</div>
                    </div>
                </div>

                {/* User Badge */}
                <div className="glass-panel" style={{ padding: '12px 16px', margin: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: 'white', flexShrink: 0
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ''}</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navGroups.map(group => (
                        <div key={group.label} className="sidebar-nav-section">
                            <div className="sidebar-nav-label">{group.label}</div>
                            {group.items.map(({ path, icon, label, badge }) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                                >
                                    <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{icon}</span>
                                    <span style={{ flex: 1 }}>{label}</span>
                                    {badge && (
                                        <span style={{
                                            fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px',
                                            borderRadius: '50px', background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))',
                                            color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.2)',
                                            letterSpacing: '0.05em'
                                        }}>{badge}</span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <button className="sidebar-nav-item" onClick={handleLogout} style={{ color: 'var(--red)', width: '100%' }}>
                        <span>🚪</span> Logout
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        HealthLens AI v3.0 • Groq Llama 3
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
