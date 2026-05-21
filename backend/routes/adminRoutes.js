const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllTasksAdmin,
  getActivityLogs,
  getAnalytics
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Apply protect and adminMiddleware to all routes in this file
router.use(protect, adminMiddleware);

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/tasks', getAllTasksAdmin);
router.get('/logs', getActivityLogs);
router.get('/analytics', getAnalytics);

module.exports = router;
