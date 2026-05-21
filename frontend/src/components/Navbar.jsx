import React, { useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, ShieldCheck, ListTodo, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <ListTodo size={28} className="logo-icon" />
        <span className="logo-text">TaskSphere</span>
      </div>

      <div className="navbar-links">
        {user.role === 'User' && (
          <Link 
            to="/dashboard" 
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <ListTodo size={18} />
            <span>My Tasks</span>
          </Link>
        )}

        {user.role === 'Admin' && (
          <>
            <Link 
              to="/dashboard?tab=users" 
              className={`nav-link ${location.pathname === '/dashboard' && (new URLSearchParams(location.search).get('tab') === 'users' || !new URLSearchParams(location.search).get('tab')) ? 'active' : ''}`}
            >
              <User size={18} />
              <span>User Management</span>
            </Link>
            <Link 
              to="/dashboard?tab=tasks" 
              className={`nav-link ${location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') === 'tasks' ? 'active' : ''}`}
            >
              <ListTodo size={18} />
              <span>Task Monitoring</span>
            </Link>
            <Link 
              to="/dashboard?tab=logs" 
              className={`nav-link ${location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') === 'logs' ? 'active' : ''}`}
            >
              <Activity size={18} />
              <span>Activity Logs</span>
            </Link>
          </>
        )}
      </div>

      <div className="navbar-profile">
        <div className="profile-info">
          <span className="profile-name">{user.name}</span>
          <span className={`profile-role ${user.role.toLowerCase()}`}>{user.role}</span>
        </div>
        
        <button className="logout-btn" onClick={handleLogout} title="Log Out">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
