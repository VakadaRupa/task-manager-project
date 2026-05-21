const Task = require('../models/Task');
const { logActivity } = require('../utils/logger');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: req.user._id
    });

    // Log the creation
    await logActivity(req.user._id, 'CREATE_TASK', task._id, `Created task: ${title}`);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks (Admin views all, User views own)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'Admin') {
      // Admin sees all tasks, populated with the user details
      tasks = await Task.find({}).populate('assignedTo', 'name email role status');
    } else {
      // User sees only their own tasks
      tasks = await Task.find({ assignedTo: req.user._id });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findById(req.id || req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user (Admins can also update tasks if needed, but requirements state: "Users can: Update own tasks")
    if (task.assignedTo.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: You do not own this task' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    const updatedTask = await task.save();

    // Log the update
    await logActivity(
      req.user._id,
      'UPDATE_TASK',
      updatedTask._id,
      `Updated task: ${updatedTask.title} (Status: ${updatedTask.status})`
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task (Owner or Admin)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check ownership or admin status
    if (task.assignedTo.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: Cannot delete other users\' tasks' });
    }

    await Task.deleteOne({ _id: task._id });

    // Log the deletion
    await logActivity(
      req.user._id,
      'DELETE_TASK',
      task._id,
      `Deleted task: ${task.title}`
    );

    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
};
