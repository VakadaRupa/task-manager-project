import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import { Plus, FolderKanban, CheckSquare, Clock, Filter, AlertCircle } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Pending', 'Completed'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      setTasks([response.data, ...tasks]);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const response = await api.put(`/tasks/${selectedTask._id}`, taskData);
      setTasks(tasks.map(t => t._id === selectedTask._id ? response.data : t));
      setSelectedTask(null);
    } catch (err) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      const response = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? response.data : t));
    } catch (err) {
      setError(err.message || 'Failed to toggle task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Form submit handler for Modal (either create or update)
  const handleModalSubmit = (taskData) => {
    if (selectedTask) {
      handleUpdateTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-section">
        <div>
          <h1>Welcome, {user?.name}!</h1>
          <p className="subtitle">Manage your personal tasks and track progress.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </header>

      {/* Mini Stats Summary */}
      <section className="stats-row">
        <div className="stat-box glass">
          <div className="stat-icon purple">
            <FolderKanban size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-number">{totalCount}</span>
          </div>
        </div>

        <div className="stat-box glass">
          <div className="stat-icon green">
            <CheckSquare size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Completed</span>
            <span className="stat-number">{completedCount}</span>
          </div>
        </div>

        <div className="stat-box glass">
          <div className="stat-icon orange">
            <Clock size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Pending</span>
            <span className="stat-number">{pendingCount}</span>
          </div>
        </div>
      </section>

      {/* Search and Filters Bar */}
      <div className="filter-bar glass">
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'All' ? 'active' : ''}`}
            onClick={() => setFilterStatus('All')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className="close-alert" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {/* Task Grid */}
      {loading ? (
        <div className="loading-spinner">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state glass">
          <FolderKanban size={48} className="empty-icon" />
          <h3>No tasks found</h3>
          <p>
            {searchQuery || filterStatus !== 'All' 
              ? "Try adjusting your search or filters." 
              : "Click 'New Task' to get started and create your first task!"}
          </p>
        </div>
      ) : (
        <div className="task-grid">
          {filteredTasks.map(task => (
            <TaskCard 
              key={task._id} 
              task={task} 
              onToggleStatus={handleToggleStatus} 
              onEdit={openEditModal} 
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Task Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        task={selectedTask}
      />
    </div>
  );
};

export default UserDashboard;
