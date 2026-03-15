import api from './axios';

export const projectsService = {
  // Create a new top-level project
  createProject: async (data: { name: string; description?: string }) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  // Get all projects for the logged in user
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data; // { projects }
  },

  // Get a specific project details (requires Admin, Member, Viewer role)
  getProjectById: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data; // { project }
  },

  // Create a subproject inside an existing project (requires Admin role on parent)
  createSubProject: async (projectId: string, data: { name: string; description?: string }) => {
    const response = await api.post(`/projects/${projectId}/subprojects`, data);
    return response.data;
  },

  // Add members via email invitation (requires Admin role)
  addMember: async (projectId: string, data: { email: string; role: 'ADMIN' | 'MEMBER' | 'VIEWER' }) => {
    const response = await api.post(`/projects/${projectId}/members`, data);
    return response.data;
  },

  // Accept a project invitation
  acceptInvite: async (token: string) => {
    const response = await api.post(`/projects/invites/accept`, { token });
    return response.data;
  },

  // Update member roles (requires Admin role)
  updateMemberRole: async (projectId: string, data: { userId: string; role: 'ADMIN' | 'MEMBER' | 'VIEWER' }) => {
    const response = await api.patch(`/projects/${projectId}/members`, data);
    return response.data;
  },

  // Get self role in a specific project
  getSelfRole: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/role`);
    return response.data; // { role }
  },

  // Ge children subprojects
  getSubProjects: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/subprojects`);
    return response.data;
  }
};
