import { useState } from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { projectsService } from '../api/projects';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './Header.css';

export default function Header() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await projectsService.createProject({ name: form.name.trim(), description: form.description.trim() });
      setIsModalOpen(false);
      setForm({ name: '', description: '' });
      navigate(`/projects/${res.project.id}`);
    } catch (err: any) {
      console.error('Failed to create project', err);
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="jira-header">
        <div className="header-left">
          {/* We moved page title out of header, header is purely global nav in Jira */}
        </div>

        <div className="header-center">
          <div className="jira-search-bar">
            <Search size={15} className="search-icon" />
            <input type="text" placeholder="Search" className="search-input" />
          </div>
          <button className="btn btn-primary-blue" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Create</span>
          </button>
        </div>

        <div className="header-right">
          <button className="btn btn-outline btn-glass">
            <span style={{ fontSize: '0.85rem' }}>See plans</span>
          </button>
          <div className="header-icon-group">
            <button className="icon-btn" aria-label="Notifications"><Bell size={18} /></button>
            <button className="icon-btn" aria-label="Help"><Search size={18} /> {/* Using search as placeholder for ? */}</button>
            {/* We will use CSS to put an avatar here */}
            <div className="header-avatar">FK</div>
          </div>
        </div>
      </header>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create project">
        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Project Name *</label>
            <input 
              className="input-field" 
              placeholder="e.g. Website Redesign" 
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required 
              autoFocus 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea 
              className="input-field" 
              placeholder="Optional details" 
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} 
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={loading}>
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
