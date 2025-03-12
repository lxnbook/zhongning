const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['document', 'presentation', 'video', 'audio', 'image', 'exercise'],
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: String,
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: Number,
  fileType: String,
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 添加全文搜索索引
resourceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource; 