import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { FolderKanban, Users, Plus, UserPlus } from 'lucide-react';
import { projectsService } from '../api/projects';
import './Dashboard.css'; // Reuse Dashboard UI containers

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [subProjects, setSubProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSubProject, setAddingSubProject] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [selfRole, setSelfRole] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      try {
        const projData = await projectsService.getProjectById(projectId);
        setProject(projData.project || projData);

        const roleData = await projectsService.getSelfRole(projectId);
        setSelfRole(roleData.role);

        const subData = await projectsService.getSubProjects(projectId);
        setSubProjects(subData.subProjects || []);
      } catch (err) {
        console.error('Failed to load project details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const handleCreateSubProject = async () => {
    const name = window.prompt('Enter Sub-Project Name:');
    if (!name || !projectId) return;

    setAddingSubProject(true);
    try {
      await projectsService.createSubProject(projectId, { name, description: 'New sub project' });
      // Refresh sub-projects
      const subData = await projectsService.getSubProjects(projectId);
      setSubProjects(subData.subProjects || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create sub-project');
    } finally {
      setAddingSubProject(false);
    }
  };

  const handleAddMember = async () => {
    const email = window.prompt('Enter User Email to add:');
    if (!email || !projectId) return;

    const role = window.prompt('Enter Role (ADMIN, MEMBER, VIEWER):', 'MEMBER') as any;
    if (!['ADMIN', 'MEMBER', 'VIEWER'].includes(role)) return alert('Invalid role');

    setAddingMember(true);
    try {
      await projectsService.addMember(projectId, { email, role });
      alert('Invitation sent successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-container dashboard-container">
          {loading ? (
            <p>Loading project details...</p>
          ) : !project ? (
            <p>Project not found or access denied.</p>
          ) : (
            <>
              {/* Project Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', margin: 0 }}>{project.name}</h1>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{project.description || 'No description'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {selfRole === 'ADMIN' && (
                    <button className="btn btn-outline" onClick={handleAddMember} disabled={addingMember}>
                      <UserPlus size={16} /> <span>{addingMember ? 'Adding...' : 'Add Member'}</span>
                    </button>
                  )}
                  {selfRole === 'ADMIN' && (
                    <button className="btn btn-accent" onClick={handleCreateSubProject} disabled={addingSubProject}>
                      <Plus size={16} /> <span>{addingSubProject ? 'Creating...' : 'New Sub-Project'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="dashboard-grid">
                {/* Sub-Projects List */}
                <section className="card section-card">
                  <div className="section-header">
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FolderKanban size={20} /> Sub-Projects
                    </h3>
                  </div>
                  <div className="projects-list">
                    {subProjects.length === 0 ? (
                      <p>No sub-projects exists.</p>
                    ) : (
                      subProjects.map((sub, idx) => (
                        <div key={idx} className="project-item">
                          <div className="project-info">
                            <h4 className="project-name">
                              <Link to={`/projects/${sub.id}`} style={{ textDecoration: 'none', color: 'var(--color-navy)' }}>
                                {sub.name}
                              </Link>
                            </h4>
                            <span className="status-badge status-planning">Planning</span>
                          </div>
                          <div className="project-meta">
                            <span className="meta-text">{sub.description || 'No description'}</span>
                            <span className="meta-text">{new Date(sub.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Team Members Snapshot */}
                <section className="card section-card">
                  <div className="section-header">
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={20} /> Members
                    </h3>
                  </div>
                  <div className="projects-list">
                    {project.members && project.members.length > 0 ? (
                      project.members.map((member: any) => (
                        <div key={member.id} className="project-item">
                          <div className="project-info">
                            <h4 className="project-name" style={{ margin: 0 }}>{member.user.name || 'Unknown User'}</h4>
                            <span className="status-badge status-in-progress" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                              {member.role}
                            </span>
                          </div>
                          <div className="project-meta">
                            <span className="meta-text">{member.user.email}</span>
                            <span className="meta-text">Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        No members found. Add new team members to collaborate.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
