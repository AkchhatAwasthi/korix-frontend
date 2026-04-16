import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Plus, FolderKanban, ExternalLink, Calendar } from 'lucide-react';
import { projectsService } from '../api/projects';
import './Projects.css';

type ProjectSummary = { id: string; name: string; description?: string | null; createdAt: string; };

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await projectsService.getProjects();
      setProjects(data.projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setCreating(true); setError('');
    try {
      const res = await projectsService.createProject({ name: form.name.trim(), description: form.description });
      setShowForm(false);
      setForm({ name: '', description: '' });
      navigate(`/projects/${res.project.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="projects-page-container">

          {/* Create project inline form */}
          {showForm && (
            <section className="projects-section-card">
              <div className="projects-section-header">
                <h3 className="projects-section-title">Create New Project</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
              </div>
              <form onSubmit={handleCreate} style={{ display: 'grid', gap: '0.875rem', maxWidth: 520 }}>
                <div className="input-group">
                  <label className="input-label">Project Name *</label>
                  <input className="input-field" placeholder="e.g. Marketing Redesign" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                </div>
                <div className="input-group">
                  <label className="input-label">Description (optional)</label>
                  <textarea className="input-field" rows={2} placeholder="What's this project about?"
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                {error && <div className="error-message">{error}</div>}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-accent" disabled={creating}>
                    <Plus size={15} />{creating ? 'Creating…' : 'Create Project'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Projects grid */}
          <section className="projects-section-card">
            <div className="projects-section-header">
              <h3 className="projects-section-title"><FolderKanban size={17} /> All Projects ({projects.length})</h3>
              {!showForm && (
                <button className="btn btn-accent btn-sm" onClick={() => setShowForm(true)}>
                  <Plus size={14} /> New Project
                </button>
              )}
            </div>

            {loading ? (
              <div className="empty-state">Loading projects…</div>
            ) : projects.length === 0 ? (
              <div className="empty-state">
                <FolderKanban size={36} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                <p>No projects yet.</p>
                <button className="btn btn-accent btn-sm" style={{ marginTop: '1rem' }} onClick={() => setShowForm(true)}>
                  <Plus size={14} /> Create your first project
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {projects.map(project => (
                  <Link key={project.id} to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                    <div className="project-card-grid">
                      <div className="pcg-header">
                        <div className="pcg-icon"><FolderKanban size={16} /></div>
                        <ExternalLink size={14} className="pcg-arrow" />
                      </div>
                      <h4 className="pcg-name">{project.name}</h4>
                      <p className="pcg-desc">{project.description || 'No description'}</p>
                      <div className="pcg-footer">
                        <Calendar size={12} />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
