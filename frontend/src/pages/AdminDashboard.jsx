import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import TaskCard from '../components/TaskCard';
import { 
  Users, 
  Activity, 
  ListTodo, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  UserMinus, 
  Trash2, 
  TrendingUp 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'users', 'tasks', 'logs'
  
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

  const fetchAnalytics = async () => {
    const response = await api.get('/admin/analytics');
    setAnalytics(response.data);
  };

  const fetchUsers = async () => {
    const response = await api.get('/admin/users');
    setUsers(response.data);
  };

  const fetchTasks = async () => {
    const response = await api.get('/admin/tasks');
    setTasks(response.data);
  };

  const fetchLogs = async () => {
    const response = await api.get('/admin/logs');
    setLogs(response.data);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'analytics') {
        await fetchAnalytics();
      } else if (activeTab === 'users') {
        await fetchUsers();
      } else if (activeTab === 'tasks') {
        await fetchTasks();
      } else if (activeTab === 'logs') {
        await fetchLogs();
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleToggleUserStatus = async (userToUpdate) => {
    try {
      const newStatus = userToUpdate.status === 'Active' ? 'Inactive' : 'Active';
      const response = await api.put(`/admin/users/${userToUpdate._id}/status`, { status: newStatus });
      
      setUsers(users.map(u => u._id === userToUpdate._id ? response.data : u));
      setActionSuccess(`User status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Warning: Deleting a user will permanently remove their tasks and activity logs. Proceed?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setActionSuccess('User and their data deleted successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteTaskAdmin = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      setActionSuccess('Task removed successfully');
      setTimeout(() => setActionSuccess(''), 3000);
      
      // Update local analytics counters if we delete a task while in task view
      setAnalytics(prev => ({
        ...prev,
        totalTasks: prev.totalTasks - 1
      }));
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleToggleTaskStatusAdmin = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      const response = await api.put(`/tasks/${task._id}`, { status: newStatus });
      
      // Update tasks state
      setTasks(tasks.map(t => t._id === task._id ? { ...response.data, assignedTo: task.assignedTo } : t));
    } catch (err) {
      setError(err.message || 'Failed to toggle task status');
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

      {/* Tabs Navigation */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={16} />
          <span>System Analytics</span>
        </button>
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

      {/* Tab Contents */}
      {loading ? (
        <div className="loading-spinner">Fetching record data...</div>
      ) : (
        <div className="tab-content-area">
          {/* Analytics View */}
          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <div className="metrics-grid">
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
              </div>

              {/* Quick Summary Section */}
              <div className="analytics-visuals glass">
                <h3>System Performance Summary</h3>
                <div className="progress-container">
                  <div className="progress-label">
                    <span>Task Completion Rate</span>
                    <span>
                      {analytics.totalTasks > 0 
                        ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${analytics.totalTasks > 0 
                          ? (analytics.completedTasks / analytics.totalTasks) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="metrics-summary-cards">
                  <div className="summary-card">
                    <h4>Active User Pool</h4>
                    <p>All users in system database currently have system logins enabled.</p>
                  </div>
                  <div className="summary-card">
                    <h4>Real-time Activity Logs</h4>
                    <p>Security logging tracks modifications, deletions, and active sessions.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      <th>Created At</th>
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
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
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
            <div className="tasks-tab">
              <div className="table-header glass mb-4">
                <h2>All System Tasks ({tasks.length})</h2>
              </div>

              {tasks.length === 0 ? (
                <div className="empty-state glass">
                  <ListTodo size={48} className="empty-icon" />
                  <h3>No tasks logged in database</h3>
                  <p>When users create tasks, they will appear here in real-time.</p>
                </div>
              ) : (
                <div className="task-grid">
                  {tasks.map(task => (
                    <TaskCard 
                      key={task._id} 
                      task={task} 
                      onToggleStatus={handleToggleTaskStatusAdmin} 
                      onEdit={() => {}} 
                      onDelete={handleDeleteTaskAdmin}
                      isAdminView={true}
                    />
                  ))}
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
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Task Title</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">No activity recorded yet</td>
                      </tr>
                    ) : (
                      logs.map(log => (
                        <tr key={log._id}>
                          <td className="timestamp-cell">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
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
                          <td>
                            {log.taskId ? (
                              <span className="log-task-title">{log.taskId.title}</span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="details-cell">{log.details || 'N/A'}</td>
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
