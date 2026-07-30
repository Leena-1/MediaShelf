const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, details) => {
  try {
    await ActivityLog.create({ userId, action, details });
  } catch (err) {
    console.error('Activity logging failed:', err.message);
  }
};

module.exports = { logActivity };
