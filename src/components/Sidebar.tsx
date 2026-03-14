import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, FolderKanban, CheckSquare, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logoutState } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutState();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'Projects', icon: <FolderKanban size={20} />, path: '/projects' },
    { label: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks' },
    { label: 'Team', icon: <Users size={20} />, path: '/team' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Sparkles size={24} className="brand-icon" />
        <span className="brand-text">Korix <span className="text-gradient">AI</span></span>
      </div>

      <div className="workspace-selector">
        <div className="workspace-info">
          <span className="workspace-label">Current Workspace</span>
          <span className="workspace-name">My Workspace</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item, idx) => (
            <li key={idx} className="nav-item">
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive || (isActive && item.path === '/dashboard') ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-separator"></div>

        <ul className="nav-list">
          <li className="nav-item">
            <a href="#" className="nav-link">
              <Settings size={20} />
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.email}</span>
          </div>
        </div>
        <button className="logout-btn" title="Sign Out" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
