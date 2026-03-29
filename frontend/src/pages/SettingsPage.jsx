import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Lock, Shield, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        sms: false,
    });

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success(`${key} notifications updated`);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Account Settings</h1>
                <p>Manage your account preferences and security.</p>
            </div>

            <div className="grid grid-2" style={{ gap: '32px' }}>
                {/* Profile Info Summary */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield className="text-cyan" size={24} style={{ color: 'var(--cyan)' }} />
                        Account Information
                    </h2>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={user?.name || ''}
                            disabled
                            style={{ opacity: 0.7 }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={user?.email || ''}
                            disabled
                            style={{ opacity: 0.7 }}
                        />
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        To change your core account details, please contact support.
                    </p>
                </div>

                {/* Security / Password */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock size={24} style={{ color: 'var(--purple)' }} />
                        Security
                    </h2>

                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input type="password" className="form-input" placeholder="••••••••" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input type="password" className="form-input" placeholder="Enter new password" />
                    </div>

                    <button className="btn btn-primary" onClick={() => toast.success('Password update request sent')} style={{ marginTop: '10px' }}>
                        Update Password
                    </button>
                </div>

                {/* Notifications Hub */}
                <div className="glass-card" style={{ padding: '32px', gridColumn: '1 / -1' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bell size={24} style={{ color: 'var(--orange)' }} />
                        Communication Preferences
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Email Notifications</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive weekly health summaries and alerts via email.</p>
                            </div>
                            <button
                                onClick={() => handleToggle('email')}
                                style={{
                                    width: '50px', height: '26px', borderRadius: '50px',
                                    background: notifications.email ? 'var(--gradient-brand)' : 'var(--bg-secondary)',
                                    border: `1px solid ${notifications.email ? 'transparent' : 'var(--border-color)'}`,
                                    position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                    position: 'absolute', top: '2px', left: notifications.email ? '26px' : '2px', transition: 'all 0.3s ease'
                                }} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Push Notifications</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get instant alerts for critical health risks on your device.</p>
                            </div>
                            <button
                                onClick={() => handleToggle('push')}
                                style={{
                                    width: '50px', height: '26px', borderRadius: '50px',
                                    background: notifications.push ? 'var(--gradient-brand)' : 'var(--bg-secondary)',
                                    border: `1px solid ${notifications.push ? 'transparent' : 'var(--border-color)'}`,
                                    position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                    position: 'absolute', top: '2px', left: notifications.push ? '26px' : '2px', transition: 'all 0.3s ease'
                                }} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>SMS Alerts</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive text messages for important doctor summaries.</p>
                            </div>
                            <button
                                onClick={() => handleToggle('sms')}
                                style={{
                                    width: '50px', height: '26px', borderRadius: '50px',
                                    background: notifications.sms ? 'var(--gradient-brand)' : 'var(--bg-secondary)',
                                    border: `1px solid ${notifications.sms ? 'transparent' : 'var(--border-color)'}`,
                                    position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                    position: 'absolute', top: '2px', left: notifications.sms ? '26px' : '2px', transition: 'all 0.3s ease'
                                }} />
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
