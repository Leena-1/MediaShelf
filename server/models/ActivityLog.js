const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
