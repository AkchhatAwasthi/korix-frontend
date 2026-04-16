import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { CheckSquare, Circle, Clock, AlertTriangle, CheckCircle2, User, Calendar } from 'lucide-react';
import { projectsService } from '../api/projects';
import { tasksService, type TaskItem } from '../api/tasks';
import './Tasks.css';

type TaskWithProject = TaskItem & { projectName: string };

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  TODO:        { label: 'To Do',      color: 'var(--text-tertiary)',  icon: <Circle size={14} /> },
  IN_PROGRESS: { label: 'In Progress',color: 'var(--accent-blue)',    icon: <Clock size={14} /> },
  IN_REVIEW:   { label: 'In Review',  color: 'var(--accent-amber)',   icon: <AlertTriangle size={14} /> },
  DONE:        { label: 'Done',       color: 'var(--accent-green)',   icon: <CheckCircle2 size={14} /> },
};

const PRIORITY_CONFIG: Record<string, { color: string }> = {
  URGENT: { color: 'var(--accent-red)' },
  HIGH:   { color: 'var(--accent-amber)' },
  MEDIUM: { color: '#A5B4FC' },
  LOW:    { color: 'var(--text-tertiary)' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const pd = await projectsService.getProjects();
        const projects = pd.projects || [];
        const groups = await Promise.all(
          projects.map(async (p: any) => {
            const td = await tasksService.getTasks(p.id);
            return (td.tasks || []).map((t: TaskItem) => ({ ...t, projectName: p.name }));
          })
        );
        setTasks(groups.flat());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);
  const statuses = ['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="tasks-container">
          <div className="tasks-card">
            <div className="tasks-header">
              <h3 className="tasks-title"><CheckSquare size={18} /> All Tasks ({filtered.length})</h3>
            </div>

            {/* Filter tabs */}
            <div className="tasks-tabs">
              {statuses.map(s => (
                <button 
                  key={s} 
                  className={`tasks-tab ${filter === s ? 'active' : ''}`} 
                  onClick={() => setFilter(s)}
                >
                  {s === 'ALL' ? 'All Tasks' : STATUS_CONFIG[s]?.label}
                </button>
              ))}
            </div>

            <div className="tasks-list">
              {loading ? (
                <div className="tasks-empty">Gathering your tasks…</div>
              ) : filtered.length === 0 ? (
                <div className="tasks-empty">No tasks found. Take a break!</div>
              ) : (
                filtered.map(task => {
                  const sc = STATUS_CONFIG[task.status];
                  const pc = PRIORITY_CONFIG[task.priority];
                  return (
                    <div key={task.id} className="global-task-item">
                      
                      {/* Top Row: Title & Priority */}
                      <div className="global-task-top">
                        <span style={{ color: sc?.color }}>{sc?.icon}</span>
                        <span className="global-task-title">{task.title}</span>
                        <span className="global-task-priority" style={{ color: pc?.color }}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="global-task-desc">{task.description}</p>
                      )}

                      {/* Meta Bottom Row */}
                      <div className="global-task-meta">
                        <Link to={`/projects/${task.projectId}`} className="global-task-project">
                          {task.projectName}
                        </Link>
                        
                        <div className="global-task-info">
                          <User size={12} />
                          <span>{task.assignee?.name || task.assignee?.email || 'Unassigned'}</span>
                        </div>
                        
                        {task.dueDate && (
                          <div className="global-task-info">
                            <Calendar size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
