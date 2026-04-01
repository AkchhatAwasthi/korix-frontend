import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { FolderKanban } from 'lucide-react';
import { projectsService } from '../api/projects';
import './Dashboard.css';

type ProjectSummary = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsService.getProjects();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Failed to load projects', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Projects" subtitle="Browse every workspace project and jump into details fast." />

        <div className="page-container dashboard-container">
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderKanban size={20} /> All Projects
              </h3>
            </div>

            <div className="projects-list">
              {loading ? (
                <p>Loading projects...</p>
              ) : projects.length === 0 ? (
                <p>No projects yet. Use the New Project button to create your first workspace.</p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="project-item">
                    <div className="project-info">
                      <h4 className="project-name">
                        <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'var(--color-navy)' }}>
                          {project.name}
                        </Link>
                      </h4>
                      <span className="status-badge status-in-progress">Active</span>
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
        </div>
      </div>
    </div>
  );
}
