const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const { memoryStore } = require('../utils/inMemoryStore');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @desc    Get activity logs
// @route   GET /api/activity
const getActivityLogs = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const userLogs = memoryStore.activityLogs.filter(l => l.createdBy === req.user._id || !l.createdBy);
      return res.status(200).json(userLogs);
    }

    const logs = await ActivityLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving logs', error: error.message });
  }
};

// @desc    Clear activity logs
// @route   DELETE /api/activity
const clearActivityLogs = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      memoryStore.activityLogs = memoryStore.activityLogs.filter(l => l.createdBy !== req.user._id);
      return res.status(200).json({ message: 'Logs cleared successfully' });
    }

    await ActivityLog.deleteMany({ userId: req.user._id });
    return res.status(200).json({ message: 'Logs cleared successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error clearing logs', error: error.message });
  }
};

module.exports = { getActivityLogs, clearActivityLogs };
