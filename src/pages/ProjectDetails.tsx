import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import ChatPanel from '../components/Chat/ChatPanel';
import { usePageLoading } from '../context/LoadingContext';
import {
  FolderKanban, Users, Plus, UserPlus, CheckSquare, Trash2,
  MessageSquare, ChevronRight, Circle, Clock, AlertTriangle,
  CheckCircle2, ArrowUpRight, Shield, Eye, User, GitBranch,
} from 'lucide-react';
import { projectsService } from '../api/projects';
import { tasksService, type TaskItem, type TaskPriority, type TaskStatus } from '../api/tasks';
import './ProjectDetails.css';
import '../components/Chat/ChatPanel.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'tasks' | 'subprojects' | 'members' | 'chat';

type ProjectMember = {
  id: string; role: string; createdAt: string;
  user: { id: string; name: string | null; email: string };
};

const taskStatuses: TaskStatus[]   = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const taskPriorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const STATUS_META: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  TODO:        { label: 'To Do',       color: '#8B949E', icon: <Circle size={12} /> },
  IN_PROGRESS: { label: 'In Progress', color: '#38BDF8', icon: <Clock size={12} /> },
  IN_REVIEW:   { label: 'In Review',   color: '#FBBF24', icon: <AlertTriangle size={12} /> },
  DONE:        { label: 'Done',        color: '#34D399', icon: <CheckCircle2 size={12} /> },
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: '#8B949E', MEDIUM: '#A5B4FC', HIGH: '#FBBF24', URGENT: '#F87171',
};

const ROLE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  ADMIN:  { icon: <Shield size={11} />,  color: '#A5B4FC' },
  MEMBER: { icon: <User size={11} />,    color: '#34D399' },
  VIEWER: { icon: <Eye size={11} />,     color: '#8B949E' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { start, done } = usePageLoading();

  const [project, setProject]       = useState<any>(null);
  const [subProjects, setSubProjects] = useState<any[]>([]);
  const [tasks, setTasks]           = useState<TaskItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [selfRole, setSelfRole]     = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<Tab>('overview');

  // ── Modal states ──────────────────────────────────────────────────────────
  const [taskModal, setTaskModal]       = useState(false);
  const [memberModal, setMemberModal]   = useState(false);
  const [subProjModal, setSubProjModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'MEDIUM' as TaskPriority,
    status: 'TODO' as TaskStatus, dueDate: '', assigneeId: '',
  });
  const [taskError, setTaskError]   = useState('');
  const [taskBusy, setTaskBusy]     = useState(false);

  const [memberForm, setMemberForm] = useState({ email: '', role: 'MEMBER' as 'ADMIN'|'MEMBER'|'VIEWER' });
  const [memberError, setMemberError] = useState('');
  const [memberBusy, setMemberBusy] = useState(false);
  const [memberSuccess, setMemberSuccess] = useState('');

  const [subForm, setSubForm]     = useState({ name: '', description: '' });
  const [subError, setSubError]   = useState('');
  const [subBusy, setSubBusy]     = useState(false);

  const members: ProjectMember[] = project?.members || [];
  const canManage = selfRole === 'ADMIN' || selfRole === 'MEMBER';
  const isAdmin   = selfRole === 'ADMIN';

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    start();
    const fetch = async () => {
      try {
        const [pd, rd, sd] = await Promise.all([
          projectsService.getProjectById(projectId),
          projectsService.getSelfRole(projectId),
          projectsService.getSubProjects(projectId),
        ]);
        setProject(pd.project || pd);
        setSelfRole(rd.role);
        setSubProjects(sd.subProjects || []);
        setTasksLoading(true);
        const td = await tasksService.getTasks(projectId);
        setTasks(td.tasks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTasksLoading(false);
        done();
      }
    };
    fetch();
  }, [projectId]);

  // ── Task CRUD ──────────────────────────────────────────────────────────────
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setTaskBusy(true); setTaskError('');
    try {
      const res = await tasksService.createTask(projectId, {
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate || undefined,
        assigneeId: newTask.assigneeId || null,
      });
      setTasks(t => [res.task, ...t]);
      setTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '' });
    } catch (err: any) {
      setTaskError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setTaskBusy(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Pick<TaskItem, 'status'|'priority'|'assigneeId'>>) => {
    if (!projectId) return;
    try {
      const res = await tasksService.updateTask(projectId, taskId, updates);
      setTasks(t => t.map(task => task.id === taskId ? res.task : task));
    } catch (err: any) { console.error(err); }
  };

  const deleteTask = async (taskId: string) => {
    if (!projectId) return;
    try {
      await tasksService.deleteTask(projectId, taskId);
      setTasks(t => t.filter(task => task.id !== taskId));
    } catch (err: any) { console.error(err); }
  };

  // ── Member invite ──────────────────────────────────────────────────────────
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setMemberBusy(true); setMemberError(''); setMemberSuccess('');
    try {
      await projectsService.addMember(projectId, memberForm);
      setMemberSuccess(`Invitation sent to ${memberForm.email}`);
      setMemberForm({ email: '', role: 'MEMBER' });
    } catch (err: any) {
      setMemberError(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setMemberBusy(false);
    }
  };

  // ── Sub-project create ─────────────────────────────────────────────────────
  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !subForm.name.trim()) return;
    setSubBusy(true); setSubError('');
    try {
      await projectsService.createSubProject(projectId, { name: subForm.name, description: subForm.description });
      const sd = await projectsService.getSubProjects(projectId);
      setSubProjects(sd.subProjects || []);
      setSubProjModal(false);
      setSubForm({ name: '', description: '' });
    } catch (err: any) {
      setSubError(err.response?.data?.message || 'Failed to create');
    } finally {
      setSubBusy(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content pd-skeleton-wrap">
        <div className="pd-skeleton-header" />
        <div className="pd-skeleton-tabs" />
        <div className="pd-skeleton-body" />
      </div>
    </div>
  );

  if (!project) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <FolderKanban size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>Project not found or access denied.</p>
          <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/projects')}>
            Back to Projects
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* ── Project Header ───────────────────────────────────────────── */}
          <div className="pd-header">
          <div className="pd-breadcrumb">
            <Link to="/projects" className="pd-bc-link">Projects</Link>
            <ChevronRight size={14} className="pd-bc-sep" />
            <span className="pd-bc-current">{project.name}</span>
          </div>

          <div className="pd-header-main">
            <div className="pd-title-row">
              <div className="pd-project-icon"><FolderKanban size={20} /></div>
              <h1 className="pd-title">{project.name}</h1>
              {selfRole && (
                <span className="pd-role-chip" style={{ color: ROLE_META[selfRole]?.color }}>
                  {ROLE_META[selfRole]?.icon} {selfRole}
                </span>
              )}
            </div>
            {project.description && (
              <p className="pd-description">{project.description}</p>
            )}
            <div className="pd-meta-row">
              <span className="pd-meta-pill"><Users size={12} /> {members.length} member{members.length !== 1 ? 's' : ''}</span>
              <span className="pd-meta-pill"><CheckSquare size={12} /> {tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              <span className="pd-meta-pill"><GitBranch size={12} /> {subProjects.length} sub-project{subProjects.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pd-header-actions">
            {isAdmin && (
              <button className="btn btn-outline btn-sm" onClick={() => { setMemberModal(true); setMemberSuccess(''); setMemberError(''); }}>
                <UserPlus size={14} /> Invite Member
              </button>
            )}
            {isAdmin && (
              <button className="btn btn-outline btn-sm" onClick={() => { setSubProjModal(true); setSubError(''); }}>
                <GitBranch size={14} /> New Sub-Project
              </button>
            )}
            {canManage && (
              <button className="btn btn-accent btn-sm" onClick={() => { setTaskModal(true); setTaskError(''); }}>
                <Plus size={14} /> New Task
              </button>
            )}
          </div>

          {/* ── Tab Navigation (Jira style) ────────────────────────── */}
          <nav className="pd-tabs">
            {([
              { id: 'overview',     label: 'Summary',      icon: <FolderKanban size={14} /> },
              { id: 'tasks',        label: `Board`,        icon: <CheckSquare size={14} />,  count: tasks.length },
              { id: 'subprojects',  label: 'Sub-projects', icon: <GitBranch size={14} />,    count: subProjects.length },
              { id: 'members',      label: 'Team',         icon: <Users size={14} />,        count: members.length },
              { id: 'chat',         label: 'Team Chat',    icon: <MessageSquare size={14} /> },
            ] as { id: Tab; label: string; icon: React.ReactNode; count?: number }[]).map(tab => (
              <button
                key={tab.id}
                className={`pd-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && <span className="pd-tab-count">{tab.count}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab Body ─────────────────────────────────────────────────── */}
        <div className="pd-body">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="pd-overview-grid">
              <div className="pd-overview-main">
                <div className="pd-card">
                  <h3 className="pd-card-title">About this project</h3>
                  <p className="pd-card-text">{project.description || 'No description provided.'}</p>
                  <div className="pd-card-divider" />
                  <div className="pd-detail-rows">
                    <div className="pd-detail-row">
                      <span className="pd-detail-label">Created</span>
                      <span className="pd-detail-value">{new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="pd-detail-row">
                      <span className="pd-detail-label">Your role</span>
                      <span className="pd-detail-value" style={{ color: ROLE_META[selfRole || 'VIEWER']?.color }}>{selfRole}</span>
                    </div>
                    <div className="pd-detail-row">
                      <span className="pd-detail-label">Members</span>
                      <span className="pd-detail-value">{members.length}</span>
                    </div>
                  </div>
                </div>

                {/* Recent tasks preview */}
                <div className="pd-card">
                  <div className="pd-card-head">
                    <h3 className="pd-card-title">Recent Tasks</h3>
                    <button className="pd-card-link" onClick={() => setActiveTab('tasks')}>View all <ArrowUpRight size={12} /></button>
                  </div>
                  {tasksLoading ? <p className="pd-empty">Loading…</p> : tasks.length === 0 ? (
                    <p className="pd-empty">No tasks yet.</p>
                  ) : (
                    <div className="pd-task-list">
                      {tasks.slice(0, 5).map(task => (
                        <div key={task.id} className="pd-task-row">
                          <span style={{ color: STATUS_META[task.status]?.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {STATUS_META[task.status]?.icon}
                          </span>
                          <span className="pd-task-title">{task.title}</span>
                          <span className="pd-task-priority" style={{ color: PRIORITY_COLOR[task.priority] }}>{task.priority}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pd-overview-side">
                {/* Members */}
                <div className="pd-card">
                  <div className="pd-card-head">
                    <h3 className="pd-card-title">Members</h3>
                    <button className="pd-card-link" onClick={() => setActiveTab('members')}>View all <ArrowUpRight size={12} /></button>
                  </div>
                  <div className="pd-members-mini">
                    {members.slice(0, 6).map(m => (
                      <div key={m.id} className="pd-member-mini-row">
                        <div className="pd-avatar">{(m.user.name || m.user.email).charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="pd-member-name">{m.user.name || m.user.email}</div>
                          <div className="pd-member-role" style={{ color: ROLE_META[m.role]?.color }}>
                            {ROLE_META[m.role]?.icon} {m.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-projects */}
                {subProjects.length > 0 && (
                  <div className="pd-card">
                    <div className="pd-card-head">
                      <h3 className="pd-card-title">Sub-Projects</h3>
                      <button className="pd-card-link" onClick={() => setActiveTab('subprojects')}>View all <ArrowUpRight size={12} /></button>
                    </div>
                    {subProjects.slice(0, 4).map(sub => (
                      <Link key={sub.id} to={`/projects/${sub.id}`} className="pd-sub-row">
                        <GitBranch size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                        <span>{sub.name}</span>
                        <ArrowUpRight size={12} style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="pd-card pd-tasks-wrap">
              <div className="pd-card-head" style={{ marginBottom: '1rem' }}>
                <h3 className="pd-card-title"><CheckSquare size={15} /> Tasks ({tasks.length})</h3>
                {canManage && (
                  <button className="btn btn-accent btn-sm" onClick={() => { setTaskModal(true); setTaskError(''); }}>
                    <Plus size={14} /> New Task
                  </button>
                )}
              </div>

              {/* Kanban-style status columns */}
              <div className="pd-kanban">
                {taskStatuses.map(status => {
                  const col = tasks.filter(t => t.status === status);
                  const meta = STATUS_META[status];
                  return (
                    <div key={status} className="pd-kanban-col">
                      <div className="pd-kanban-col-header" style={{ borderTopColor: meta.color }}>
                        <span style={{ color: meta.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                          {meta.icon} {meta.label}
                        </span>
                        <span className="pd-kanban-count">{col.length}</span>
                      </div>

                      {tasksLoading ? (
                        <div className="pd-empty">Loading…</div>
                      ) : col.length === 0 ? (
                        <div className="pd-empty" style={{ padding: '1rem' }}>—</div>
                      ) : (
                        col.map(task => (
                          <div key={task.id} className="pd-kanban-card">
                            <div className="pd-kanban-card-top">
                              <span className="pd-kanban-task-title">{task.title}</span>
                              <span className="pd-kanban-priority" style={{ color: PRIORITY_COLOR[task.priority] }}>
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <p className="pd-kanban-desc">{task.description}</p>
                            )}
                            <div className="pd-kanban-meta">
                              <span>{task.assignee?.name || task.assignee?.email || 'Unassigned'}</span>
                              {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                            </div>

                            {canManage && (
                              <div className="pd-kanban-actions">
                                <select
                                  className="pd-inline-select"
                                  value={task.status}
                                  onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                                >
                                  {taskStatuses.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                                </select>
                                <select
                                  className="pd-inline-select"
                                  value={task.assigneeId || ''}
                                  onChange={e => updateTask(task.id, { assigneeId: e.target.value || null })}
                                >
                                  <option value="">Unassigned</option>
                                  {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name || m.user.email}</option>)}
                                </select>
                                <button className="pd-delete-btn" onClick={() => deleteTask(task.id)} title="Delete task">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-PROJECTS TAB */}
          {activeTab === 'subprojects' && (
            <div className="pd-card">
              <div className="pd-card-head" style={{ marginBottom: '1rem' }}>
                <h3 className="pd-card-title"><GitBranch size={15} /> Sub-Projects ({subProjects.length})</h3>
                {isAdmin && (
                  <button className="btn btn-primary-blue btn-sm" onClick={() => { setSubProjModal(true); setSubError(''); }}>
                    <Plus size={14} /> New Sub-Project
                  </button>
                )}
              </div>
              {subProjects.length === 0 ? (
                <div className="pd-empty" style={{ padding: '2rem' }}>No sub-projects yet.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {subProjects.map(sub => (
                    <Link key={sub.id} to={`/projects/${sub.id}`} style={{ textDecoration: 'none' }}>
                      <div className="pd-sub-card">
                        <div className="pd-sub-card-icon"><GitBranch size={16} /></div>
                        <div>
                          <div className="pd-sub-card-name">{sub.name}</div>
                          <div className="pd-sub-card-meta">{sub.description || 'No description'}</div>
                          <div className="pd-sub-card-date">{new Date(sub.createdAt).toLocaleDateString()}</div>
                        </div>
                        <ArrowUpRight size={14} className="pd-sub-card-arrow" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="pd-card">
              <div className="pd-card-head" style={{ marginBottom: '1rem' }}>
                <h3 className="pd-card-title"><Users size={15} /> Members ({members.length})</h3>
                {isAdmin && (
                  <button className="btn btn-primary-blue btn-sm" onClick={() => { setMemberModal(true); setMemberSuccess(''); setMemberError(''); }}>
                    <UserPlus size={14} /> Invite Member
                  </button>
                )}
              </div>
              <div className="pd-member-table">
                <div className="pd-member-table-head">
                  <span>Member</span><span>Role</span><span>Joined</span>
                </div>
                {members.map(m => {
                  const rm = ROLE_META[m.role] || ROLE_META.VIEWER;
                  return (
                    <div key={m.id} className="pd-member-table-row">
                      <div className="pd-member-cell">
                        <div className="pd-avatar">{(m.user.name || m.user.email).charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="pd-member-name">{m.user.name || 'Unnamed'}</div>
                          <div className="pd-member-email">{m.user.email}</div>
                        </div>
                      </div>
                      <div>
                        <span className="pd-role-pill" style={{ color: rm.color, background: `${rm.color}15`, borderColor: `${rm.color}30` }}>
                          {rm.icon} {m.role}
                        </span>
                      </div>
                      <div className="pd-member-joined">{new Date(m.createdAt).toLocaleDateString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <ChatPanel projectId={project.id} />
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ── Modals ───────────────────────────────────────────────────────── */}

      {/* New Task Modal */}
      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="input-group">
            <label className="input-label">Title *</label>
            <input className="input-field" placeholder="What needs to be done?" required autoFocus
              value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea className="input-field" rows={3} placeholder="More details…"
              value={newTask.description} onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Priority</label>
              <select className="input-field" value={newTask.priority}
                onChange={e => setNewTask(t => ({ ...t, priority: e.target.value as TaskPriority }))}>
                {taskPriorities.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Status</label>
              <select className="input-field" value={newTask.status}
                onChange={e => setNewTask(t => ({ ...t, status: e.target.value as TaskStatus }))}>
                {taskStatuses.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Assignee</label>
              <select className="input-field" value={newTask.assigneeId}
                onChange={e => setNewTask(t => ({ ...t, assigneeId: e.target.value }))}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name || m.user.email}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Due Date</label>
              <input type="date" className="input-field" value={newTask.dueDate}
                onChange={e => setNewTask(t => ({ ...t, dueDate: e.target.value }))} />
            </div>
          </div>
          {taskError && <div className="error-message">{taskError}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setTaskModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={taskBusy}>
              <Plus size={14} /> {taskBusy ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Member Modal */}
      <Modal open={memberModal} onClose={() => setMemberModal(false)} title="Invite Member">
        <form onSubmit={handleInviteMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="input-group">
            <label className="input-label">Email Address *</label>
            <input type="email" className="input-field" placeholder="colleague@company.com" required autoFocus
              value={memberForm.email} onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Role</label>
            <select className="input-field" value={memberForm.role}
              onChange={e => setMemberForm(f => ({ ...f, role: e.target.value as any }))}>
              <option value="VIEWER">Viewer — can view only</option>
              <option value="MEMBER">Member — can create & edit tasks</option>
              <option value="ADMIN">Admin — full control</option>
            </select>
          </div>
          {memberError  && <div className="error-message">{memberError}</div>}
          {memberSuccess && <div style={{ padding: '0.65rem', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 8, fontSize: '0.82rem', color: '#6EE7B7' }}>{memberSuccess}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setMemberModal(false)}>Close</button>
            <button type="submit" className="btn btn-accent" disabled={memberBusy}>
              <UserPlus size={14} /> {memberBusy ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </form>
      </Modal>

      {/* New Sub-Project Modal */}
      <Modal open={subProjModal} onClose={() => setSubProjModal(false)} title="Create Sub-Project">
        <form onSubmit={handleCreateSub} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="input-group">
            <label className="input-label">Name *</label>
            <input className="input-field" placeholder="Sub-project name" required autoFocus
              value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea className="input-field" rows={2} placeholder="Optional"
              value={subForm.description} onChange={e => setSubForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          {subError && <div className="error-message">{subError}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setSubProjModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={subBusy}>
              <Plus size={14} /> {subBusy ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
