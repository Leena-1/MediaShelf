const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LibraryItem'
      }
    ],
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

CollectionSchema.index({ createdBy: 1, name: 1 });

module.exports = mongoose.model('Collection', CollectionSchema);
