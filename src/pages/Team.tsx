import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Users } from 'lucide-react';
import { projectsService } from '../api/projects';
import './Dashboard.css';

type TeamMember = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  projectName: string;
};

type ProjectMemberResponse = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type ProjectDetailResponse = {
  id: string;
  name: string;
  members: ProjectMemberResponse[];
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const projectData = await projectsService.getProjects();
        const projects = projectData.projects || [];

        const projectDetails = await Promise.all(
          projects.map(async (project: { id: string }) => {
            const detailData = await projectsService.getProjectById(project.id);
            return detailData.project as ProjectDetailResponse;
          })
        );

        const flattenedMembers = projectDetails.flatMap((project) =>
          (project.members || []).map((member: ProjectMemberResponse) => ({
            id: `${project.id}-${member.user.id}`,
            name: member.user.name,
            email: member.user.email,
            role: member.role,
            projectName: project.name,
          }))
        );

        setMembers(flattenedMembers);
      } catch (error) {
        console.error('Failed to load team data', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Team" subtitle="See who is participating across your current projects." />

        <div className="page-container dashboard-container">
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} /> Project Members
              </h3>
            </div>

            <div className="projects-list">
              {loading ? (
                <p>Loading team members...</p>
              ) : members.length === 0 ? (
                <p>No members found yet. Invite teammates from a project to see them here.</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="project-item">
                    <div className="project-info">
                      <h4 className="project-name" style={{ margin: 0 }}>{member.name || 'Unnamed Member'}</h4>
                      <span className="status-badge status-in-progress">{member.role}</span>
                    </div>
                    <div className="project-meta" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <span className="meta-text">{member.email}</span>
                      <span className="meta-text">{member.projectName}</span>
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
