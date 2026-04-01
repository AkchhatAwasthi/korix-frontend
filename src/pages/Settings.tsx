import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Settings" subtitle="Your current account and workspace details live here for now." />

        <div className="page-container dashboard-container">
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title">Account</h3>
            </div>

            <div className="projects-list">
              <div className="project-item">
                <div className="project-info">
                  <h4 className="project-name" style={{ margin: 0 }}>{user?.name || 'User'}</h4>
                  <span className="status-badge status-in-progress">
                    {user?.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="project-meta" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                  <span className="meta-text">{user?.email}</span>
                  <span className="meta-text">Workspace: My Workspace</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
