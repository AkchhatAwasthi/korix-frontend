import api from './axios';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskUser {
  id: string;
  name: string | null;
  email: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  assignee: TaskUser | null;
  reporter: TaskUser;
}

export const tasksService = {
  createTask: async (
    projectId: string,
    data: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      status?: TaskStatus;
      dueDate?: string;
      assigneeId?: string | null;
    }
  ) => {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data as { message: string; task: TaskItem };
  },

  getTasks: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data as { tasks: TaskItem[] };
  },

  getTaskById: async (projectId: string, taskId: string) => {
    const response = await api.get(`/projects/${projectId}/tasks/${taskId}`);
    return response.data as { task: TaskItem };
  },

  updateTask: async (
    projectId: string,
    taskId: string,
    data: {
      title?: string;
      description?: string | null;
      priority?: TaskPriority;
      status?: TaskStatus;
      dueDate?: string | null;
      assigneeId?: string | null;
    }
  ) => {
    const response = await api.patch(`/projects/${projectId}/tasks/${taskId}`, data);
    return response.data as { message: string; task: TaskItem };
  },

  deleteTask: async (projectId: string, taskId: string) => {
    const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    return response.data as { message: string };
  },
};
