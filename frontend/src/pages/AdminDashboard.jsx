import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import { 
  Users, 
  ListTodo, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  UserMinus, 
  Trash2,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'tasks', 'logs'
  
  // Data states
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);

  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [analyticsRes, usersRes, tasksRes, logsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/tasks'),
        api.get('/admin/logs')
      ]);

      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
      setLogs(logsRes.data);
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (userToUpdate) => {
    try {
      const newStatus = userToUpdate.status === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/admin/users/${userToUpdate._id}/status`, { status: newStatus });
      setActionSuccess(`User status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 3000);
      loadData(); // Reload all data to keep counts in sync
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Warning: Deleting a user will permanently remove their tasks and activity logs. Proceed?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setActionSuccess('User and their data deleted successfully');
      setTimeout(() => setActionSuccess(''), 3000);
      loadData(); // Reload all data to keep counts in sync
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteTaskAdmin = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setActionSuccess('Task removed successfully');
      setTimeout(() => setActionSuccess(''), 3000);
      loadData(); // Reload all data to keep counts in sync
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  return (
    <div className="dashboard-container admin-dashboard">
      <header className="dashboard-header-section">
        <div>
          <h1>Admin Control Panel</h1>
          <p className="subtitle">System-wide monitoring, user management, and activity auditing.</p>
        </div>
      </header>

      {/* Analytics Cards - Always visible at the top */}
      <section className="metrics-grid">
        <MetricCard 
          title="Total Users" 
          value={analytics.totalUsers} 
          icon={Users} 
          colorClass="metric-purple" 
        />
        <MetricCard 
          title="Total Tasks" 
          value={analytics.totalTasks} 
          icon={ListTodo} 
          colorClass="metric-blue" 
        />
        <MetricCard 
          title="Completed Tasks" 
          value={analytics.completedTasks} 
          icon={CheckSquare} 
          colorClass="metric-green" 
        />
        <MetricCard 
          title="Pending Tasks" 
          value={analytics.pendingTasks} 
          icon={Clock} 
          colorClass="metric-orange" 
        />
      </section>

      {/* Tabs Navigation for 3 Required Sections */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>User Management</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <ListTodo size={16} />
          <span>Task Monitoring</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Activity size={16} />
          <span>Activity Logs</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className="close-alert" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {actionSuccess && (
        <div className="alert alert-success">
          <span>{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Fetching record data...</div>
      ) : (
        <div className="tab-content-area">
          {/* User Management View */}
          {activeTab === 'users' && (
            <div className="users-tab glass">
              <div className="table-header">
                <h2>Registered Users ({users.length})</h2>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="actions-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className={u._id === currentAdmin._id ? 'current-user-row' : ''}>
                        <td className="user-name-cell">{u.name} {u._id === currentAdmin._id && <span className="self-tag">(You)</span>}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${u.status === 'Active' ? 'active' : 'inactive'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          {u._id !== currentAdmin._id ? (
                            <>
                              <button 
                                className={`action-btn-pill ${u.status === 'Active' ? 'deactivate-btn' : 'activate-btn'}`}
                                onClick={() => handleToggleUserStatus(u)}
                              >
                                {u.status === 'Active' ? <UserMinus size={14} /> : <UserCheck size={14} />}
                                <span>{u.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                              </button>

                              <button 
                                className="action-btn-pill delete-btn"
                                onClick={() => handleDeleteUser(u._id)}
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-muted">No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Task Monitoring View */}
          {activeTab === 'tasks' && (
            <div className="tasks-tab glass">
              <div className="table-header">
                <h2>All System Tasks ({tasks.length})</h2>
              </div>
              
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <ListTodo size={48} className="empty-icon" />
                  <h3>No tasks logged in database</h3>
                  <p>When users create tasks, they will appear here in real-time.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Created By</th>
                        <th>Status</th>
                        <th className="actions-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map(t => (
                        <tr key={t._id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>{t.title}</div>
                            {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.description}</div>}
                          </td>
                          <td>{t.assignedTo ? `${t.assignedTo.name} (${t.assignedTo.email})` : 'Unknown'}</td>
                          <td>
                            <span className={`status-badge ${t.status === 'Completed' ? 'active' : 'warning'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button 
                              className="action-btn-pill delete-btn"
                              onClick={() => handleDeleteTaskAdmin(t._id)}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Activity Logs View */}
          {activeTab === 'logs' && (
            <div className="logs-tab glass">
              <div className="table-header">
                <h2>User Activity Audit Trails ({logs.length})</h2>
              </div>
              <div className="table-responsive">
                <table className="admin-table logs-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Action</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">No activity recorded yet</td>
                      </tr>
                    ) : (
                      logs.map(log => (
                        <tr key={log._id}>
                          <td className="user-info-cell">
                            {log.userId ? (
                              <>
                                <span className="log-user-name">{log.userId.name}</span>
                                <span className="log-user-email">{log.userId.email}</span>
                              </>
                            ) : (
                              <span className="text-muted">Deleted User</span>
                            )}
                          </td>
                          <td>
                            <span className={`log-action-badge ${log.action.toLowerCase()}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="timestamp-cell">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
