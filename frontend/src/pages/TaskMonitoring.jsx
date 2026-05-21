import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ListTodo, Trash2, AlertCircle } from 'lucide-react';

const TaskMonitoring = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDeleteTaskAdmin = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setActionSuccess('Task removed successfully');
      setTimeout(() => setActionSuccess(''), 3000);
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-section">
        <div>
          <h1>Task Monitoring</h1>
          <p className="subtitle">Audit and delete any user tasks within the task manager system.</p>
        </div>
      </header>

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
        <div className="loading-spinner">Fetching task records...</div>
      ) : (
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
                        {t.description && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td>{t.createdBy ? `${t.createdBy.name} (${t.createdBy.email})` : 'Unknown'}</td>
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
    </div>
  );
};

export default TaskMonitoring;
