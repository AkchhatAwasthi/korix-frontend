import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Users, Shield, Eye, User } from 'lucide-react';
import { projectsService } from '../api/projects';
import './Dashboard.css';

type TeamMember = { id: string; name: string | null; email: string; role: string; projectName: string; projectId: string; };

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ADMIN:  { label: 'Admin',  color: '#A5B4FC', icon: <Shield size={11} /> },
  MEMBER: { label: 'Member', color: 'var(--accent-green)', icon: <User size={11} /> },
  VIEWER: { label: 'Viewer', color: 'var(--text-tertiary)', icon: <Eye size={11} /> },
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const pd = await projectsService.getProjects();
        const projects = pd.projects || [];
        const details = await Promise.all(
          projects.map(async (p: any) => {
            const d = await projectsService.getProjectById(p.id);
            return { ...d.project, id: p.id, name: p.name };
          })
        );
        const flat = details.flatMap((project: any) =>
          (project.members || []).map((m: any) => ({
            id: `${project.id}-${m.user.id}`,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
            projectName: project.name,
            projectId: project.id,
          }))
        );
        setMembers(flat);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Deduplicate by email for the "people" view
  const people = Array.from(
    members.reduce((map, m) => {
      if (!map.has(m.email)) map.set(m.email, { ...m, projects: [{ name: m.projectName, id: m.projectId, role: m.role }] });
      else map.get(m.email).projects.push({ name: m.projectName, id: m.projectId, role: m.role });
      return map;
    }, new Map<string, any>()).values()
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Team" subtitle="Everyone contributing across your workspace." />

        <div className="page-container dashboard-container">
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title"><Users size={17} /> People ({people.length})</h3>
            </div>

            {loading ? (
              <div className="empty-state">Loading team…</div>
            ) : people.length === 0 ? (
              <div className="empty-state">No team members yet. Invite from a project page.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {people.map(person => {
                  const initials = (person.name || person.email).charAt(0).toUpperCase();
                  return (
                    <div key={person.email} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: '50%',
                          background: 'var(--accent-gradient)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>{initials}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {person.name || 'Unnamed'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {person.email}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {person.projects.map((proj: any) => {
                          const rc = ROLE_CONFIG[proj.role] || ROLE_CONFIG.MEMBER;
                          return (
                            <div key={proj.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {proj.name}
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 600, color: rc.color, flexShrink: 0, background: `${rc.color}18`, padding: '0.15rem 0.45rem', borderRadius: 99 }}>
                                {rc.icon}{rc.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
