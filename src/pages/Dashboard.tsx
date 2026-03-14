import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Briefcase, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
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
    const fetchProjects = async () => {
      try {
        const data = await projectsService.getProjects();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Failed to load projects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      setResendStatus('Verification email sent!');
    } catch (error: any) {
      setResendStatus(error.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  const stats = [
    { title: 'Active Projects', value: projects.length.toString(), icon: <Briefcase size={20} color="var(--accent-blue)" />, trend: 'All time' },
    { title: 'Tasks Completed', value: '0', icon: <CheckCircle size={20} color="#10B981" />, trend: 'Feature coming soon' },
    { title: 'Hours Tracked', value: '0h', icon: <Clock size={20} color="#F59E0B" />, trend: 'Feature coming soon' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        {!user?.isVerified && (
          <div style={{ backgroundColor: '#FEF3C7', padding: '1rem 2rem', borderBottom: '1px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400E' }}>
              <AlertTriangle size={20} />
              <span><strong>Your email is not verified!</strong> Please check your inbox or spam folder.</span>
            </div>
            <button 
              className="btn btn-outline btn-sm" 
              onClick={handleResend} 
              disabled={resending}
              style={{ borderColor: '#D97706', color: '#B45309' }}
            >
              {resending ? 'Sending...' : resendStatus || 'Resend Email'}
            </button>
          </div>
        )}

        <div className="page-container dashboard-container">
          {/* Stats Row */}
          <section className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="card stat-card">
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

          {/* Main Dashboard Content */}
          <div className="dashboard-grid">
            {/* Recent Projects */}
            <section className="card section-card">
              <div className="section-header">
                <h3 className="section-title">Your Projects</h3>
                <button className="btn btn-outline btn-sm">View All</button>
              </div>
              <div className="projects-list">
                {loading ? (
                  <p>Loading projects...</p>
                ) : projects.length === 0 ? (
                  <p>No projects yet. Create one!</p>
                ) : (
                  projects.map((project, idx) => (
                    <div key={idx} className="project-item">
                      <div className="project-info">
                        <h4 className="project-name">
                          <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'var(--color-navy)' }}>
                            {project.name}
                          </Link>
                        </h4>
                        <span className="status-badge status-in-progress">
                          Active
                        </span>
                      </div>
                      <div className="project-meta">
                        <span className="meta-text">{project.description || 'No description'}</span>
                        <span className="meta-text">{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Quick Actions / Activity */}
            <section className="card section-card">
              <div className="section-header">
                <h3 className="section-title">Recent Activity</h3>
              </div>
              <div className="activity-feed">
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p>Welcome to <strong>Korix AI</strong>!</p>
                    <span className="activity-time">Just now</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
