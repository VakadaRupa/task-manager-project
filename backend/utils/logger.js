const ActivityLog = require('../models/ActivityLog');

/**
 * Utility function to log user actions in the database
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action type: LOGIN, CREATE_TASK, UPDATE_TASK, DELETE_TASK
 * @param {string} [taskId] - Optional ID of the task associated with the action
 * @param {string} [details] - Optional extra details about the action
 */
const logActivity = async (userId, action, taskId = null, details = null) => {
  try {
    const logData = {
      userId,
      action
    };
    if (taskId) logData.taskId = taskId;
    if (details) logData.details = details;

    await ActivityLog.create(logData);
  } catch (error) {
    console.error(`Failed to log activity: ${error.message}`);
  }
};

module.exports = { logActivity };
