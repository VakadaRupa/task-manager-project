import React from 'react';
import { Edit2, Trash2, CheckCircle, Circle, User } from 'lucide-react';

const TaskCard = ({ task, onToggleStatus, onEdit, onDelete, isAdminView = false }) => {
  const isCompleted = task.status === 'Completed';

  return (
    <div className={`task-card ${isCompleted ? 'completed' : 'pending'}`}>
      <div className="task-card-header">
        <button 
          className={`status-toggle ${isCompleted ? 'completed' : 'pending'}`}
          onClick={() => onToggleStatus(task)}
          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        >
          {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
        </button>
        <h3 className={`task-title ${isCompleted ? 'strike' : ''}`}>{task.title}</h3>
      </div>

      {task.description && (
        <p className={`task-desc ${isCompleted ? 'strike' : ''}`}>
          {task.description}
        </p>
      )}

      <div className="task-card-footer">
        {isAdminView && task.assignedTo && (
          <div className="task-assignee">
            <User size={14} />
            <span>{task.assignedTo.name || task.assignedTo.email}</span>
          </div>
        )}
        
        <div className="task-actions">
          {/* Only allow edit for non-admin views or if owned. Usually edit is for user's own tasks */}
          {!isAdminView && (
            <button className="action-btn edit-btn" onClick={() => onEdit(task)} title="Edit Task">
              <Edit2 size={16} />
            </button>
          )}
          
          <button className="action-btn delete-btn" onClick={() => onDelete(task._id)} title="Delete Task">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
