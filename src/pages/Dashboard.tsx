import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Briefcase, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { projectsService } from '../api/projects';
import { authService } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    if (localStorage.getItem('pending_invite_token')) {
      window.location.href = '/projects/join';
      return;
    }
    const fetch = async () => {
      try {
        const data = await projectsService.getProjects();
        setProjects(data.projects || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      setResendStatus('Email sent!');
    } catch (e: any) {
      setResendStatus(e.response?.data?.message || 'Failed');
    } finally {
      setResending(false);
    }
  };

  const stats = [
    { title: 'Active Projects', value: String(projects.length), icon: <Briefcase size={18} color="#A5B4FC" />, trend: 'All time' },
    { title: 'Tasks Completed', value: '0', icon: <CheckCircle size={18} color="var(--accent-green)" />, trend: 'Coming soon' },
    { title: 'Hours Tracked', value: '0h', icon: <Clock size={18} color="var(--accent-amber)" />, trend: 'Coming soon' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-container dashboard-container">
          <div className="pd-header-main" style={{ marginBottom: '1.5rem' }}>
            <h1 className="pd-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              Good to see you, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="pd-description" style={{ fontSize: '0.9rem' }}>
              Here's what's happening across your workspace today.
            </p>
          </div>

          {!user?.isVerified && (
            <div className="verify-banner" style={{ background: 'rgba(226,178,3,0.1)', border: '1px solid rgba(226,178,3,0.2)', padding: '0.75rem 1rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="verify-banner-text" style={{ color: 'var(--accent-amber)', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem' }}>
                <AlertTriangle size={16} />
                <span><strong>Email not verified.</strong> Check your inbox or spam folder.</span>
              </div>
              <button className="btn btn-sm btn-outline" onClick={handleResend} disabled={resending}
                style={{ borderColor: 'rgba(226,178,3,0.4)', color: 'var(--accent-amber)' }}>
                {resending ? 'Sending…' : resendStatus || 'Resend'}
              </button>
            </div>
          )}
          {/* Stats */}
          <section className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="card stat-card">
                <div className="stat-header">
                  <span className="stat-title">{stat.title}</span>
                  <div className="stat-icon-wrapper">{stat.icon}</div>
                </div>
                <div className="stat-body">
                  <h3 className="stat-value">{stat.value}</h3>
                  <span className="stat-trend">{stat.trend}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Main grid */}
          <div className="dashboard-grid">
            {/* Projects */}
            <section className="card section-card">
              <div className="section-header">
                <h3 className="section-title">Your Projects</h3>
                <Link to="/projects" className="btn btn-sm btn-outline">View all</Link>
              </div>
              <div className="projects-list">
                {loading ? (
                  <div className="empty-state">Loading projects…</div>
                ) : projects.length === 0 ? (
                  <div className="empty-state">No projects yet. Hit <strong>New Project</strong> to create one.</div>
                ) : (
                  projects.slice(0, 6).map((project) => (
                    <div key={project.id} className="project-item">
                      <div className="project-info">
                        <div className="project-dot">{project.name.charAt(0).toUpperCase()}</div>
                        <h4 className="project-name">
                          <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {project.name}
                          </Link>
                        </h4>
                      </div>
                      <span className="meta-text" style={{ flexShrink: 0, fontSize: '0.75rem' }}>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Activity */}
            <section className="card section-card">
              <div className="section-header">
                <h3 className="section-title">Recent Activity</h3>
              </div>
              <div className="activity-feed">
                <div className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-content">
                    <p>Welcome to <strong style={{ color: 'var(--text-primary)' }}>Korix</strong>!</p>
                    <span className="activity-time">Just now</span>
                  </div>
                </div>
                {projects.slice(0, 3).map((p) => (
                  <div key={p.id} className="activity-item">
                    <div className="activity-dot" style={{ background: 'var(--accent-green)', boxShadow: '0 0 8px rgba(52,211,153,0.5)' }} />
                    <div className="activity-content">
                      <p>Project <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong> created</p>
                      <span className="activity-time">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/projects" className="btn btn-ghost btn-sm" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                Go to Projects <ArrowRight size={14} />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
