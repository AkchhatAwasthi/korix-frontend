import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { CheckSquare } from 'lucide-react';
import { projectsService } from '../api/projects';
import { tasksService, type TaskItem } from '../api/tasks';
import './Dashboard.css';

type TaskWithProject = TaskItem & {
  projectName: string;
};

type ProjectSummary = {
  id: string;
  name: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const projectData = await projectsService.getProjects();
        const projects: ProjectSummary[] = projectData.projects || [];

        const taskGroups = await Promise.all(
          projects.map(async (project) => {
            const taskData = await tasksService.getTasks(project.id);
            return (taskData.tasks || []).map((task) => ({
              ...task,
              projectName: project.name,
            }));
          })
        );

        setTasks(taskGroups.flat());
      } catch (error) {
        console.error('Failed to load tasks', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Tasks" subtitle="A cross-project view of what is assigned, active, and due next." />

        <div className="page-container dashboard-container">
          <section className="card section-card">
            <div className="section-header">
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={20} /> All Tasks
              </h3>
            </div>

            <div className="projects-list">
              {loading ? (
                <p>Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p>No tasks yet. Open a project and assign the first task from there.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="project-item">
                    <div className="project-info" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <h4 className="project-name" style={{ marginBottom: '0.35rem' }}>{task.title}</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {task.description || 'No description'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <span className="status-badge status-in-progress">{task.priority}</span>
                        <span className="status-badge status-planning">{task.status.replaceAll('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="project-meta" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <span className="meta-text">
                        <Link to={`/projects/${task.projectId}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                          {task.projectName}
                        </Link>
                      </span>
                      <span className="meta-text">Assignee: {task.assignee?.name || task.assignee?.email || 'Unassigned'}</span>
                      <span className="meta-text">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
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
