import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import { Users, ListTodo, CheckSquare, Clock, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentAdmin } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="dashboard-container admin-dashboard">
      <header className="dashboard-header-section">
        <div>
          <h1>Admin Control Panel</h1>
          <p className="subtitle">System-wide monitoring, metrics, and administration.</p>
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
        <div className="loading-spinner">Loading analytics...</div>
      ) : (
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
      )}
    </div>
  );
};

export default AdminDashboard;
