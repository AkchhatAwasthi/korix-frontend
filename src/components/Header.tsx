import { useState } from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { projectsService } from '../api/projects';
import './Header.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = 'Dashboard', subtitle }: HeaderProps) {
  const [loading, setLoading] = useState(false);

  const handleNewProject = async () => {
    const name = window.prompt("Enter new project name:");
    if (!name) return;
    
    setLoading(true);
    try {
      await projectsService.createProject({ name, description: "New project" });
      // Quick way to refresh dashboard:
      window.location.reload();
    } catch (err) {
      console.error('Failed to create project', err);
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <div>
          <h2 className="page-title">{title}</h2>
          {subtitle && (
            <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search tasks, projects..." className="search-input" />
        </div>
        
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="badge"></span>
        </button>
        
        <button className="btn btn-accent" onClick={handleNewProject} disabled={loading}>
          <Plus size={16} />
          <span>{loading ? 'Creating...' : 'New Project'}</span>
        </button>
      </div>
    </header>
  );
}
