import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, AlertCircle } from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/logs');
      setLogs(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch activity logs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-section">
        <div>
          <h1>Activity Logs</h1>
          <p className="subtitle">Audit ledger documenting action logs, user details, and event timestamps.</p>
        </div>
      </header>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className="close-alert" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Fetching audit trails...</div>
      ) : (
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
  );
};

export default ActivityLogs;
