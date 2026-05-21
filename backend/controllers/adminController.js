const User = require('../models/User');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @desc    View all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Must be Active or Inactive' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && status === 'Inactive') {
      return res.status(400).json({ message: 'You cannot deactivate your own admin account' });
    }

    user.status = status;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    // Delete user's tasks
    await Task.deleteMany({ createdBy: user._id });

    // Delete user's activity logs
    await ActivityLog.deleteMany({ userId: user._id });

    await User.deleteOne({ _id: user._id });

    res.json({ message: 'User and all their associated tasks and logs removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    View all tasks
// @route   GET /api/admin/tasks
// @access  Private/Admin
const getAllTasksAdmin = async (req, res) => {
  try {
    const tasks = await Task.find({}).populate('createdBy', 'name email role status');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    View activity logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
  try {
    // Get logs and populate user and task details
    const logs = await ActivityLog.find({})
      .populate('userId', 'name email role')
      .populate('taskId', 'title')
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalTasks = await Task.countDocuments({});
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });

    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllTasksAdmin,
  getActivityLogs,
  getAnalytics
};
