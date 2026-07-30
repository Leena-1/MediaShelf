const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryItem',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

ReviewSchema.index({ itemId: 1, userId: 1 });

module.exports = mongoose.model('Review', ReviewSchema);
