import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, User, AlertCircle } from 'lucide-react';
import './Dashboard.css';

export default function SettingsPage() {
  const { user } = useAuth();

  const rows = [
    { icon: <User size={16} />,        label: 'Full Name',    value: user?.name || '—' },
    { icon: <Mail size={16} />,        label: 'Email',        value: user?.email || '—' },
    { icon: <ShieldCheck size={16} />, label: 'Verification', value: user?.isVerified ? 'Verified ✓' : 'Not verified' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-container dashboard-container">
          <section className="card section-card" style={{ maxWidth: 600 }}>
            <div className="section-header">
              <h3 className="section-title">Account Details</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {rows.map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.875rem 0',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <div style={{ color: 'var(--text-tertiary)', width: 20, flexShrink: 0, display: 'flex' }}>{row.icon}</div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', width: 110, flexShrink: 0 }}>{row.label}</span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: row.label === 'Verification' && !user?.isVerified ? 'var(--accent-amber)' : 'var(--text-primary)',
                    fontWeight: 500,
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {!user?.isVerified && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem 1.25rem',
              background: 'rgba(251,191,36,0.07)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 'var(--radius-md)',
              maxWidth: 600,
            }}>
              <AlertCircle size={16} color="var(--accent-amber)" />
              <span style={{ fontSize: '0.83rem', color: '#FCD34D' }}>
                Your email is not verified. Check your inbox to unlock all features.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
