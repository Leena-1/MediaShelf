const mongoose = require('mongoose');

const LibraryItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Type is required (Movie or Book)'],
      enum: {
        values: ['Movie', 'Book'],
        message: '{VALUE} is not a valid item type'
      }
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true
    },
    authorOrDirector: {
      type: String,
      required: [true, 'Author/Director is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    poster: {
      type: String,
      trim: true,
      default: ''
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [1800, 'Year must be after 1800'],
      max: [new Date().getFullYear() + 5, 'Year cannot be in the far future']
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Plan to Watch', 'Watching', 'Completed', 'On Hold'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Plan to Watch'
    },
    favorite: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    },
    deleted: {
      type: Boolean,
      default: false // for Soft Delete / Trash system
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index scoped per user
LibraryItemSchema.index({ createdBy: 1, type: 1, title: 1 });

module.exports = mongoose.model('LibraryItem', LibraryItemSchema);
