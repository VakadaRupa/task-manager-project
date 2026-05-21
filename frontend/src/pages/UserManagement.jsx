import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, UserCheck, UserMinus, Trash2, AlertCircle } from 'lucide-react';

const UserManagement = () => {
  const { user: currentAdmin } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleUserStatus = async (userToUpdate) => {
    try {
      const newStatus = userToUpdate.status === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/admin/users/${userToUpdate._id}/status`, { status: newStatus });
      setActionSuccess(`User status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 3000);
      fetchUsers();
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
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-section">
        <div>
          <h1>User Management</h1>
          <p className="subtitle">View system users, update login permissions, or delete accounts.</p>
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
        <div className="loading-spinner">Fetching user records...</div>
      ) : (
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
                  <tr key={u._id} className={u._id === currentAdmin?.id ? 'current-user-row' : ''}>
                    <td className="user-name-cell">
                      {u.name} {u._id === currentAdmin?.id && <span className="self-tag">(You)</span>}
                    </td>
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
                      {u._id !== currentAdmin?.id ? (
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
    </div>
  );
};

export default UserManagement;
